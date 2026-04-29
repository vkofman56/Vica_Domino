/**
 * VoiceInput — Web Speech API wrapper for "Find the Doubles".
 *
 * Decoupled from the game on purpose: this module emits raw phrase events
 * with a position (1..4). The game decides whose turn it is and what to do
 * with the position. That way 2-player support later (separate mics, push-
 * to-talk, or speaker fingerprint) can replace the audio source without
 * touching the routing layer.
 *
 * Usage:
 *   var v = new VoiceInput({
 *     language: 'en' | 'es' | 'ru',
 *     maxPosition: 4,
 *     onPhrase: function(ev) { ... ev = { position: 1..4, raw: '...', confidence: 0..1 } },
 *     onError:  function(err) { ... err = { kind: 'unsupported' | 'permission' | 'runtime', detail } },
 *     onListeningChange: function(isListening) { ... },
 *   });
 *   if (!VoiceInput.isSupported()) { v.onError({kind:'unsupported'}); return; }
 *   v.start();   // requests mic permission, begins continuous recognition
 *   v.stop();    // releases the recognizer
 */
(function() {
    'use strict';

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Phrase synonyms per language. Keep keys lowercase, no diacritics where
    // recognizers tend to drop them; include common mishears (e.g., "forth"
    // for "fourth"). Numerals are catch-alls.
    var SYNONYMS = {
        en: {
            1: ['first', 'one', '1', '1st'],
            2: ['second', 'two', '2', '2nd'],
            3: ['third', 'three', '3', '3rd'],
            4: ['fourth', 'four', '4', '4th', 'forth']
        },
        es: {
            1: ['primero', 'primera', 'primer', 'uno', 'una', '1'],
            2: ['segundo', 'segunda', 'dos', '2'],
            3: ['tercero', 'tercera', 'tercer', 'tres', '3'],
            4: ['cuarto', 'cuarta', 'cuatro', '4']
        },
        ru: {
            1: ['первый', 'первая', 'первое', 'один', 'одна', '1'],
            2: ['второй', 'вторая', 'второе', 'два', 'две', '2'],
            3: ['третий', 'третья', 'третье', 'три', '3'],
            4: ['четвёртый', 'четвертый', 'четвёртая', 'четвертая', 'четвёртое', 'четвертое', 'четыре', '4']
        }
    };

    // Web Speech API language codes. Region matters less than the family;
    // a Spanish speaker on Mac with es-MX locale still hits es-ES well.
    var LANG_CODES = { en: 'en-US', es: 'es-ES', ru: 'ru-RU' };

    // Confidence floor — anything below is treated as noise. Some browsers
    // (Safari) return 0 for everything; in that case we accept any final.
    var CONFIDENCE_FLOOR = 0.4;

    function _normalize(s) {
        if (!s) return '';
        return String(s)
            .toLowerCase()
            .replace(/[.,!?;:'"()\[\]]/g, ' ')
            .replace(/\bthe\b/g, ' ')
            .replace(/\bel\b|\bla\b|\blos\b|\blas\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
    // Article-keeping variant for multi-word entries — if the admin puts
    // "the first" into the table, the user's "the first" must be matched
    // verbatim. Stripping articles would eat the entry's own "the".
    function _normalizeKeep(s) {
        if (!s) return '';
        return String(s)
            .toLowerCase()
            .replace(/[.,!?;:'"()\[\]]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function _matchPosition(text, table, maxPosition) {
        if (!table) return 0;
        var stripNorm = _normalize(text);
        var keepNorm = _normalizeKeep(text);
        if (!stripNorm && !keepNorm) return 0;
        var tokens = stripNorm ? stripNorm.split(' ') : [];
        // First match wins so a stray "second" buried after "first" doesn't
        // override the user's first word. Walk by position so position-1
        // entries always beat position-2 entries when both could match.
        for (var p = 1; p <= maxPosition; p++) {
            var list = table[p];
            if (!list) continue;
            for (var i = 0; i < list.length; i++) {
                var entry = (list[i] || '').toLowerCase().trim();
                if (!entry) continue;
                if (entry.indexOf(' ') >= 0) {
                    // Multi-word entry: substring match against the
                    // articles-kept transcript.
                    if (keepNorm.indexOf(entry) >= 0) return p;
                } else {
                    // Single-word entry: token match against the
                    // articles-stripped transcript.
                    for (var t = 0; t < tokens.length; t++) {
                        if (tokens[t] === entry) return p;
                    }
                }
            }
        }
        return 0;
    }

    function VoiceInput(opts) {
        opts = opts || {};
        this.language = (opts.language === 'es' || opts.language === 'ru') ? opts.language : 'en';
        this.maxPosition = Math.max(2, Math.min(4, opts.maxPosition || 4));
        this.onPhrase = opts.onPhrase || function() {};
        this.onError = opts.onError || function() {};
        this.onListeningChange = opts.onListeningChange || function() {};
        // Fires for every final transcript (and any high-confidence interim)
        // regardless of whether _matchPosition found a position. Useful for
        // diagnosing "recognizer heard X but matcher rejected" vs "recognizer
        // heard nothing". Receives { raw, confidence, matched: boolean }.
        this.onHeard = opts.onHeard || function() {};
        // Fires on recognizer state transitions (start / end / error). Useful
        // for surfacing "no-speech" or other quiet failures into the UI when
        // DevTools isn't available. Receives { kind, detail?, language?,
        // langCode? }.
        this.onStatus = opts.onStatus || function() {};
        // Optional override for the synonym tables, keyed by language.
        // Shape: { en: { 1:[...], 2:[...], 3:[...], 4:[...] }, es: {...}, ru: {...} }.
        // If present for the active language, used verbatim — empty position
        // lists mean "no triggers for that position" (admin choice). If null
        // / missing, fall back to DEFAULT_SYNONYMS.
        this.synonyms = opts.synonyms || null;
        this._rec = null;
        this._wantOn = false;        // user intent — keep restarting on ends
        this._lastFiredAt = 0;       // simple cooldown
        this._lastHeard = '';
    }

    VoiceInput.prototype._activeTable = function() {
        if (this.synonyms && this.synonyms[this.language]) return this.synonyms[this.language];
        return SYNONYMS[this.language] || SYNONYMS.en;
    };

    VoiceInput.isSupported = function() {
        return !!SpeechRecognition;
    };

    VoiceInput.prototype._make = function() {
        var rec = new SpeechRecognition();
        rec.lang = LANG_CODES[this.language] || 'en-US';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;

        var self = this;
        rec.onresult = function(ev) {
            // Any onresult call counts as evidence that audio is reaching the
            // engine. Fire onStatus so the user sees a status flash even
            // before we try to match a position — helps tell apart "mic
            // alive but no match" from "mic completely silent".
            var transcriptPreview = '';
            try {
                if (ev.results && ev.results.length) {
                    var lastIdx = ev.results.length - 1;
                    var lastRes = ev.results[lastIdx];
                    if (lastRes && lastRes[0] && lastRes[0].transcript) {
                        transcriptPreview = lastRes[0].transcript.slice(0, 60);
                    }
                }
                self.onStatus({ kind: 'result', count: ev.results ? ev.results.length : 0, preview: transcriptPreview });
            } catch(_) {}
            // Walk new results; a single utterance can produce many partials.
            for (var i = ev.resultIndex; i < ev.results.length; i++) {
                var res = ev.results[i];
                // Look at every alternative — sometimes the highest-confidence
                // pick isn't the one that matches our synonym table.
                for (var a = 0; a < res.length; a++) {
                    var alt = res[a];
                    var conf = (typeof alt.confidence === 'number' && alt.confidence > 0) ? alt.confidence : 1;
                    if (!res.isFinal && conf < CONFIDENCE_FLOOR) continue;
                    var pos = _matchPosition(alt.transcript, self._activeTable(), self.maxPosition);
                    // Always surface the transcript so the indicator can show
                    // what the recognizer heard, even when no position matched.
                    // Skip on low-confidence partials to keep noise down.
                    if (res.isFinal || conf >= CONFIDENCE_FLOOR) {
                        try {
                            self.onHeard({ raw: alt.transcript, confidence: conf, matched: pos > 0 });
                        } catch(_) {}
                    }
                    if (pos > 0) {
                        // Cooldown so the same utterance doesn't fire twice
                        // when the recognizer keeps pushing partials.
                        var now = Date.now();
                        if (now - self._lastFiredAt < 700) return;
                        self._lastFiredAt = now;
                        self._lastHeard = alt.transcript;
                        try {
                            self.onPhrase({ position: pos, raw: alt.transcript, confidence: conf });
                        } catch(e) {}
                        return;
                    }
                }
            }
        };

        rec.onerror = function(ev) {
            // 'no-speech' fires routinely when the user is silent; surface it
            // for diagnostic display but don't treat as a hard error.
            if (!ev) return;
            if (ev.error === 'aborted') return;
            try { self.onStatus({ kind: 'error', detail: ev.error }); } catch(_){ }
            if (ev.error === 'no-speech') return;
            if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
                self._wantOn = false; // don't keep retrying after a denial
                try { self.onError({ kind: 'permission', detail: ev.error }); } catch(_){ }
                return;
            }
            try { self.onError({ kind: 'runtime', detail: ev.error }); } catch(_){ }
        };

        rec.onend = function() {
            try { self.onListeningChange(false); } catch(_){ }
            try { self.onStatus({ kind: 'end' }); } catch(_){ }
            // Safari kills the recognizer after every utterance even with
            // continuous=true. Restart automatically while the caller still
            // wants us listening.
            if (self._wantOn) {
                setTimeout(function() {
                    if (!self._wantOn) return;
                    try { rec.start(); } catch(_){ }
                }, 80);
            }
        };

        rec.onstart = function() {
            try { self.onListeningChange(true); } catch(_){ }
            try { self.onStatus({ kind: 'start', language: self.language, langCode: rec.lang }); } catch(_){ }
        };

        return rec;
    };

    VoiceInput.prototype.start = function() {
        if (!VoiceInput.isSupported()) {
            try { this.onError({ kind: 'unsupported' }); } catch(_){ }
            return false;
        }
        this._wantOn = true;
        if (!this._rec) this._rec = this._make();
        try { this._rec.start(); } catch(e) {
            // start() throws if already running; safe to ignore.
        }
        return true;
    };

    VoiceInput.prototype.stop = function() {
        this._wantOn = false;
        if (!this._rec) return;
        try { this._rec.stop(); } catch(_){ }
    };

    VoiceInput.prototype.setLanguage = function(lang) {
        if (lang !== 'en' && lang !== 'es' && lang !== 'ru') return;
        this.language = lang;
        // Recreate the recognizer next time we start; can't change lang on a
        // running instance.
        if (this._rec) {
            this.stop();
            this._rec = null;
        }
    };

    VoiceInput.prototype.setMaxPosition = function(n) {
        n = parseInt(n, 10);
        if (n >= 2 && n <= 4) this.maxPosition = n;
    };

    // Update the synonym override at runtime. Pass null/undefined to fall
    // back to defaults. Takes effect on the next utterance — no need to
    // restart the recognizer.
    VoiceInput.prototype.setSynonyms = function(synonyms) {
        this.synonyms = synonyms || null;
    };

    VoiceInput.prototype.lastHeard = function() { return this._lastHeard; };

    // ===== Mic-check diagnostic =====
    // Self-contained panel that tells the user three things at once:
    //   1. Did the browser get microphone permission? (getUserMedia resolves)
    //   2. Which mic devices are visible to the browser?
    //   3. Is audio actually reaching the browser? (live level meter)
    //
    // Independent of the SpeechRecognition pipeline — useful when the
    // recognizer sits in 'listening' forever without producing transcripts,
    // since we can't tell whether the engine got zero audio or just didn't
    // know what to do with the audio it did get.
    var _micCheckOpen = null; // { panel, cleanup }

    function _closeMicCheck() {
        if (!_micCheckOpen) return;
        try { _micCheckOpen.cleanup && _micCheckOpen.cleanup(); } catch(_){}
        if (_micCheckOpen.panel && _micCheckOpen.panel.parentNode) {
            _micCheckOpen.panel.parentNode.removeChild(_micCheckOpen.panel);
        }
        _micCheckOpen = null;
    }

    function _openMicCheck() {
        if (_micCheckOpen) return; // already open
        var panel = document.createElement('div');
        panel.id = 'voice-mic-check';
        panel.className = 'voice-mic-check';
        panel.innerHTML =
            '<div class="vmc-head">' +
                '<span>Microphone check</span>' +
                '<button class="vmc-close" type="button">×</button>' +
            '</div>' +
            '<div class="vmc-body">' +
                '<div class="vmc-row vmc-perm">' +
                    '<strong>Browser permission:</strong> <span class="vmc-perm-state">checking…</span>' +
                '</div>' +
                '<div class="vmc-row vmc-active">' +
                    '<strong>Speech engine uses:</strong> <span class="vmc-active-name">(loading…)</span>' +
                '</div>' +
                '<div class="vmc-meter"><div class="vmc-meter-bar"></div></div>' +
                '<div class="vmc-meter-hint">Speak — the bar should jump. <span class="vmc-meter-which"></span></div>' +
                '<div class="vmc-status"></div>' +
                '<div class="vmc-devices"></div>' +
                '<div class="vmc-help">' +
                    '<strong>How to allow microphone in Chrome for this site:</strong><br>' +
                    '1. Click the <em>lock icon</em> (or "View site information") in the address bar to the left of the URL.<br>' +
                    '2. Find <em>Microphone</em> in the dropdown — set to <em>Allow</em>.<br>' +
                    '3. Reload the page.<br><br>' +
                    '<strong>How to change which mic is the default (the one the speech engine uses):</strong><br>' +
                    '• <em>macOS</em>: System Settings → Sound → Input → choose your preferred mic.<br>' +
                    '• <em>Chrome</em>: chrome://settings/content/microphone → set the default at the top.<br><br>' +
                    '<em>The speech engine in this app always uses the browser/system default mic. To preview a different mic on this panel, click its name in the list — that only changes the audio meter, not the speech engine.</em>' +
                '</div>' +
            '</div>';
        document.body.appendChild(panel);
        var permStateEl = panel.querySelector('.vmc-perm-state');
        var activeNameEl = panel.querySelector('.vmc-active-name');
        var statusEl = panel.querySelector('.vmc-status');
        var bar = panel.querySelector('.vmc-meter-bar');
        var meterWhichEl = panel.querySelector('.vmc-meter-which');
        var devicesEl = panel.querySelector('.vmc-devices');
        var closeBtn = panel.querySelector('.vmc-close');

        var stream = null, audioCtx = null, analyser = null, dataArray = null, animFrame = null;
        var defaultDeviceId = null;
        var defaultLabel = '(unknown)';

        function cleanup() {
            if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
            if (analyser) { try { analyser.disconnect(); } catch(_){} analyser = null; }
            if (audioCtx) { try { audioCtx.close(); } catch(_){} audioCtx = null; }
            if (stream) { try { stream.getTracks().forEach(function(t){ t.stop(); }); } catch(_){} stream = null; }
        }
        closeBtn.addEventListener('click', function() { _closeMicCheck(); });
        _micCheckOpen = { panel: panel, cleanup: cleanup };

        // Permission state via the Permissions API (works in Chrome/Edge for
        // 'microphone'). Surfaces "granted / denied / prompt" without forcing
        // us to call getUserMedia first.
        if (navigator.permissions && navigator.permissions.query) {
            try {
                navigator.permissions.query({ name: 'microphone' }).then(function(p) {
                    var s = p.state;
                    if (s === 'granted')      permStateEl.innerHTML = '<span style="color:#7ee37e">✓ granted</span>';
                    else if (s === 'denied')  permStateEl.innerHTML = '<span style="color:#ff7e7e">✗ denied</span> — see help below';
                    else                       permStateEl.innerHTML = '<span style="color:#ffd54f">prompt (will ask)</span>';
                    p.onchange = function() { _closeMicCheck(); _openMicCheck(); };
                }).catch(function() {
                    permStateEl.textContent = '(permission state not exposed by this browser)';
                });
            } catch(_) {
                permStateEl.textContent = '(permission state not exposed)';
            }
        } else {
            permStateEl.textContent = '(permission state not exposed)';
        }

        // Build the analyser pipeline against a chosen device. Called once
        // for the default at startup, and again whenever the user clicks
        // a different device in the list to preview it.
        function startMeter(deviceId, label) {
            cleanup();
            meterWhichEl.textContent = '(' + (label || 'default mic') + ')';
            var constraints = deviceId
                ? { audio: { deviceId: { exact: deviceId } } }
                : { audio: true };
            return navigator.mediaDevices.getUserMedia(constraints).then(function(s) {
                stream = s;
                var Ctx = window.AudioContext || window.webkitAudioContext;
                audioCtx = new Ctx();
                var source = audioCtx.createMediaStreamSource(stream);
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 512;
                analyser.smoothingTimeConstant = 0.6;
                source.connect(analyser);
                dataArray = new Uint8Array(analyser.fftSize);
                var tick = function() {
                    if (!analyser) return;
                    analyser.getByteTimeDomainData(dataArray);
                    var max = 0;
                    for (var i = 0; i < dataArray.length; i++) {
                        var v = Math.abs(dataArray[i] - 128);
                        if (v > max) max = v;
                    }
                    var pct = Math.min(100, (max / 60) * 100);
                    bar.style.width = pct.toFixed(0) + '%';
                    animFrame = requestAnimationFrame(tick);
                };
                tick();
            });
        }

        // Step 1: claim audio so labels appear in enumerateDevices.
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusEl.textContent = 'Browser does not expose microphones.';
            return;
        }
        startMeter(null, 'system default')
            .then(function() {
                statusEl.innerHTML = '<span style="color:#7ee37e">Microphone accessed.</span>';
                // Identify the default-mic deviceId by looking at the active
                // track's settings. Then list every other mic with a click
                // handler so the user can preview each one's level.
                try {
                    var settings = stream.getAudioTracks()[0].getSettings();
                    defaultDeviceId = settings && settings.deviceId;
                } catch(_) {}
                return navigator.mediaDevices.enumerateDevices();
            })
            .then(function(devs) {
                if (!devs) return;
                var mics = devs.filter(function(d) { return d.kind === 'audioinput'; });
                // Resolve the default-mic label. Chrome lists a synthetic
                // entry with deviceId === 'default' whose label points at
                // the actual system default ("Default - <name>"). Use that
                // when present; otherwise match by track-settings deviceId.
                var defEntry = mics.filter(function(m) { return m.deviceId === 'default'; })[0];
                if (defEntry) {
                    defaultLabel = defEntry.label || '(unnamed default)';
                } else {
                    var match = mics.filter(function(m) { return m.deviceId === defaultDeviceId; })[0];
                    if (match) defaultLabel = match.label || '(unnamed)';
                }
                activeNameEl.textContent = defaultLabel;
                meterWhichEl.textContent = '(' + defaultLabel + ')';

                if (mics.length === 0) {
                    devicesEl.innerHTML = '<em>No microphones detected.</em>';
                    return;
                }
                var html = '<strong>All microphones (' + mics.length + '):</strong><ul>';
                mics.forEach(function(m, i) {
                    var label = m.label || ('Mic ' + (i + 1) + ' (' + (m.deviceId || '').slice(0, 6) + '…)');
                    var isDefault = (m.deviceId === 'default') || (m.deviceId === defaultDeviceId);
                    var className = 'vmc-dev-row' + (isDefault ? ' vmc-dev-default' : '');
                    var marker = isDefault ? ' ★' : '';
                    html += '<li class="' + className + '" data-device-id="' + (m.deviceId || '') + '" data-label="' + (m.label || '').replace(/"/g, '&quot;') + '">' + label + marker + '</li>';
                });
                html += '</ul><div class="vmc-dev-hint">★ = system default (this is what the speech engine uses). Click any other mic to preview its audio level.</div>';
                devicesEl.innerHTML = html;
                devicesEl.querySelectorAll('.vmc-dev-row').forEach(function(row) {
                    row.addEventListener('click', function() {
                        var did = row.getAttribute('data-device-id');
                        var lab = row.getAttribute('data-label') || did;
                        if (did === defaultDeviceId || did === 'default') {
                            startMeter(null, defaultLabel + ' (default)').catch(function() {});
                        } else {
                            startMeter(did, lab).catch(function(e) {
                                statusEl.textContent = 'Could not open ' + lab + ': ' + (e && e.name);
                            });
                        }
                    });
                });
            })
            .catch(function(err) {
                var name = (err && err.name) || 'unknown';
                if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                    statusEl.innerHTML = '<strong style="color:#ff7e7e">Permission denied.</strong> See "How to allow microphone in Chrome" below.';
                } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
                    statusEl.innerHTML = '<strong style="color:#ff7e7e">No microphone found.</strong> Connect a mic or check macOS Sound → Input.';
                } else {
                    statusEl.textContent = 'getUserMedia failed: ' + name;
                }
            });
    }

    // Expose. DEFAULT_SYNONYMS is published as a deep clone so callers
    // can edit the result without mutating our internal table.
    VoiceInput.DEFAULT_SYNONYMS = JSON.parse(JSON.stringify(SYNONYMS));
    VoiceInput.LANG_CODES = LANG_CODES;
    VoiceInput.openMicCheck = _openMicCheck;
    VoiceInput.closeMicCheck = _closeMicCheck;
    window.VoiceInput = VoiceInput;
})();
