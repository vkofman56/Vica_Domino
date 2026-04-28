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

    function _matchPosition(text, lang, maxPosition) {
        var norm = _normalize(text);
        if (!norm) return 0;
        var table = SYNONYMS[lang] || SYNONYMS.en;
        // Tokenize and check each token against every position's synonyms.
        // First match wins so a stray "second" buried after "first" doesn't
        // override the user's first word.
        var tokens = norm.split(' ');
        for (var t = 0; t < tokens.length; t++) {
            var tok = tokens[t];
            for (var p = 1; p <= maxPosition; p++) {
                var list = table[p];
                if (!list) continue;
                for (var i = 0; i < list.length; i++) {
                    if (tok === list[i]) return p;
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
        this._rec = null;
        this._wantOn = false;        // user intent — keep restarting on ends
        this._lastFiredAt = 0;       // simple cooldown
        this._lastHeard = '';
    }

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
            // Walk new results; a single utterance can produce many partials.
            for (var i = ev.resultIndex; i < ev.results.length; i++) {
                var res = ev.results[i];
                // Look at every alternative — sometimes the highest-confidence
                // pick isn't the one that matches our synonym table.
                for (var a = 0; a < res.length; a++) {
                    var alt = res[a];
                    var conf = (typeof alt.confidence === 'number' && alt.confidence > 0) ? alt.confidence : 1;
                    if (!res.isFinal && conf < CONFIDENCE_FLOOR) continue;
                    var pos = _matchPosition(alt.transcript, self.language, self.maxPosition);
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
            // 'no-speech' fires routinely when the user is silent; ignore.
            // 'aborted' fires when we call stop() ourselves.
            if (!ev || ev.error === 'no-speech' || ev.error === 'aborted') return;
            if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
                self._wantOn = false; // don't keep retrying after a denial
                try { self.onError({ kind: 'permission', detail: ev.error }); } catch(_){ }
                return;
            }
            try { self.onError({ kind: 'runtime', detail: ev.error }); } catch(_){ }
        };

        rec.onend = function() {
            try { self.onListeningChange(false); } catch(_){ }
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

    VoiceInput.prototype.lastHeard = function() { return this._lastHeard; };

    // Expose
    window.VoiceInput = VoiceInput;
})();
