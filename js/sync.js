/**
 * Vica Domino - Cloud Sync Layer (Firebase)
 *
 * This script monkey-patches localStorage so that every setItem / removeItem
 * also triggers a debounced upload of ALL app data to Firebase Firestore.
 *
 * On page load, if a user is logged in, we pull their data from Firestore
 * and populate localStorage before the rest of the app initialises.
 *
 * IMPORTANT: This file must be loaded AFTER firebase-config.js and the
 * Firebase SDK scripts, but BEFORE all other app scripts.
 */

/* global window, document, localStorage, setTimeout, clearTimeout, firebase, FIREBASE_CONFIG, SUPERUSERS */

(function () {
    'use strict';

    // ---- Configuration ----
    // Push debounce: short enough that small saves (drag a card, toggle a
    // dot) don't get lost when the user immediately reloads / closes the
    // tab, but long enough to batch a rapid burst of writes (multi-card
    // drag, M-group create, …) into one Firestore batch.
    var SYNC_DEBOUNCE_MS = 350;
    var META_KEY = '__sync_userId'; // localStorage key that stores the logged-in user id
    var ROLE_KEY = '__sync_userRole'; // localStorage key for the user's role

    // ---- Internal state ----
    var _syncTimer   = null;
    var _userId      = null;
    var _userRole    = null; // 'superuser' or 'player'
    var _syncing     = false;
    var _pendingSync = false;
    var _db          = null; // Firestore instance
    var _firebaseReady = false;

    // Keep references to the ORIGINAL localStorage methods
    var _origSetItem    = localStorage.setItem.bind(localStorage);
    var _origGetItem    = localStorage.getItem.bind(localStorage);
    var _origRemoveItem = localStorage.removeItem.bind(localStorage);

    // DEVICE-LOCAL UI preferences ("vica_bg*": Big Game Play/Scan mode, the
    // device-preview selection + tablet orientation; "vica_inputMode": the
    // TOUCH/MOUSE toggle). These are per-device and
    // must NEVER sync — and crucially must NOT be wiped by a cloud pull. A
    // same-origin preview <iframe> shares this localStorage, so its own login
    // pull was clearing the parent's vica_bgDevice mid-preview (the selected
    // device "forgot itself" after one play). Treated like META/ROLE: never
    // uploaded, never removed on replace.
    function _isLocalOnlyKey(k) { return !!k && (k.indexOf('vica_bg') === 0 || k === 'vica_inputMode'); }

    // ---- Firebase init ----

    function _initFirebase() {
        if (_firebaseReady) return true;
        try {
            if (typeof firebase === 'undefined' || !FIREBASE_CONFIG || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
                console.warn('[Sync] Firebase not configured. Running in offline mode.');
                return false;
            }
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            _db = firebase.firestore();
            _firebaseReady = true;
            return true;
        } catch (e) {
            console.error('[Sync] Firebase init failed:', e);
            alert('[Sync] Firebase init failed: ' + (e.message || e));
            return false;
        }
    }

    // ---- Helpers ----

    /** Collect every localStorage key-value pair EXCEPT our own meta keys. */
    function _getAllAppData() {
        var data = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key === META_KEY || key === ROLE_KEY) continue;
            // Skip keys starting with __ (reserved in Firestore)
            if (key.indexOf('__') === 0) continue;
            // Device-local UI prefs are never uploaded.
            if (_isLocalOnlyKey(key)) continue;
            var val = _origGetItem(key);
            // Skip null/undefined values (Firestore rejects undefined)
            if (val === null || val === undefined) continue;
            data[key] = val;
        }
        return data;
    }

    /**
     * Firestore has a 1 MB document limit. We store all data as a JSON
     * string to avoid field-name restrictions (Firestore rejects keys
     * with dots, keys starting with __, etc.).
     *
     * The JSON string is split into ~800 KB string chunks stored as
     * subcollection documents to stay under the document size limit.
     */
    var MAX_CHUNK_BYTES = 800000; // ~800 KB per chunk document

    /** Upload all data to Firestore. */
    // Superuser cloud-sync (read/write users/**) is allowed ONLY when the page is
    // Firebase-signed-in as a SUPERUSER_EMAIL — this matches the Firestore rules,
    // so the name-based "Vica" session alone never attempts a sync it can't make
    // (which would throw permission-denied). Tester surfaces (gallery, published
    // player) set window._syncSuppressSuperuser to opt out entirely.
    function _canSuperuserSync() {
        if (window._syncSuppressSuperuser) return false;
        if (_userRole !== 'superuser') return false;
        try {
            var u = firebase.auth && firebase.auth().currentUser;
            var emails = (typeof SUPERUSER_EMAILS !== 'undefined') ? SUPERUSER_EMAILS : [];
            return !!(u && u.email && emails.indexOf(u.email) !== -1);
        } catch (e) { return false; }
    }
    function _pushToServer() {
        if (!_userId || !_firebaseReady || !_db) return;
        if (!_isValidFirestoreId(_userId)) return;
        if (!_canSuperuserSync()) return; // only the Firebase-authed owner writes data
        if (_syncing) { _pendingSync = true; return; }
        _syncing = true;
        _setSyncStatus('syncing');

        try {
            var data = _getAllAppData();
            // Serialize all data as a single JSON string
            var jsonStr = JSON.stringify(data);

            // Split into string chunks that fit within Firestore document limits
            var chunks = [];
            for (var i = 0; i < jsonStr.length; i += MAX_CHUNK_BYTES) {
                chunks.push(jsonStr.slice(i, i + MAX_CHUNK_BYTES));
            }
            if (chunks.length === 0) chunks.push('{}');

            var userDoc = _db.collection('users').doc(_userId);
            var batch = _db.batch();

            // Write metadata
            var timestamp;
            try {
                timestamp = firebase.firestore.FieldValue.serverTimestamp();
            } catch (e) {
                timestamp = new Date().toISOString();
            }
            batch.set(userDoc, {
                lastUpdated: timestamp,
                chunkCount: chunks.length,
                format: 'json-v2'
            });

            // Write each chunk as a single "data" field
            for (var c = 0; c < chunks.length; c++) {
                var chunkRef = userDoc.collection('chunks').doc('chunk_' + c);
                batch.set(chunkRef, { data: chunks[c] });
            }

            batch.commit()
                .then(function () {
                    // Clean up old chunks that are no longer needed
                    return userDoc.collection('chunks').get();
                })
                .then(function (snapshot) {
                    if (!snapshot) return;
                    var deleteBatch = _db.batch();
                    var hasDeletes = false;
                    snapshot.forEach(function (doc) {
                        var idx = parseInt(doc.id.replace('chunk_', ''), 10);
                        if (idx >= chunks.length) {
                            deleteBatch.delete(doc.ref);
                            hasDeletes = true;
                        }
                    });
                    if (hasDeletes) return deleteBatch.commit();
                })
                .then(function () {
                    _setSyncStatus('saved');
                })
                .catch(function (err) {
                    console.error('[Sync] Push failed:', err);
                    var detail = err.code ? (err.code + ': ' + err.message) : (err.message || String(err));
                    // permission-denied here means this session isn't the Firebase-authed
                    // owner — expected, and data stays safe locally (LOCAL-WINS). Show the
                    // benign "Offline" state, not a red "Sync error". Real failures (network,
                    // quota, …) still surface as an error.
                    var _denied = err && (err.code === 'permission-denied' || /permission/i.test(err.message || err.toString() || ''));
                    if (_denied) _setSyncStatus('offline');
                    else _setSyncStatus('error', 'Push: ' + detail);
                })
                .finally(function () {
                    _syncing = false;
                    if (_pendingSync) {
                        _pendingSync = false;
                        _schedulePush();
                    }
                });
        } catch (err) {
            console.error('[Sync] Push error (sync):', err);
            _setSyncStatus('error', 'Push: ' + (err.message || err));
            _syncing = false;
        }
    }

    /** Check if a userId is valid for Firestore (not reserved). */
    function _isValidFirestoreId(id) {
        return id && id.indexOf('__') !== 0;
    }

    /** Pull all data from Firestore for a given user. Returns a promise with the data object. */
    function _pullFromServer(userId) {
        if (!_firebaseReady || !_db) return Promise.reject(new Error('Firebase not ready'));
        if (!_isValidFirestoreId(userId)) return Promise.resolve({});

        var userDoc = _db.collection('users').doc(userId);
        return userDoc.get().then(function (doc) {
            if (!doc.exists) return {};

            var meta = doc.data();
            var chunkCount = meta.chunkCount || 0;
            if (chunkCount === 0) return {};
            var isJsonV2 = meta.format === 'json-v2';

            // Fetch all chunks
            return userDoc.collection('chunks').get().then(function (snapshot) {
                if (isJsonV2) {
                    // New format: chunks contain a single "data" field with JSON string pieces
                    var parts = [];
                    snapshot.forEach(function (chunkDoc) {
                        var idx = parseInt(chunkDoc.id.replace('chunk_', ''), 10);
                        parts[idx] = chunkDoc.data().data || '';
                    });
                    var jsonStr = parts.join('');
                    try {
                        return JSON.parse(jsonStr);
                    } catch (e) {
                        console.error('[Sync] Failed to parse JSON data:', e);
                        return {};
                    }
                }
                // Legacy format: each chunk field is a key-value pair
                var allData = {};
                snapshot.forEach(function (chunkDoc) {
                    var chunkData = chunkDoc.data();
                    Object.keys(chunkData).forEach(function (k) {
                        allData[k] = chunkData[k];
                    });
                });
                return allData;
            });
        });
    }

    function _schedulePush() {
        if (_syncTimer) clearTimeout(_syncTimer);
        _syncTimer = setTimeout(_pushToServer, SYNC_DEBOUNCE_MS);
    }

    /** Update the tiny sync-status indicator in the UI (if it exists). */
    function _setSyncStatus(status, detail) {
        var el = document.getElementById('sync-status');
        if (!el) return;
        if (status === 'syncing') {
            el.textContent = 'Syncing\u2026';
            el.className   = 'sync-status syncing';
        } else if (status === 'saved') {
            el.textContent = 'Saved';
            el.className   = 'sync-status saved';
        } else if (status === 'error') {
            el.textContent = detail ? ('Sync error: ' + detail) : 'Sync error';
            el.className   = 'sync-status error';
        } else if (status === 'offline') {
            el.textContent = 'Offline';
            el.className   = 'sync-status offline';
        } else {
            el.textContent = '';
            el.className   = 'sync-status';
        }
    }

    /** Check if a user name is a superuser. */
    function _isSuperuser(name) {
        if (typeof SUPERUSERS === 'undefined') return true; // No list = everyone is super
        for (var i = 0; i < SUPERUSERS.length; i++) {
            if (SUPERUSERS[i] === name) return true;
        }
        return false;
    }

    /** Apply role-based UI visibility. */
    function _applyRoleUI() {
        // Elements that should only be visible to superusers
        var superuserElements = [
            document.getElementById('mpp-start-btn')
        ];

        for (var i = 0; i < superuserElements.length; i++) {
            if (superuserElements[i]) {
                superuserElements[i].style.display = (_userRole === 'superuser') ? '' : 'none';
            }
        }

        // Admin role button on intro screen: visible to all users
        // (superuser-only restriction removed — admin flow handles its own access)
    }

    // ---- Monkey-patch localStorage ----

    localStorage.setItem = function (key, value) {
        _origSetItem(key, value);
        if (key !== META_KEY && key !== ROLE_KEY && !_isLocalOnlyKey(key) && _userId && _userRole === 'superuser') {
            _schedulePush();
        }
    };

    localStorage.removeItem = function (key) {
        _origRemoveItem(key);
        if (key !== META_KEY && key !== ROLE_KEY && !_isLocalOnlyKey(key) && _userId && _userRole === 'superuser') {
            _schedulePush();
        }
    };

    // ---- Public API (attached to window) ----

    /**
     * Log in: pull data from Firestore and merge with localStorage.
     *
     * IMPORTANT: If Firestore has NO data for this user (first login for superuser),
     * we KEEP everything already in localStorage and UPLOAD it to Firestore.
     * This ensures existing cards, games, and settings are never lost.
     *
     * If Firestore DOES have data, the cloud version wins (cross-device truth)
     * — localStorage is replaced with it.
     *
     * For regular players: data is pulled but never pushed (read-only).
     *
     * Returns a Promise that resolves when data is ready.
     */
    // Fire once the cloud pull (or offline restore) has settled, so the app can run
    // post-sync work (e.g. Phase 1 sharedArtId migration) on the FINAL data — a
    // parse-time pass alone would be clobbered by the login pull. Reusable hook.
    function _fireDataReady() {
        try { window.dispatchEvent(new CustomEvent('vica-data-ready')); } catch (e) {}
    }

    window.syncLogin = function (userId) {
        // Sanitize reserved Firestore ids (e.g. legacy "__player__")
        if (userId && userId.indexOf('__') === 0) {
            userId = userId.replace(/^_+/, '').replace(/_+$/, '') || 'player-guest';
        }
        _userId = userId;
        _userRole = _isSuperuser(userId) ? 'superuser' : 'player';
        _origSetItem(META_KEY, userId);
        _origSetItem(ROLE_KEY, _userRole);

        // Apply role UI immediately
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            _applyRoleUI();
        } else {
            document.addEventListener('DOMContentLoaded', _applyRoleUI);
        }

        if (!_initFirebase()) {
            _setSyncStatus('offline');
            return Promise.resolve();
        }

        _setSyncStatus('syncing');

        // Snapshot current localStorage BEFORE we touch anything
        var localSnapshot = _getAllAppData();

        return _pullFromServer(userId)
            .then(function (serverData) {
                var serverHasData = Object.keys(serverData).length > 0;

                if (serverHasData) {
                    // Cloud has data — use it (cross-device truth).
                    // Safety: preserve local card data if cloud version is empty.
                    // Protect ALL card-related keys (customDrawnCards, customDrawnCards_abc,
                    // customDrawnCards_<AnySetName>, cardMakerVariations, cardArrangement*)
                    var _preservedCards = {};
                    for (var _ci = 0; _ci < localStorage.length; _ci++) {
                        var ck = localStorage.key(_ci);
                        if (!ck) continue;
                        // Protect all card data keys
                        var isCardKey = (ck.indexOf('customDrawnCards') === 0) ||
                                        (ck === 'cardMakerVariations') ||
                                        (ck.indexOf('cardArrangement') === 0) ||
                                        (ck === 'abcCardSnapshot');
                        if (!isCardKey) continue;
                        var localVal = _origGetItem(ck);
                        if (!localVal) continue;
                        try {
                            var localArr = JSON.parse(localVal);
                            if (!Array.isArray(localArr) && typeof localArr !== 'object') continue;
                            if (Array.isArray(localArr) && localArr.length === 0) continue;
                            // Local has data — check if cloud would wipe it
                            var serverVal = serverData[ck];
                            if (!serverVal) {
                                // Cloud is missing this key entirely — preserve local
                                _preservedCards[ck] = localVal;
                            } else {
                                try {
                                    var serverArr = JSON.parse(serverVal);
                                    if (Array.isArray(serverArr) && serverArr.length === 0) {
                                        // Cloud has empty array — preserve local cards
                                        _preservedCards[ck] = localVal;
                                    }
                                } catch(e2) {}
                            }
                        } catch(e) {}
                    }

                    // LOCAL-WINS keys: user-authored, device-local-authoritative
                    // data that must NOT be rolled back by an OLDER cloud
                    // snapshot. Page names + the three game stores were being
                    // silently reverted because sync treats cloud as truth and
                    // only protected CARD keys (so a stale-but-non-empty cloud
                    // overwrote newer local work — e.g. "GPm F Setup" reverting
                    // to the pre-model "GP F23"). Here we keep the LOCAL copy
                    // whenever it has data, so an established device never loses
                    // its work. A FRESH device (empty local) still pulls cloud
                    // normally. Trade-off: edits to these keys don't propagate
                    // device→device (acceptable for single-superuser editing).
                    // The Studio-authored CARD-SIDE stores (uid-keyed objects) belong
                    // here too. They were protected by NOTHING: not card keys (the
                    // name doesn't start with customDrawnCards), not local-wins — so
                    // the wipe+restore above rolled every one of them back to the
                    // cloud snapshot on each login. Symptom (user report July 14): a
                    // parameter's space-box "digit space" reserve un-checked ITSELF
                    // after Save — the older cloud copy still had B with its value
                    // set but no width, so the set survived and only the newest edit
                    // vanished. Anything not yet pushed (push denied for a non-authed
                    // session, or simply still inside the 350 ms debounce when the
                    // page reloads) was silently lost. Same trade-off as the game
                    // stores: device-local-authoritative, so edits don't propagate
                    // device→device; a fresh/empty device still pulls cloud normally.
                    var _localWinsKeys = ['pageNameLabels_gp2', 'savedCustomGames', 'savedCatchGames', 'savedCombinedGames', 'savedBigGames', 'savedMathGames', 'vica_global_players',
                        'cardMathParams_v1',   // Par: parameters, rules + space-box widths
                        'cardMathFormula_v1',  // f-formula per card
                        'cardMathRel_v1',      // card↔card relations
                        'cardAnswerLinks_v1',  // problem↔answer card links
                        'cardNoteLinks_v1',    // note↔card bonds
                        'gameNoteLegends_v1'   // per-game note legends
                    ];
                    _localWinsKeys.forEach(function (lk) {
                        var lv = _origGetItem(lk);
                        if (!lv) return;
                        try {
                            var parsed = JSON.parse(lv);
                            var hasData = Array.isArray(parsed) ? parsed.length > 0
                                        : (parsed && typeof parsed === 'object') ? Object.keys(parsed).length > 0
                                        : false;
                            if (hasData) _preservedCards[lk] = lv;
                        } catch (e) {}
                    });

                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        // Keep META/ROLE and device-local UI prefs (vica_bg*).
                        if (k !== META_KEY && k !== ROLE_KEY && !_isLocalOnlyKey(k)) keysToRemove.push(k);
                    }
                    keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                    Object.keys(serverData).forEach(function (k) {
                        // Never let a (possibly stale) cloud copy overwrite a
                        // device-local UI pref (vica_bg*) — local always wins.
                        if (_isLocalOnlyKey(k)) return;
                        _origSetItem(k, serverData[k]);
                    });

                    // Restore preserved local data (card keys + local-wins keys)
                    // that the cloud overwrite would otherwise have clobbered.
                    Object.keys(_preservedCards).forEach(function (ck) {
                        _origSetItem(ck, _preservedCards[ck]);
                        console.warn('[Sync] Kept local data for "' + ck + '" (not overwritten by cloud)');
                    });

                    _setSyncStatus('saved');
                } else if (_userRole === 'superuser') {
                    // Cloud is empty for this superuser (first login).
                    // KEEP existing localStorage and upload it as backup.
                    if (Object.keys(localSnapshot).length > 0) {
                        _setSyncStatus('syncing');
                        _syncing = false; // Allow push
                        _pushToServer();
                    } else {
                        _setSyncStatus('saved');
                    }
                } else {
                    // Regular player, no data in cloud — load from any superuser
                    return _loadSharedData();
                }
            })
            .then(function () {
                // Start periodic card backup after successful login
                if (_canSuperuserSync()) _startCardBackupTimer();
                _fireDataReady(); // cloud pull/restore settled — run post-sync migrations
            })
            .catch(function (err) {
                console.error('[Sync] Login pull failed:', err);
                // permission-denied is EXPECTED when not Firebase-authed as the
                // owner (e.g. localhost without sign-in) — don't block with an
                // alert; keep working from the local snapshot below.
                console.warn('[Sync] ' + (err.code || '') + ' ' + (err.message || err) + ' — using local data.');
                // Offline — restore the local snapshot so nothing is lost
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    // Keep META/ROLE and device-local UI prefs (vica_bg*).
                    if (k !== META_KEY && k !== ROLE_KEY && !_isLocalOnlyKey(k)) keysToRemove.push(k);
                }
                keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                Object.keys(localSnapshot).forEach(function (k) {
                    _origSetItem(k, localSnapshot[k]);
                });

                // permission-denied here is EXPECTED (a non-owner / not-Firebase-authed
                // session, e.g. localhost or the name-based Vica session) and is already
                // handled by working from the local snapshot above. Showing a red
                // "Sync error" for it is misleading — surface it as the benign "Offline"
                // (local-only) state instead. Real failures still show the error.
                var _denied = err && (err.code === 'permission-denied' || /permission/i.test(err.message || err.toString() || ''));
                _setSyncStatus(_denied ? 'offline' : 'error');
                _fireDataReady(); // offline: local data restored — still "ready"
            });
    };

    /**
     * For regular players: load the shared game data from the first superuser found.
     * Players get the cards and games but cannot modify them.
     */
    function _loadSharedData() {
        if (!_db) return Promise.resolve();

        // Try to load data from each superuser until we find one with data
        var superusers = (typeof SUPERUSERS !== 'undefined') ? SUPERUSERS : [];
        if (superusers.length === 0) {
            _setSyncStatus('saved');
            return Promise.resolve();
        }

        // Load from first superuser
        return _pullFromServer(superusers[0])
            .then(function (data) {
                if (Object.keys(data).length > 0) {
                    // Preserve the device-local global player config: it's the
                    // user's OWN player setup (names/icons/count), not shared
                    // authored content, so it must survive the cloud pull for
                    // players too (local-wins). A fresh device (empty local)
                    // still falls through to the cloud value below.
                    var _localCfg = _origGetItem('vica_global_players');

                    // Load the superuser's shared data (games, cards, etc.)
                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        // Keep META/ROLE and device-local UI prefs (vica_bg*).
                        if (k !== META_KEY && k !== ROLE_KEY && !_isLocalOnlyKey(k)) keysToRemove.push(k);
                    }
                    keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                    Object.keys(data).forEach(function (k) {
                        // Device-local UI prefs (vica_bg*) are never overwritten
                        // by shared/cloud data — local always wins.
                        if (_isLocalOnlyKey(k)) return;
                        _origSetItem(k, data[k]);
                    });

                    // Restore the local global player config when it has data.
                    if (_localCfg) {
                        try {
                            var _p = JSON.parse(_localCfg);
                            var _has = _p && typeof _p === 'object' &&
                                (Array.isArray(_p.players) ? _p.players.length > 0
                                                           : Object.keys(_p).length > 0);
                            if (_has) _origSetItem('vica_global_players', _localCfg);
                        } catch (e) {}
                    }
                }
                _setSyncStatus('saved');
            })
            .catch(function (err) {
                _setSyncStatus('error', 'Shared: ' + (err.code || err.message || err));
            });
    }

    /**
     * Log out: stop syncing (but keep local data so the user doesn't lose
     * anything mid-session).
     */
    window.syncLogout = function () {
        _userId = null;
        _userRole = null;
        _origRemoveItem(META_KEY);
        _origRemoveItem(ROLE_KEY);
        if (_syncTimer) clearTimeout(_syncTimer);
        _setSyncStatus('');
        _applyRoleUI();
    };

    /** Returns the currently logged-in user id, or null. */
    window.syncGetUserId = function () {
        return _userId;
    };

    /** Returns the current user's role: 'superuser', 'player', or null. */
    window.syncGetUserRole = function () {
        return _userRole;
    };

    /** Returns true if the current user is a superuser. */
    window.syncIsSuperuser = function () {
        return _userRole === 'superuser';
    };

    /**
     * Force an immediate push (e.g. before page unload).
     */
    window.syncNow = function () {
        if (_syncTimer) clearTimeout(_syncTimer);
        _pushToServer();
    };

    // ---- Auto-backup card data to Firebase every 20 minutes ----
    var BACKUP_INTERVAL = 20 * 60 * 1000; // 20 minutes
    var MAX_BACKUPS = 3; // Keep only the last 3 backups
    var _backupTimer = null;

    function _getCardBackupData() {
        var backup = {};
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (!k) continue;
            if (k.indexOf('customDrawnCards') === 0 ||
                k === 'cardMakerVariations' ||
                k.indexOf('cardArrangement') === 0 ||
                k === 'abcCardSnapshot' ||
                k === 'savedCardSets' ||
                k === 'deletedBuiltinSets' ||
                // GAMES (added June 9 2026): these were NOT backed up before, so a
                // game-data corruption (e.g. the A-Z "shifted rows" incident) had no
                // restore point. Now the last-3 timestamped card_backups include the
                // games too. They're local-wins keys (see sync _localWinsKeys), so a
                // restore here is the authoritative recovery path.
                k === 'savedCustomGames' ||
                k === 'savedCatchGames' ||
                k === 'savedCombinedGames' ||
                k === 'savedBigGames' ||   // Phase 3: Big Games (legend-based stage sequences)
                k === 'savedMathGames') {  // Math Problems worksheet games (July 2026)
                backup[k] = _origGetItem(k);
            }
        }
        return backup;
    }

    function _pushCardBackup() {
        if (!_userId || !_firebaseReady || !_db) return;
        if (_userRole !== 'superuser') return;

        var backup = _getCardBackupData();
        if (Object.keys(backup).length === 0) return;

        var jsonStr = JSON.stringify(backup);
        var chunks = [];
        for (var i = 0; i < jsonStr.length; i += MAX_CHUNK_BYTES) {
            chunks.push(jsonStr.slice(i, i + MAX_CHUNK_BYTES));
        }
        if (chunks.length === 0) chunks.push('{}');

        var backupsRef = _db.collection('users').doc(_userId).collection('card_backups');
        var docId = new Date().toISOString().replace(/[:.]/g, '-');
        var backupDoc = backupsRef.doc(docId);

        var batch = _db.batch();
        batch.set(backupDoc, {
            timestamp: new Date().toISOString(),
            chunkCount: chunks.length
        });
        for (var c = 0; c < chunks.length; c++) {
            batch.set(backupDoc.collection('chunks').doc('chunk_' + c), { data: chunks[c] });
        }

        batch.commit()
        .then(function () {
            console.log('[Sync] Card backup saved:', docId, '(' + chunks.length + ' chunks, ' + jsonStr.length + ' bytes)');
            // Clean up old backups, keep only the last MAX_BACKUPS
            return backupsRef.orderBy('timestamp', 'desc').get();
        })
        .then(function (snapshot) {
            if (!snapshot || snapshot.size <= MAX_BACKUPS) return;
            var deletePromises = [];
            var count = 0;
            snapshot.forEach(function (doc) {
                count++;
                if (count > MAX_BACKUPS) {
                    // Delete chunk subcollection first, then the parent doc
                    deletePromises.push(
                        doc.ref.collection('chunks').get().then(function (chunksSnap) {
                            var delBatch = _db.batch();
                            chunksSnap.forEach(function (chunkDoc) { delBatch.delete(chunkDoc.ref); });
                            delBatch.delete(doc.ref);
                            return delBatch.commit();
                        })
                    );
                }
            });
            if (deletePromises.length > 0) return Promise.all(deletePromises);
        })
        .catch(function (err) {
            console.error('[Sync] Card backup failed:', err);
        });
    }

    function _startCardBackupTimer() {
        if (_backupTimer) clearInterval(_backupTimer);
        _backupTimer = setInterval(_pushCardBackup, BACKUP_INTERVAL);
        // Also do an initial backup after 30 seconds (give sync time to settle)
        setTimeout(_pushCardBackup, 30000);
    }

    /**
     * List available card backups from Firebase.
     * Returns a promise with array of { id, timestamp } objects.
     */
    window.syncListCardBackups = function () {
        if (!_userId || !_firebaseReady || !_db) return Promise.resolve([]);
        return _db.collection('users').doc(_userId).collection('card_backups')
            .orderBy('timestamp', 'desc').get()
            .then(function (snapshot) {
                var list = [];
                snapshot.forEach(function (doc) {
                    var d = doc.data();
                    list.push({ id: doc.id, timestamp: d.timestamp });
                });
                return list;
            })
            .catch(function () { return []; });
    };

    /**
     * Restore card data from a specific backup.
     * Returns a promise that resolves when done.
     */
    window.syncRestoreCardBackup = function (backupId) {
        if (!_userId || !_firebaseReady || !_db) return Promise.reject('Not connected');
        var backupDoc = _db.collection('users').doc(_userId).collection('card_backups').doc(backupId);
        return backupDoc.get()
            .then(function (doc) {
                if (!doc.exists) throw new Error('Backup not found');
                var meta = doc.data();

                // Old format: single document with all data in "data" field
                if (meta.data) {
                    return JSON.parse(meta.data);
                }

                // New chunked format
                var chunkCount = meta.chunkCount || 0;
                if (chunkCount === 0) throw new Error('Empty backup');

                return backupDoc.collection('chunks').get().then(function (snapshot) {
                    var parts = [];
                    snapshot.forEach(function (chunkDoc) {
                        var idx = parseInt(chunkDoc.id.replace('chunk_', ''), 10);
                        parts[idx] = chunkDoc.data().data || '';
                    });
                    return JSON.parse(parts.join(''));
                });
            })
            .then(function (backup) {
                var keys = Object.keys(backup);
                keys.forEach(function (k) {
                    localStorage.setItem(k, backup[k]);
                });
                console.log('[Sync] Restored card backup:', backupId, '(' + keys.length + ' keys)');
                return keys.length;
            });
    };

    /**
     * Get list of existing users from Firestore.
     * Returns a promise with an array of user id strings.
     */
    window.syncGetUsers = function () {
        if (!_firebaseReady || !_db) return Promise.resolve([]);
        return _db.collection('users').get()
            .then(function (snapshot) {
                var users = [];
                snapshot.forEach(function (doc) {
                    users.push(doc.id);
                });
                return users;
            })
            .catch(function () {
                return [];
            });
    };

    // ---- Publishing: the `published/*` collection (shareable mini-games) ----
    // A published mini-game is stored as ONE doc: light metadata on top (for the
    // gallery list) + the whole self-contained bundle as a JSON string in `json`
    // (stringifying sidesteps Firestore's nested-array / undefined-value rules,
    // and the bundle is ~tens of KB, well under the 1MB doc limit). Writes are
    // superuser-only; reads are open to any signed-in tester (enforced by the
    // Firestore security rules — see docs/PUBLISHING_PLAN.md). Separate from the
    // private users/{id} game library: testers can read published/* and nothing else.
    // Is a Firebase-Auth user signed in? (The real gate for publishing — the
    // Firestore rules enforce WHICH email may write; this is the client check.)
    function _pubAuthUser() { try { return (firebase.auth && firebase.auth().currentUser) || null; } catch (e) { return null; } }
    window.syncPublishPut = function (id, bundle) {
        if (!id || !bundle) return Promise.reject(new Error('publish: id and bundle required'));
        if (!_firebaseReady || !_db) return Promise.reject(new Error('publish: Firebase not ready'));
        if (!_pubAuthUser()) return Promise.reject(new Error('publish: sign in to Firebase first'));
        var doc = {
            publishId: id,
            schema: bundle.schema || null,
            version: bundle.version || 1,
            engineVersion: bundle.engineVersion || null,
            name: (bundle.source && bundle.source.miniGameName) || 'Mini-game',
            gameType: (bundle.source && bundle.source.gameType) || 'find',
            publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
            publishedBy: _userId || null,
            json: JSON.stringify(bundle)
        };
        return _db.collection('published').doc(id).set(doc).then(function () { return id; });
    };
    window.syncPublishRemove = function (id) {
        if (!id) return Promise.reject(new Error('publish: id required'));
        if (!_firebaseReady || !_db) return Promise.reject(new Error('publish: Firebase not ready'));
        if (!_pubAuthUser()) return Promise.reject(new Error('publish: sign in to Firebase first'));
        return _db.collection('published').doc(id).delete();
    };
    // ---- Firebase Auth (email/password) — testers + sign-in-to-publish ----
    window.syncAuthUser = function () { return _pubAuthUser(); };
    window.syncAuthSignIn = function (email, password) {
        if (!_firebaseReady) return Promise.reject(new Error('Firebase not ready'));
        if (!firebase.auth) return Promise.reject(new Error('Auth SDK not loaded'));
        return firebase.auth().signInWithEmailAndPassword(email, password);
    };
    window.syncAuthSignOut = function () { try { return firebase.auth().signOut(); } catch (e) { return Promise.resolve(); } };
    window.syncAuthOnChange = function (cb) { try { return firebase.auth().onAuthStateChanged(cb); } catch (e) { return function () {}; } };
    // Read one published bundle (parsed). Any signed-in user may call.
    window.syncPublishGet = function (id) {
        if (!id) return Promise.reject(new Error('publish: id required'));
        if (!_firebaseReady || !_db) return Promise.reject(new Error('publish: Firebase not ready'));
        return _db.collection('published').doc(id).get().then(function (doc) {
            if (!doc.exists) return null;
            var d = doc.data() || {};
            try { return JSON.parse(d.json || 'null'); } catch (e) { return null; }
        });
    };
    // List published games (metadata only — no `json`) for the gallery.
    window.syncPublishList = function () {
        if (!_firebaseReady || !_db) return Promise.resolve([]);
        return _db.collection('published').get().then(function (snap) {
            var out = [];
            snap.forEach(function (doc) {
                var d = doc.data() || {};
                out.push({
                    publishId: d.publishId || doc.id,
                    name: d.name || 'Mini-game',
                    gameType: d.gameType || 'find',
                    engineVersion: d.engineVersion || null,
                    publishedAt: (d.publishedAt && d.publishedAt.toMillis) ? d.publishedAt.toMillis() : null
                });
            });
            return out;
        }).catch(function () { return []; });
    };

    // Initialize Firebase as soon as this script loads (idempotent). The main app
    // also inits via syncLogin, but pages that DON'T call syncLogin — e.g.
    // gallery.html (tester sign-in only) — need Firebase ready for syncAuth*/
    // syncPublish*. Without this, the gallery's sign-in rejected with "Firebase
    // not ready" and showed "Sign-in failed".
    _initFirebase();

    // ---- Auto-login on page load ----

    _userId = _origGetItem(META_KEY) || null;
    // Clean up legacy reserved ids (e.g. "__player__")
    if (_userId && _userId.indexOf('__') === 0) {
        _userId = _userId.replace(/^_+/, '').replace(/_+$/, '') || 'player-guest';
        _origSetItem(META_KEY, _userId);
    }
    _userRole = _origGetItem(ROLE_KEY) || null;

    // If we have a userId but no role, determine it
    if (_userId && !_userRole) {
        _userRole = _isSuperuser(_userId) ? 'superuser' : 'player';
        _origSetItem(ROLE_KEY, _userRole);
    }

    // Apply role UI when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        _applyRoleUI();
    } else {
        document.addEventListener('DOMContentLoaded', _applyRoleUI);
    }

    // Start card backup timer once Firebase-authed as the owner (waits for the
    // async auth-state restore; gives up after 30s if never authorized).
    if (_userId && _userRole === 'superuser') {
        var _fbWait = setInterval(function () {
            if (_firebaseReady && _db && _canSuperuserSync()) {
                clearInterval(_fbWait);
                _startCardBackupTimer();
            }
        }, 2000);
        // Stop waiting after 30 seconds
        setTimeout(function () { clearInterval(_fbWait); }, 30000);
    }

    // Try to sync on page unload (superusers only). Two things happen:
    //
    //   1. If a debounced push is pending in _syncTimer, cancel the
    //      timer and trigger immediately. That's the window where
    //      drag-saves were being lost: user did a drag, the 350ms timer
    //      was still counting down, they reloaded, the pending push
    //      never fired, and the next pull replaced their local changes
    //      with the stale cloud version. Firebase's batched write is
    //      async — best-effort, but the request usually departs.
    //
    //   2. Show a native browser confirm dialog if there's still
    //      anything in flight (timer pending OR a push actively running)
    //      so the user knows that closing now risks losing the change.
    //      Modern Chrome/Firefox ignore the custom message and show a
    //      generic warning instead, but setting returnValue is still
    //      what triggers the dialog at all.
    window.addEventListener('beforeunload', function (e) {
        // Tester surfaces (gallery, published player) set this — they make no
        // edits, so the "changes may not be saved" guard must never fire there,
        // even if the browser still carries a stale name-based superuser session
        // on this domain.
        if (window._syncSuppressUnloadGuard) return;
        if (_canSuperuserSync()) {
            var hadTimer = !!_syncTimer;
            if (_syncTimer) { clearTimeout(_syncTimer); _syncTimer = null; }
            // Flush whatever was queued.
            if (hadTimer) _pushToServer();
            // If something is still in flight (the just-fired push, or a
            // push that was already running), warn the user.
            if (_syncing || hadTimer) {
                var msg = 'Your latest changes are still syncing. Close anyway?';
                e.preventDefault();
                e.returnValue = msg;
                return msg;
            }
        }
    });
})();
