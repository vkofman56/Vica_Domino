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
    var SYNC_DEBOUNCE_MS = 2000;   // wait 2 s after last write before syncing
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
    function _pushToServer() {
        if (!_userId || !_firebaseReady || !_db) return;
        if (!_isValidFirestoreId(_userId)) return;
        if (_userRole !== 'superuser') return; // Only superusers write data
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
                    _setSyncStatus('error', 'Push: ' + detail);
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
        if (key !== META_KEY && key !== ROLE_KEY && _userId && _userRole === 'superuser') {
            _schedulePush();
        }
    };

    localStorage.removeItem = function (key) {
        _origRemoveItem(key);
        if (key !== META_KEY && key !== ROLE_KEY && _userId && _userRole === 'superuser') {
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
                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        if (k !== META_KEY && k !== ROLE_KEY) keysToRemove.push(k);
                    }
                    keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                    Object.keys(serverData).forEach(function (k) {
                        _origSetItem(k, serverData[k]);
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
            .catch(function (err) {
                console.error('[Sync] Login pull failed:', err);
                alert('[Sync] Error: ' + (err.code || '') + ' ' + (err.message || err));
                // Offline — restore the local snapshot so nothing is lost
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k !== META_KEY && k !== ROLE_KEY) keysToRemove.push(k);
                }
                keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                Object.keys(localSnapshot).forEach(function (k) {
                    _origSetItem(k, localSnapshot[k]);
                });

                _setSyncStatus('error');
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
                    // Load the superuser's shared data (games, cards, etc.)
                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        if (k !== META_KEY && k !== ROLE_KEY) keysToRemove.push(k);
                    }
                    keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                    Object.keys(data).forEach(function (k) {
                        _origSetItem(k, data[k]);
                    });
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

    // Try to sync on page unload (superusers only)
    window.addEventListener('beforeunload', function () {
        if (_userId && _userRole === 'superuser' && _firebaseReady) {
            // Fire off a final push attempt (best-effort)
            _pushToServer();
        }
    });
})();
