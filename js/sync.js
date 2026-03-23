/**
 * Vica Domino - Cloud Sync Layer
 *
 * This script monkey-patches localStorage so that every setItem / removeItem
 * also triggers a debounced upload of ALL app data to the server.
 *
 * On page load, if a user is logged in, we pull their data from the server
 * and populate localStorage before the rest of the app initialises.
 *
 * IMPORTANT: This file must be loaded BEFORE all other app scripts so the
 * patched localStorage methods are in place when shared-data.js, card-editor.js
 * etc. make their first calls.
 */

/* global window, document, fetch, localStorage, setTimeout, clearTimeout */

(function () {
    'use strict';

    // ---- Configuration ----
    var SYNC_DEBOUNCE_MS = 1500;   // wait 1.5 s after last write before syncing
    var META_KEY = '__sync_userId'; // localStorage key that stores the logged-in user id

    // ---- Internal state ----
    var _syncTimer  = null;
    var _userId     = null;
    var _syncing    = false;
    var _pendingSync = false;

    // Keep references to the ORIGINAL localStorage methods
    var _origSetItem    = localStorage.setItem.bind(localStorage);
    var _origGetItem    = localStorage.getItem.bind(localStorage);
    var _origRemoveItem = localStorage.removeItem.bind(localStorage);

    // ---- Helpers ----

    /** Collect every localStorage key-value pair EXCEPT our own meta key. */
    function _getAllAppData() {
        var data = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key === META_KEY) continue;
            data[key] = _origGetItem(key);
        }
        return data;
    }

    /** Upload all data to the server. */
    function _pushToServer() {
        if (!_userId) return;
        if (_syncing) { _pendingSync = true; return; }
        _syncing = true;
        _setSyncStatus('syncing');

        var data = _getAllAppData();

        fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: _userId, data: data })
        })
        .then(function (res) {
            if (!res.ok) throw new Error('sync failed');
            _setSyncStatus('saved');
        })
        .catch(function () {
            _setSyncStatus('error');
        })
        .finally(function () {
            _syncing = false;
            if (_pendingSync) {
                _pendingSync = false;
                _schedulePush();
            }
        });
    }

    function _schedulePush() {
        if (_syncTimer) clearTimeout(_syncTimer);
        _syncTimer = setTimeout(_pushToServer, SYNC_DEBOUNCE_MS);
    }

    /** Update the tiny sync-status indicator in the UI (if it exists). */
    function _setSyncStatus(status) {
        var el = document.getElementById('sync-status');
        if (!el) return;
        if (status === 'syncing') {
            el.textContent = 'Syncing…';
            el.className   = 'sync-status syncing';
        } else if (status === 'saved') {
            el.textContent = 'Saved';
            el.className   = 'sync-status saved';
        } else if (status === 'error') {
            el.textContent = 'Sync error';
            el.className   = 'sync-status error';
        } else {
            el.textContent = '';
            el.className   = 'sync-status';
        }
    }

    // ---- Monkey-patch localStorage ----

    localStorage.setItem = function (key, value) {
        _origSetItem(key, value);
        if (key !== META_KEY && _userId) _schedulePush();
    };

    localStorage.removeItem = function (key) {
        _origRemoveItem(key);
        if (key !== META_KEY && _userId) _schedulePush();
    };

    // ---- Public API (attached to window) ----

    /**
     * Log in: pull all data from the server and populate localStorage.
     * Returns a Promise that resolves when data is ready.
     */
    window.syncLogin = function (userId) {
        _userId = userId;
        _origSetItem(META_KEY, userId);

        _setSyncStatus('syncing');

        return fetch('/api/sync/' + encodeURIComponent(userId))
            .then(function (res) { return res.json(); })
            .then(function (body) {
                var data = body.data || {};

                // Clear existing app data from localStorage (keep meta key)
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k !== META_KEY) keysToRemove.push(k);
                }
                keysToRemove.forEach(function (k) { _origRemoveItem(k); });

                // Populate with server data
                Object.keys(data).forEach(function (k) {
                    _origSetItem(k, data[k]);
                });

                _setSyncStatus('saved');
            })
            .catch(function () {
                // Offline or first-time user — just keep whatever is in localStorage
                _setSyncStatus('error');
            });
    };

    /**
     * Log out: stop syncing (but keep local data so the user doesn't lose
     * anything mid-session).
     */
    window.syncLogout = function () {
        _userId = null;
        _origRemoveItem(META_KEY);
        if (_syncTimer) clearTimeout(_syncTimer);
        _setSyncStatus('');
    };

    /** Returns the currently logged-in user id, or null. */
    window.syncGetUserId = function () {
        return _userId;
    };

    /**
     * Force an immediate push (e.g. before page unload).
     */
    window.syncNow = function () {
        if (_syncTimer) clearTimeout(_syncTimer);
        _pushToServer();
    };

    // ---- Auto-login on page load ----

    _userId = _origGetItem(META_KEY) || null;

    // Try to sync on page unload
    window.addEventListener('beforeunload', function () {
        if (_userId) {
            // Use sendBeacon for reliability during page close
            var data = JSON.stringify({ userId: _userId, data: _getAllAppData() });
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/sync', new Blob([data], { type: 'application/json' }));
            }
        }
    });
})();
