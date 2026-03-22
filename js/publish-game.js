/**
 * Vica Domino - Publish Game
 *
 * Generates a standalone HTML file containing only the game-playing
 * portion of the application, with all assets inlined.
 */

async function publishGame() {
    // Verify a custom game is loaded
    if (!window.customGameDeck || window.customGameDeck.length === 0) {
        alert('Please select a game first before publishing.');
        return;
    }

    // Serialize the game deck (plain data)
    var deckData = JSON.stringify(window.customGameDeck);

    // Serialize SVG map: key -> outerHTML string
    var svgMapData = {};
    if (window.customGameSVGs) {
        for (var key in window.customGameSVGs) {
            if (window.customGameSVGs.hasOwnProperty(key)) {
                var el = window.customGameSVGs[key];
                if (el && el.outerHTML) {
                    svgMapData[key] = el.outerHTML;
                }
            }
        }
    }
    var svgMapJson = JSON.stringify(svgMapData);

    // Get flip setting
    var flipEnabled = !!window.customGameFlipEnabled;

    // Get game name from subtitle
    var subtitleEl = document.querySelector('#start-screen .subtitle');
    var gameName = 'Pinky-Math Domino';
    if (subtitleEl) {
        var m = subtitleEl.textContent.match(/Game:\s*(.+)/);
        if (m) gameName = m[1].trim();
    }

    // Fetch CSS and JS files
    var cssText, dominoJs, gameJs;
    try {
        var results = await Promise.all([
            fetch('css/style.css').then(function(r) { return r.text(); }),
            fetch('js/domino.js').then(function(r) { return r.text(); }),
            fetch('js/game.js').then(function(r) { return r.text(); })
        ]);
        cssText = results[0];
        dominoJs = results[1];
        gameJs = results[2];
    } catch (e) {
        alert('Could not read project files. Make sure you are running from a web server.');
        return;
    }

    // Build the start screen HTML (level + player selection + player names)
    // Grab the current level button SVGs from the DOM so published game has custom icons
    var levelBtns = document.querySelectorAll('.level-btn');
    var levelBtnMarkup = '';
    levelBtns.forEach(function(btn) {
        var level = btn.getAttribute('data-level');
        var title = btn.getAttribute('title') || '';
        var wrapper = btn.closest('.level-btn-wrapper');
        var label = wrapper ? wrapper.querySelector('.level-label') : null;
        var labelText = label ? label.textContent : '';
        var svgEl = btn.querySelector('svg');
        var svgHtml = svgEl ? svgEl.outerHTML : '';
        var selected = level === 'circle' ? ' selected' : '';
        levelBtnMarkup += '<div class="level-btn-wrapper">' +
            '<button class="level-btn' + selected + '" data-level="' + level + '" title="' + title + '">' +
            svgHtml +
            '</button>' +
            '<span class="level-label">' + labelText + '</span>' +
            '</div>';
    });

    // Build Xeno SVG from DOM
    var xenoSvgEl = document.getElementById('xeno-icon');
    var xenoSvgHtml = xenoSvgEl ? xenoSvgEl.outerHTML : '';

    // Build HTML
    var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
        '<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n' +
        '<title>' + escapeHtml(gameName) + ' - Pinky-Math Domino</title>\n' +
        '<style>\n' + cssText + '\n</style>\n' +
        '</head>\n<body>\n' +
        '<div class="game-container">\n' +

        // Start screen
        '<div class="screen" id="start-screen">\n' +
        '<h1>Pinky-Math Domino</h1>\n' +
        '<p class="subtitle">Game: ' + escapeHtml(gameName) + '</p>\n' +
        '<div class="setup-panel">\n' +
        '<div class="setup-columns">\n' +
        '<div class="setup-left">\n' +
        '<h3>Choose your game:</h3>\n' +
        '<div class="game-level-select">\n' +
        levelBtnMarkup +
        '</div>\n' +
        '</div>\n' +
        '</div>\n' +
        '<h3>How many players?</h3>\n' +
        '<div class="player-select">\n' +
        '<button class="player-btn" data-players="1" data-xeno="true">You + Xeno \u23f3</button>\n' +
        '<button class="player-btn" data-players="2" data-xeno="false">2 Players</button>\n' +
        '<button class="player-btn" data-players="2" data-xeno="true">2 Players + Xeno \u23f3</button>\n' +
        '</div>\n' +
        xenoSvgHtml + '\n' +
        '<div class="player-names" id="player-names" style="display: none;">\n' +
        '<button class="back-arrow-btn" id="back-to-setup-btn" title="Go back"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16L7 10L13 4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>\n' +
        '<h3>Enter player names:</h3>\n' +
        '<div id="name-inputs"></div>\n' +
        '<button class="btn btn-primary" id="start-game-btn">Start Game</button>\n' +
        '</div>\n' +
        '</div>\n' +
        '</div>\n' +

        // Game screen
        '<div class="screen" id="game-screen" style="display: none;">\n' +
        '<button class="back-arrow-btn" id="back-arrow-btn" title="Go back to setup"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 16L7 10L13 4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>\n' +
        '<header>\n' +
        '<h1>Pinky-Math Domino <span id="game-name-display" class="game-name-display"></span><span id="header-stage-stones" class="header-stage-stones"></span></h1>\n' +
        '<div class="turn-indicator"><span id="current-player-name">Player 1</span>\'s turn</div>\n' +
        '</header>\n' +
        '<div class="status" id="status-message">Select the highest double to start!</div>\n' +
        '<main>\n' +
        '<div class="board-container">\n' +
        '<div class="board" id="game-board"><div class="board-placeholder">Waiting for highest double...</div></div>\n' +
        '<div class="celebration-area" id="celebration-area" style="display: none;"><div class="celebration-emoji">\ud83c\udf89</div></div>\n' +
        '</div>\n' +
        '<div class="players-area" id="players-area"></div>\n' +
        '<div class="xeno-timer-box" id="xeno-timer-box" style="display: none;">\n' +
        '<div class="xeno-timer-header"><span class="xeno-timer-icon" id="xeno-timer-icon"></span><span class="xeno-timer-name">Xeno\'s Timer</span></div>\n' +
        '<div class="xeno-timer-content">\n' +
        '<svg viewBox="0 0 120 120" class="timer-svg">\n' +
        '<circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="8"/>\n' +
        '<circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="0" transform="rotate(-90 60 60)" class="timer-progress"/>\n' +
        '<g class="timer-ticks" id="timer-ticks"></g>\n' +
        '</svg>\n' +
        '<div class="timer-display" id="timer-display">5</div>\n' +
        '</div>\n' +
        '</div>\n' +
        '<div class="bank-area">\n' +
        '<div class="bank" id="bank"><div class="bank-icon-wrapper"><span class="bank-icon">\ud83c\udfdb\ufe0f</span><span class="bank-dollar-overlay">$</span></div><div class="bank-info"><span id="bank-count">0</span> dominos</div></div>\n' +
        '<button class="btn btn-draw" id="bank-draw-btn" disabled>Draw from Bank</button>\n' +
        '</div>\n' +
        '</main>\n' +
        '<div class="controls">\n' +
        '<button class="btn btn-secondary" id="pass-btn" disabled>Skip Turn</button>\n' +
        '<button class="btn btn-primary" id="play-again-game-btn" style="display: none;">Play Again</button>\n' +
        '<button class="btn btn-secondary" id="new-game-btn">New Game</button>\n' +
        '</div>\n' +
        '</div>\n' +

        // Winner modal
        '<div class="modal" id="winner-modal">\n' +
        '<div class="modal-content">\n' +
        '<div id="single-winner-content"><h2 id="winner-heading">\ud83c\udf89 Winner! \ud83c\udf89</h2><p id="winner-name">Player 1 wins!</p><p id="winner-says" class="winner-speech">"I Won!"</p></div>\n' +
        '<div id="circle-winners-content" style="display: none;"><h2>\ud83c\udf89 Circle of Winners! \ud83c\udf89</h2><p id="winners-names">Players win together!</p><div class="we-won-animation" id="we-won-animation"><span class="we-won-text">"We Won!"</span></div></div>\n' +
        '<button class="btn btn-primary" id="play-again-btn">Play Again</button>\n' +
        '</div>\n' +
        '</div>\n' +

        // Winner celebration + banner
        '<div class="winner-celebration" id="winner-celebration"></div>\n' +
        '<div class="winner-banner" id="winner-banner" style="display: none;"><h2>Here is the <span id="winner-ordinal">first</span> winner!</h2><div class="winner-name" id="banner-winner-name">Player Name</div></div>\n' +

        // Combined game celebration (needed by game.js even if not combined)
        '<div id="combined-celebration-overlay" style="display:none;"><canvas id="celebration-canvas"></canvas><div class="celebration-content"><h1 class="celebration-title">Congratulations!</h1><p class="celebration-subtitle">You completed all games!</p><button class="btn btn-primary" id="close-celebration-btn">Finish</button></div></div>\n' +

        '</div>\n' +

        // Embedded game data
        '<script>\n' +
        '// Embedded game data\n' +
        'window.customGameDeck = ' + deckData + ';\n' +
        'window.customGameFlipEnabled = ' + flipEnabled + ';\n' +
        '(function() {\n' +
        '  var svgData = ' + svgMapJson + ';\n' +
        '  var map = {};\n' +
        '  var parser = new DOMParser();\n' +
        '  for (var key in svgData) {\n' +
        '    try {\n' +
        '      var doc = parser.parseFromString(svgData[key], "image/svg+xml");\n' +
        '      map[key] = doc.documentElement;\n' +
        '    } catch(e) {}\n' +
        '  }\n' +
        '  window.customGameSVGs = map;\n' +
        '})();\n' +
        '</scr' + 'ipt>\n' +

        // domino.js
        '<script>\n' + dominoJs + '\n</scr' + 'ipt>\n' +

        // Stubs for elements referenced by game.js that exist only in the full app
        '<script>\n' +
        '(function() {\n' +
        '  var stubIds = [\n' +
        '    "creator-screen", "intro-screen", "create-edit-screen",\n' +
        '    "card-library-screen", "library-set-screen", "domino-library-screen",\n' +
        '    "back-to-intro-btn", "back-to-creator-btn",\n' +
        '    "creator-games-btn", "creator-create-edit-btn",\n' +
        '    "back-from-create-edit-btn", "card-library-btn",\n' +
        '    "back-from-card-library-btn", "back-from-library-set-btn",\n' +
        '    "back-from-library-btn", "mpp-start-btn"\n' +
        '  ];\n' +
        '  stubIds.forEach(function(id) {\n' +
        '    if (!document.getElementById(id)) {\n' +
        '      var el = document.createElement("div");\n' +
        '      el.id = id; el.style.display = "none";\n' +
        '      document.body.appendChild(el);\n' +
        '    }\n' +
        '  });\n' +
        '})();\n' +
        '</scr' + 'ipt>\n' +

        // game.js
        '<script>\n' + gameJs + '\n</scr' + 'ipt>\n' +

        // Override resetToSetup to go back to start screen (no intro screen in published game)
        '<script>\n' +
        'document.addEventListener("DOMContentLoaded", function() {\n' +
        '  var origReset = window.game.resetToSetup.bind(window.game);\n' +
        '  window.game.resetToSetup = function() {\n' +
        '    origReset();\n' +
        '    document.getElementById("intro-screen").style.display = "none";\n' +
        '    document.getElementById("start-screen").style.display = "flex";\n' +
        '  };\n' +
        '});\n' +
        '</scr' + 'ipt>\n' +

        '</body>\n</html>';

    // Trigger download
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(gameName) + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_') || 'game';
}
