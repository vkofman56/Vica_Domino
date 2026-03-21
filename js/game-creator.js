/**
 * Vica Domino - Game Creator
 *
 * Intro page game selection, custom game deck building,
 * Main Page Pictures (MPP) editor, combined games, and
 * data migrations. Extracted from index.html inline script.
 */

// === Introductory Page ===
var selectedIntroGame = null; // null = default ABC, 'custom-N', or 'combined-N'

function populateIntroGames() {
    var container = document.getElementById('intro-custom-games');
    if (!container) return;
    container.innerHTML = '';
    var games = loadCustomGames();
    games.forEach(function(game, i) {
        var btn = document.createElement('button');
        btn.className = 'intro-game-btn';
        btn.textContent = game.name;
        btn.onclick = function() { selectIntroGame('custom-' + i, btn); };
        container.appendChild(btn);
    });
    // Add combined games
    var combinedGames = loadCombinedGames();
    combinedGames.forEach(function(cg, ci) {
        var btn = document.createElement('button');
        btn.className = 'intro-game-btn';
        btn.textContent = cg.name;
        btn.onclick = function() { selectIntroGame('combined-' + ci, btn); };
        container.appendChild(btn);
    });
}

function selectIntroGame(gameId, btnEl) {
    // Deselect all
    document.querySelectorAll('#intro-screen .intro-game-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    if (selectedIntroGame === gameId) {
        // Toggle off = back to default
        selectedIntroGame = null;
        return;
    }
    selectedIntroGame = gameId;
    // Highlight the clicked button
    if (btnEl) {
        btnEl.classList.add('selected');
    }
}

function goToMainPage() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';

    // Always clear previous game state first to prevent toggle interference
    clearCustomGame();
    activeCustomGameIndex = -1;

    // Apply the selected game
    if (selectedIntroGame && selectedIntroGame.indexOf('custom-') === 0) {
        var idx = parseInt(selectedIntroGame.replace('custom-', ''), 10);
        startCustomGame(idx, null);
    } else if (selectedIntroGame && selectedIntroGame.indexOf('combined-') === 0) {
        var idx = parseInt(selectedIntroGame.replace('combined-', ''), 10);
        startCombinedGameFromMenu(idx, null);
    } else {
        // Default = ABC game
        var games = loadCustomGames();
        for (var gi = 0; gi < games.length; gi++) {
            if (games[gi].name === 'ABC') {
                startCustomGame(gi, null);
                break;
            }
        }
    }
}

// === Custom game: build domino deck from saved game cards ===
var activeCustomGameIndex = -1;

function startCustomGame(gameIndex, btnEl) {
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;

    // Toggle: clicking same game deselects it
    if (activeCustomGameIndex === gameIndex) {
        clearCustomGame();
        if (btnEl) btnEl.classList.remove('active');
        return;
    }

    // Deselect previous
    document.querySelectorAll('.custom-game-btn.active').forEach(function(b) {
        b.classList.remove('active');
    });
    if (btnEl) btnEl.classList.add('active');
    activeCustomGameIndex = gameIndex;

    // Show Main Page Pictures button
    var mppBtn = document.getElementById('mpp-start-btn');
    if (mppBtn) mppBtn.style.display = '';

    // Update subtitle
    document.querySelector('#start-screen .subtitle').textContent = 'Game: ' + game.name;

    // Ensure ABC card set DOM is built so findCardByLabel resolves live designs
    var needsAbc = game.cards.some(function(c) { return c.cardSet === 'ABC'; });
    if (needsAbc) {
        var abcDiv = document.getElementById('card-set-abc');
        if (abcDiv && !abcDiv.querySelector('.library-card')) {
            if (typeof buildAbcCardSet === 'function') buildAbcCardSet();
        }
    }

    // Collect original (non-variation) cards, deduplicated by label
    // Skip cards with empty SVG content or cards deleted from card sets
    var origCards = [];
    var seenLabels = {};
    game.cards.forEach(function(c) {
        if (!c.isVariation && !seenLabels[c.label]) {
            // Skip cards with no visual content (empty placeholder slots)
            var hasMarkup = c.svgMarkup && c.svgMarkup.trim();
            var inDom = !!findCardByLabel(c.label, c.cardSet);
            if (!hasMarkup && !inDom) return;
            seenLabels[c.label] = true;
            origCards.push(c);
        }
    });

    // Collect all unique values
    var valueSet = {};
    origCards.forEach(function(c) { valueSet[c.label.charAt(0)] = true; });
    var values = Object.keys(valueSet).sort();

    // Build SVG pools: for each card, use original visual only
    var svgPools = {};
    // Also build markup-based pools for level icon previews (more robust)
    var svgMarkupPools = {};
    origCards.forEach(function(c) {
        var pool = [];
        var svg = getGameCardSVG(c);
        if (svg) pool.push(svg);
        // Store SVG markup from DOM or from saved game data
        if (svg) {
            svgMarkupPools[c.label] = svg.innerHTML;
        } else if (c.svgMarkup) {
            // Fallback: use stored markup from game data
            svgMarkupPools[c.label] = c.svgMarkup;
            // Also create an SVG element for the pool
            var fallbackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            fallbackSvg.setAttribute('viewBox', '0 0 60 60');
            fallbackSvg.innerHTML = c.svgMarkup;
            pool.push(fallbackSvg);
        }
        // Note: Card Maker variations (rotate/reflect transforms from
        // cardMakerVariations) are intentionally NOT added to the pool here.
        // Adding them caused letters/icons to appear randomly rotated in the
        // game even though they looked correct in the domino list.  The game
        // deck should use only the original card visuals that the user
        // selected when building the game.
        svgPools[c.label] = pool;
    });

    // Load excluded dominos for this game
    var excludedKeys = getExcludedDominos(gameIndex);

    // Generate ALL card-to-card pair combinations as dominos (skip excluded)
    var customDeck = [];
    var svgMap = {};
    var cardId = 1;
    for (var i = 0; i < origCards.length; i++) {
        for (var j = i + 1; j < origCards.length; j++) {
            var leftCard = origCards[i];
            var rightCard = origCards[j];
            var dominoKey = leftCard.label + ':' + rightCard.label;
            if (excludedKeys.indexOf(dominoKey) >= 0) continue;
            var leftValue = leftCard.label.charAt(0);
            var rightValue = rightCard.label.charAt(0);
            // Unique keys per domino half
            var leftKey = leftCard.label + '_d' + cardId + 'L';
            var rightKey = rightCard.label + '_d' + cardId + 'R';
            // Pick visual from pool (original only, no variation transforms)
            var leftPool = svgPools[leftCard.label];
            var rightPool = svgPools[rightCard.label];
            if (leftPool && leftPool.length > 0) {
                svgMap[leftKey] = randomPick(leftPool).cloneNode(true);
            }
            if (rightPool && rightPool.length > 0) {
                svgMap[rightKey] = randomPick(rightPool).cloneNode(true);
            }
            customDeck.push({
                id: cardId++,
                left: leftKey,
                right: rightKey,
                leftValue: leftValue,
                rightValue: rightValue
            });
        }
    }

    window.customGameDeck = customDeck;
    window.customGameSVGs = svgMap;
    window.customGameFlipEnabled = !!(game.flipEnabled);

    // Extend VALUE_RANK for all custom values
    values.forEach(function(v, idx) {
        VALUE_RANK[v] = idx + 1;
    });

    // Update level button icons with images from this game
    try {
        updateLevelDominoIcons(origCards, svgPools, svgMarkupPools);
    } catch(e) {
        console.error('[startCustomGame] updateLevelDominoIcons error:', e);
    }
}

function clearCustomGame() {
    activeCustomGameIndex = -1;
    window.customGameDeck = null;
    window.customGameSVGs = null;
    window.customGameFlipEnabled = false;
    window.combinedGameConfig = null;
    window.combinedGameStage = 0;
    window._activeCombinedIndex = -1;
    document.querySelector('#start-screen .subtitle').textContent = 'Game: Find the Double!';
    // Hide Main Page Pictures button
    var mppBtn = document.getElementById('mpp-start-btn');
    if (mppBtn) mppBtn.style.display = 'none';
    // Reset level icons to default letters
    resetLevelDominoIcons();
}

// Update level button domino icons with custom game card images
function updateLevelDominoIcons(origCards, svgPools, svgMarkupPools) {
    // Reset any previous replacements first
    resetLevelDominoIcons();

    if (!origCards || origCards.length === 0) {
        return;
    }

    // Build maps: label -> innerHTML string and label -> SVG element
    // Prefer svgMarkupPools, fall back to serializing from svgPools
    // Skip empty cards (no visible SVG content)
    var markupMap = {};
    var viewBoxMap = {};
    var svgElementMap = {};
    for (var i = 0; i < origCards.length; i++) {
        var label = origCards[i].label;
        var markup = '';
        var vbox = '0 0 60 60';
        if (svgMarkupPools && svgMarkupPools[label]) {
            markup = svgMarkupPools[label];
        }
        if (svgPools[label] && svgPools[label].length > 0) {
            var svgEl0 = svgPools[label][0];
            if (!markup) {
                markup = svgEl0.innerHTML;
            }
            vbox = svgEl0.getAttribute('viewBox') || '0 0 60 60';
            svgElementMap[label] = svgEl0;
        }
        if (markup && markup.trim().length > 0) {
            markupMap[label] = markup;
            viewBoxMap[label] = vbox;
        }
    }

    var visibleCards = origCards.filter(function(c) { return !!markupMap[c.label]; });
    if (visibleCards.length === 0) return;

    // Load saved Main Page Domino config for the active game
    var savedMpp = null;
    if (activeCustomGameIndex >= 0) {
        try {
            var games = loadCustomGames();
            var game = games[activeCustomGameIndex];
            if (game && game.mainPageDominos) savedMpp = game.mainPageDominos;
        } catch(e) {}
    }

    // Fallback: generate unique pairs of different cards
    var allPairs = [];
    for (var i = 0; i < visibleCards.length; i++) {
        for (var j = i + 1; j < visibleCards.length; j++) {
            allPairs.push([visibleCards[i].label, visibleCards[j].label]);
        }
    }
    for (var i = allPairs.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = allPairs[i]; allPairs[i] = allPairs[r]; allPairs[r] = tmp;
    }

    var ns = 'http://www.w3.org/2000/svg';
    var levelKeys = ['circle', 'triangle', 'star'];
    var svgEls = document.querySelectorAll('.level-dominos-svg');

    for (var s = 0; s < svgEls.length; s++) {
        var svgEl = svgEls[s];
        var levelBtn = svgEl.closest('.level-btn') || svgEl.parentElement;
        var levelKey = levelBtn ? (levelBtn.getAttribute('data-level') || levelKeys[s]) : levelKeys[s];

        // Collect all domino groups in this level SVG
        var groups = [];
        var children = svgEl.childNodes;
        for (var c = 0; c < children.length; c++) {
            var group = children[c];
            if (group.nodeType !== 1 || group.tagName.toLowerCase() !== 'g') continue;
            var faces = group.querySelectorAll('.level-domino-face');
            if (faces.length >= 2) groups.push({ el: group, faces: faces });
        }
        if (groups.length === 0) continue;

        // Get domino assignments: from saved config or auto-generated pairs
        var savedLevel = savedMpp ? savedMpp[levelKey] : null;
        var useSaved = savedLevel && savedLevel.length >= groups.length;

        // If auto-generated, need enough unique pairs
        if (!useSaved && allPairs.length < groups.length) continue;

        for (var g = 0; g < groups.length; g++) {
            var topLabel, botLabel;
            if (useSaved) {
                topLabel = savedLevel[g].top;
                botLabel = savedLevel[g].bottom;
                // Validate that we have markup for both
                if (!markupMap[topLabel] || !markupMap[botLabel]) {
                    // Fall back to auto pair for this domino
                    if (g < allPairs.length) {
                        topLabel = allPairs[g][0];
                        botLabel = allPairs[g][1];
                    } else continue;
                }
            } else {
                var pair = allPairs[g];
                var flip = Math.random() < 0.5;
                topLabel = flip ? pair[1] : pair[0];
                botLabel = flip ? pair[0] : pair[1];
            }

            var labels = [topLabel, botLabel];
            var faces = groups[g].faces;

            for (var f = 0; f < 2 && f < faces.length; f++) {
                var face = faces[f];
                var label = labels[f];
                var markup = markupMap[label];
                var vb = viewBoxMap[label] || '0 0 60 60';
                var x = parseFloat(face.getAttribute('x'));
                var y = parseFloat(face.getAttribute('y'));
                var sz = 24;

                var nested = document.createElementNS(ns, 'svg');
                nested.setAttribute('viewBox', vb);
                nested.setAttribute('x', (x - sz / 2).toString());
                nested.setAttribute('y', (y - sz / 2).toString());
                nested.setAttribute('width', sz.toString());
                nested.setAttribute('height', sz.toString());
                nested.setAttribute('class', 'level-domino-img');
                nested.setAttribute('data-face', f.toString());
                nested.setAttribute('overflow', 'visible');

                // Clone SVG children directly to preserve namespaces
                // (innerHTML can lose SVG namespace on <text> elements)
                var srcEl = svgElementMap[label];
                if (srcEl) {
                    var srcClone = srcEl.cloneNode(true);
                    while (srcClone.firstChild) {
                        nested.appendChild(srcClone.firstChild);
                    }
                } else {
                    nested.innerHTML = markup;
                }

                groups[g].el.insertBefore(nested, face);
                face.style.display = 'none';
            }

            var dots = groups[g].el.querySelectorAll('.level-domino-dot');
            for (var d = 0; d < dots.length; d++) {
                dots[d].style.display = 'none';
            }
        }
    }
}

// Reset level domino icons back to default dot patterns
function resetLevelDominoIcons() {
    // Remove card images
    document.querySelectorAll('.level-domino-img').forEach(function(img) {
        img.remove();
    });
    // Show face text and dot patterns
    document.querySelectorAll('.level-domino-face').forEach(function(face) {
        face.style.display = '';
    });
    document.querySelectorAll('.level-domino-dot').forEach(function(dot) {
        dot.style.display = '';
    });
}

function getGameCardSVG(cardInfo) {
    if (!cardInfo.isVariation) {
        var card = findCardByLabel(cardInfo.label, cardInfo.cardSet);
        if (!card) return null;
        var svg = card.querySelector('svg');
        return svg ? svg.cloneNode(true) : null;
    } else {
        var original = findCardByLabel(cardInfo.originalLabel, cardInfo.cardSet);
        if (!original) return null;
        var svg = original.querySelector('svg');
        if (!svg) return null;
        return createVariationSVG(svg, cardInfo.transform);
    }
}

function getGameVariationSVG(cardInfo, transform) {
    var original;
    if (cardInfo.isVariation) {
        original = findCardByLabel(cardInfo.originalLabel, cardInfo.cardSet);
    } else {
        original = findCardByLabel(cardInfo.label, cardInfo.cardSet);
    }
    if (!original) return null;
    var svg = original.querySelector('svg');
    if (!svg) return null;
    return createVariationSVG(svg, transform);
}

// randomPick() is now in js/shared-data.js

// === Main Page Pictures (MPP) Editor ===
var mppGameIndex = -1;
var mppConfig = {}; // { circle: [{top,bottom},...], triangle: [...], star: [...] }
var mppMarkupMap = {}; // label -> svgInnerHTML (for existence checking)
var mppSvgElements = {}; // label -> SVG element reference (for cloning)
var mppActiveSelection = null; // { levelKey, dominoIdx, half } or null
var mppCardClickHandler = null; // capture-phase click handler on game-view-cards

function openMppFromStart() {
    if (activeCustomGameIndex < 0) return;
    openGameView(activeCustomGameIndex, 'start-screen');
    setTimeout(function() {
        openMainPagePictures(activeCustomGameIndex);
    }, 150);
}

function openMainPagePictures(gameIndex) {
    if (gameIndex < 0) return;
    var games = loadCustomGames();
    var game = games[gameIndex];
    if (!game) return;
    mppGameIndex = gameIndex;
    mppActiveSelection = null;

    // Build maps from game view cards (they're already rendered)
    mppMarkupMap = {};
    mppSvgElements = {};
    var gameViewCards = document.querySelectorAll('#game-view-cards .library-card');
    gameViewCards.forEach(function(cardEl) {
        var lbl = cardEl.querySelector('.library-label');
        if (!lbl) return;
        var label = lbl.textContent;
        var svg = cardEl.querySelector('svg');
        if (svg && svg.innerHTML.trim().length > 0) {
            mppMarkupMap[label] = svg.innerHTML;
            mppSvgElements[label] = svg;
        }
    });

    if (Object.keys(mppMarkupMap).length < 1) {
        alert('Need non-empty cards to configure domino pictures.');
        return;
    }

    // Load saved config
    var saved = game.mainPageDominos || {};
    mppConfig = {
        circle: (saved.circle || []).map(function(d) { return { top: d.top || '', bottom: d.bottom || '' }; }),
        triangle: (saved.triangle || []).map(function(d) { return { top: d.top || '', bottom: d.bottom || '' }; }),
        star: (saved.star || []).map(function(d) { return { top: d.top || '', bottom: d.bottom || '' }; })
    };
    // Pad to correct lengths
    while (mppConfig.circle.length < 2) mppConfig.circle.push({ top: '', bottom: '' });
    while (mppConfig.triangle.length < 3) mppConfig.triangle.push({ top: '', bottom: '' });
    while (mppConfig.star.length < 4) mppConfig.star.push({ top: '', bottom: '' });

    // Clone the 3 level SVGs from the start screen
    var levelKeys = ['circle', 'triangle', 'star'];
    var levelLabels = ['2 dominos', '3 dominos', '4 dominos'];
    var container = document.getElementById('mpp-levels');
    container.innerHTML = '';

    var ns = 'http://www.w3.org/2000/svg';

    levelKeys.forEach(function(key, idx) {
        var origBtn = document.querySelector('.level-btn[data-level="' + key + '"]');
        if (!origBtn) return;
        var origSvg = origBtn.querySelector('.level-dominos-svg');
        if (!origSvg) return;

        var col = document.createElement('div');
        col.className = 'mpp-level-col';

        var label = document.createElement('div');
        label.className = 'mpp-level-label';
        label.textContent = levelLabels[idx];
        col.appendChild(label);

        var wrap = document.createElement('div');
        wrap.className = 'mpp-level-svg-wrap';

        // Deep clone the SVG
        var svgClone = origSvg.cloneNode(true);
        svgClone.classList.add('mpp-level-svg');
        svgClone.setAttribute('data-mpp-level', key);

        // Add clickable overlay rects on each domino half
        var groups = svgClone.querySelectorAll('g');
        var dominoIdx = 0;
        for (var gi = 0; gi < groups.length; gi++) {
            var grp = groups[gi];
            var faces = grp.querySelectorAll('.level-domino-face');
            if (faces.length < 2) continue;

            // Each domino rect: x=-17 y=-36 width=34 height=72
            // Top half: -36 to 0, Bottom half: 0 to 36
            var topArea = document.createElementNS(ns, 'rect');
            topArea.setAttribute('class', 'mpp-click-area');
            topArea.setAttribute('x', '-17');
            topArea.setAttribute('y', '-36');
            topArea.setAttribute('width', '34');
            topArea.setAttribute('height', '36');
            topArea.setAttribute('data-level', key);
            topArea.setAttribute('data-domino', dominoIdx);
            topArea.setAttribute('data-half', 'top');
            grp.appendChild(topArea);

            var botArea = document.createElementNS(ns, 'rect');
            botArea.setAttribute('class', 'mpp-click-area');
            botArea.setAttribute('x', '-17');
            botArea.setAttribute('y', '0');
            botArea.setAttribute('width', '34');
            botArea.setAttribute('height', '36');
            botArea.setAttribute('data-level', key);
            botArea.setAttribute('data-domino', dominoIdx);
            botArea.setAttribute('data-half', 'bottom');
            grp.appendChild(botArea);

            // Highlight rect (initially hidden)
            var hlTop = document.createElementNS(ns, 'rect');
            hlTop.setAttribute('class', 'mpp-highlight-rect');
            hlTop.setAttribute('id', 'mpp-hl-' + key + '-' + dominoIdx + '-top');
            hlTop.setAttribute('x', '-16');
            hlTop.setAttribute('y', '-35');
            hlTop.setAttribute('width', '32');
            hlTop.setAttribute('height', '34');
            hlTop.setAttribute('rx', '3');
            hlTop.setAttribute('fill', 'none');
            hlTop.setAttribute('stroke', '#FFD700');
            hlTop.setAttribute('stroke-width', '2');
            grp.appendChild(hlTop);

            var hlBot = document.createElementNS(ns, 'rect');
            hlBot.setAttribute('class', 'mpp-highlight-rect');
            hlBot.setAttribute('id', 'mpp-hl-' + key + '-' + dominoIdx + '-bottom');
            hlBot.setAttribute('x', '-16');
            hlBot.setAttribute('y', '1');
            hlBot.setAttribute('width', '32');
            hlBot.setAttribute('height', '34');
            hlBot.setAttribute('rx', '3');
            hlBot.setAttribute('fill', 'none');
            hlBot.setAttribute('stroke', '#FFD700');
            hlBot.setAttribute('stroke-width', '2');
            grp.appendChild(hlBot);

            dominoIdx++;
        }

        // Click handler for domino halves in this SVG
        svgClone.addEventListener('click', function(e) {
            var area = e.target.closest('.mpp-click-area');
            if (!area) return;
            mppSelectHalf(area.getAttribute('data-level'), parseInt(area.getAttribute('data-domino')), area.getAttribute('data-half'));
        });

        wrap.appendChild(svgClone);
        col.appendChild(wrap);
        container.appendChild(col);

        // Apply any already-saved card images to the clone
        applyMppConfigToClone(svgClone, key);
    });

    // Set up capturing click handler on game-view-cards
    // Capture phase fires BEFORE target handlers, so we can freeze domino
    // movement and intercept clicks for card picking.
    var gvCards = document.getElementById('game-view-cards');
    if (mppCardClickHandler) gvCards.removeEventListener('click', mppCardClickHandler, true);
    mppCardClickHandler = function(e) {
        // Freeze domino-box movement: block .game-view-domino clicks
        var dominoEl = e.target.closest('.game-view-domino');
        if (dominoEl) {
            e.stopPropagation();
            e.preventDefault();
            // If active selection, try to pick card from clicked domino half
            if (mppActiveSelection) {
                var halfEl = e.target.closest('.game-view-domino-half');
                if (halfEl) {
                    var label = halfEl.getAttribute('data-card-label');
                    if (label) {
                        var svg = halfEl.querySelector('svg');
                        if (svg && svg.innerHTML.trim()) {
                            mppMarkupMap[label] = svg.innerHTML;
                            mppSvgElements[label] = svg;
                        }
                        if (mppMarkupMap[label]) {
                            mppAssignCard(label);
                        }
                    }
                }
            }
            return;
        }

        // Handle card row clicks (.library-card)
        if (!mppActiveSelection) return;
        var card = e.target.closest('.library-card');
        if (!card) return;
        var lbl = card.querySelector('.library-label');
        if (!lbl) return;
        var label = lbl.textContent;
        var svg = card.querySelector('svg');
        if (svg && svg.innerHTML.trim()) {
            mppMarkupMap[label] = svg.innerHTML;
            mppSvgElements[label] = svg;
        }
        if (!mppMarkupMap[label]) return;
        e.stopPropagation();
        mppAssignCard(label);
    };
    gvCards.addEventListener('click', mppCardClickHandler, true);
    gvCards.classList.add('mpp-active');

    // Show panel
    var panel = document.getElementById('mpp-panel');
    panel.style.display = '';
    updateMppHint();
    initMppDrag();
}

function mppSelectHalf(levelKey, dominoIdx, half) {
    // Clear previous highlight
    document.querySelectorAll('.mpp-highlight-rect.active').forEach(function(r) {
        r.classList.remove('active');
    });

    mppActiveSelection = { levelKey: levelKey, dominoIdx: dominoIdx, half: half };

    // Show highlight on selected half
    var hl = document.getElementById('mpp-hl-' + levelKey + '-' + dominoIdx + '-' + half);
    if (hl) hl.classList.add('active');

    // Activate pick mode on game view cards
    var gvCards = document.getElementById('game-view-cards');
    if (gvCards) gvCards.classList.add('mpp-pick-mode');

    updateMppHint();
}

function mppAssignCard(label) {
    if (!mppActiveSelection) return;
    var sel = mppActiveSelection;

    // Update config
    mppConfig[sel.levelKey][sel.dominoIdx][sel.half === 'top' ? 'top' : 'bottom'] = label;

    // Update the cloned SVG preview
    var svgClone = document.querySelector('.mpp-level-svg[data-mpp-level="' + sel.levelKey + '"]');
    if (svgClone) applyMppConfigToClone(svgClone, sel.levelKey);

    // Clear selection
    document.querySelectorAll('.mpp-highlight-rect.active').forEach(function(r) {
        r.classList.remove('active');
    });
    mppActiveSelection = null;
    var gvCards = document.getElementById('game-view-cards');
    if (gvCards) gvCards.classList.remove('mpp-pick-mode');
    updateMppHint();
}

function applyMppConfigToClone(svgClone, levelKey) {
    var ns = 'http://www.w3.org/2000/svg';
    var config = mppConfig[levelKey] || [];

    // Find domino groups
    var groups = svgClone.querySelectorAll('g');
    var dominoIdx = 0;
    for (var gi = 0; gi < groups.length; gi++) {
        var grp = groups[gi];
        var faces = grp.querySelectorAll('.level-domino-face');
        if (faces.length < 2) continue;
        if (dominoIdx >= config.length) { dominoIdx++; continue; }

        var cfg = config[dominoIdx];
        var halves = [
            { label: cfg.top, face: faces[0], dataFace: '0' },
            { label: cfg.bottom, face: faces[1], dataFace: '1' }
        ];

        halves.forEach(function(h) {
            // Remove any previously inserted mpp-img for this face
            var existing = grp.querySelectorAll('.mpp-card-img[data-mpp-face="' + h.dataFace + '"][data-mpp-domino="' + dominoIdx + '"]');
            existing.forEach(function(e) { e.remove(); });

            if (!h.label || !mppMarkupMap[h.label]) {
                // No card assigned - show original dots/face
                h.face.style.display = '';
                // Show dots for this half
                return;
            }

            var x = parseFloat(h.face.getAttribute('x'));
            var y = parseFloat(h.face.getAttribute('y'));
            var sz = 24;

            var nested = document.createElementNS(ns, 'svg');
            nested.setAttribute('viewBox', '0 0 60 60');
            nested.setAttribute('x', (x - sz / 2).toString());
            nested.setAttribute('y', (y - sz / 2).toString());
            nested.setAttribute('width', sz.toString());
            nested.setAttribute('height', sz.toString());
            nested.setAttribute('class', 'mpp-card-img');
            nested.setAttribute('data-mpp-face', h.dataFace);
            nested.setAttribute('data-mpp-domino', dominoIdx.toString());
            nested.setAttribute('overflow', 'visible');

            // Clone SVG children directly to preserve namespaces
            // (innerHTML can lose SVG namespace on <text> elements)
            var srcSvg = mppSvgElements[h.label];
            if (srcSvg) {
                var srcClone = srcSvg.cloneNode(true);
                while (srcClone.firstChild) {
                    nested.appendChild(srcClone.firstChild);
                }
            } else if (mppMarkupMap[h.label]) {
                nested.innerHTML = mppMarkupMap[h.label];
            }

            grp.insertBefore(nested, h.face);
            h.face.style.display = 'none';
        });

        // Hide dots when at least one card is assigned for this domino
        if ((cfg.top && mppMarkupMap[cfg.top]) || (cfg.bottom && mppMarkupMap[cfg.bottom])) {
            var dots = grp.querySelectorAll('.level-domino-dot');
            for (var d = 0; d < dots.length; d++) {
                dots[d].style.display = 'none';
            }
        }

        dominoIdx++;
    }
}

function updateMppHint() {
    var hint = document.getElementById('mpp-hint');
    if (!hint) return;
    if (mppActiveSelection) {
        hint.textContent = 'Now click a card below to assign it';
        hint.classList.add('mpp-hint-active');
    } else {
        hint.textContent = 'Click a domino half, then click a card';
        hint.classList.remove('mpp-hint-active');
    }
}

function saveMainPagePictures() {
    if (mppGameIndex < 0) return;
    var games = loadCustomGames();
    var game = games[mppGameIndex];
    if (!game) return;

    game.mainPageDominos = JSON.parse(JSON.stringify(mppConfig));
    saveCustomGames(games);

    closeMainPagePictures();

    // Re-apply level icons if this game is currently active
    if (activeCustomGameIndex === mppGameIndex) {
        var btn = document.querySelector('.custom-game-btn.active');
        startCustomGame(mppGameIndex, btn);
    }
}

function closeMainPagePictures() {
    var panel = document.getElementById('mpp-panel');
    panel.style.display = 'none';
    // Reset position for next open
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.left = 'auto';
    // Clean up
    document.querySelectorAll('.mpp-highlight-rect.active').forEach(function(r) {
        r.classList.remove('active');
    });
    var gvCards = document.getElementById('game-view-cards');
    if (gvCards) {
        gvCards.classList.remove('mpp-pick-mode');
        gvCards.classList.remove('mpp-active');
        if (mppCardClickHandler) gvCards.removeEventListener('click', mppCardClickHandler, true);
    }
    mppCardClickHandler = null;
    mppActiveSelection = null;
    mppSvgElements = {};
    mppGameIndex = -1;
}

// Drag functionality for MPP panel
function initMppDrag() {
    var panel = document.getElementById('mpp-panel');
    var handle = document.getElementById('mpp-drag-handle');
    var isDragging = false;
    var startX, startY, startLeft, startTop;

    function onMouseDown(e) {
        if (e.target.closest('.mpp-close-btn')) return;
        isDragging = true;
        var rect = panel.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        // Switch to left/top positioning during drag
        panel.style.right = 'auto';
        panel.style.left = startLeft + 'px';
        panel.style.top = startTop + 'px';
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        panel.style.left = (startLeft + dx) + 'px';
        panel.style.top = (startTop + dy) + 'px';
    }

    function onMouseUp() {
        isDragging = false;
    }

    // Remove old listeners if any
    handle._mppDown && handle.removeEventListener('mousedown', handle._mppDown);
    handle._mppDown = onMouseDown;
    handle.addEventListener('mousedown', onMouseDown);

    // Use document-level listeners for move/up
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch support
    handle.addEventListener('touchstart', function(e) {
        if (e.target.closest('.mpp-close-btn')) return;
        var touch = e.touches[0];
        var rect = panel.getBoundingClientRect();
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        panel.style.right = 'auto';
        panel.style.left = startLeft + 'px';
        panel.style.top = startTop + 'px';
        isDragging = true;
    }, { passive: true });
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var touch = e.touches[0];
        var dx = touch.clientX - startX;
        var dy = touch.clientY - startY;
        panel.style.left = (startLeft + dx) + 'px';
        panel.style.top = (startTop + dy) + 'px';
    }, { passive: true });
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
}

// === Combined Games Functions ===
function updateCombineButton() {
    var checked = document.querySelectorAll('.combine-checkbox:checked');
    var btn = document.getElementById('combine-games-btn');
    if (btn) btn.style.display = checked.length >= 2 ? 'block' : 'none';
}

function openCombineDialog() {
    var checked = document.querySelectorAll('.combine-checkbox:checked');
    if (checked.length < 2) return;
    var games = loadCustomGames();
    var overlay = document.getElementById('combine-games-overlay');
    var list = document.getElementById('combine-games-list');
    list.innerHTML = '';

    var labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    checked.forEach(function(cb, idx) {
        var gameIdx = parseInt(cb.dataset.gameIndex);
        var game = games[gameIdx];
        var row = document.createElement('div');
        row.className = 'combine-game-row';
        row.innerHTML = '<span class="combine-game-label">Game ' + labels[idx] + ': ' + game.name + '</span>' +
            '<label style="display:flex;align-items:center;gap:6px;"><span style="font-size:20px;">💎</span><input type="number" class="combine-gem-input" min="1" max="99" value="2" data-game-index="' + gameIdx + '"></label>';
        list.appendChild(row);
    });

    overlay.style.display = 'flex';
}

function confirmCombineGames() {
    var inputs = document.querySelectorAll('.combine-gem-input');
    var games = loadCustomGames();
    var gameStages = [];
    inputs.forEach(function(input) {
        var gi = parseInt(input.dataset.gameIndex);
        gameStages.push({
            gameIndex: gi,
            gameName: (games[gi] && games[gi].name) || '',
            gemsNeeded: parseInt(input.value) || 2
        });
    });

    var name = prompt('Name for this combined game:');
    if (!name || !name.trim()) return;

    var combinedGames = loadCombinedGames();
    combinedGames.push({ name: name.trim(), stages: gameStages });
    saveCombinedGames(combinedGames);

    document.getElementById('combine-games-overlay').style.display = 'none';

    // Uncheck all
    document.querySelectorAll('.combine-checkbox').forEach(function(cb) { cb.checked = false; });
    updateCombineButton();

    populateLibraryGames();
    populateStartScreenGames();
}

function cancelCombineGames() {
    document.getElementById('combine-games-overlay').style.display = 'none';
}

// loadCombinedGames, saveCombinedGames, resolveStageGameIndex
// are now in js/shared-data.js

function startCombinedGameFromMenu(combinedIndex, btnEl) {
    var combinedGames = loadCombinedGames();
    var cg = combinedGames[combinedIndex];
    if (!cg) return;

    // Toggle: clicking same combined game deselects it
    if (window._activeCombinedIndex === combinedIndex) {
        clearCustomGame();
        window._activeCombinedIndex = -1;
        window.combinedGameConfig = null;
        if (btnEl) btnEl.classList.remove('active');
        document.querySelector('#start-screen .subtitle').textContent = 'Game: Find the Double!';
        return;
    }

    // Deselect all game buttons
    document.querySelectorAll('.custom-game-btn.active').forEach(function(b) {
        b.classList.remove('active');
    });
    if (btnEl) btnEl.classList.add('active');
    window._activeCombinedIndex = combinedIndex;

    // Load the first stage's game deck (resolve by name)
    var firstStage = cg.stages[0];
    var resolvedIdx = resolveStageGameIndex(firstStage);
    if (resolvedIdx >= 0) startCustomGame(resolvedIdx, null);

    // Store combined game config globally for game.js to read
    window.combinedGameConfig = cg;
    window.combinedGameStage = 0;

    // Update subtitle
    document.querySelector('#start-screen .subtitle').textContent = 'Combined: ' + cg.name;
}

// Expose function for game.js to switch game decks during combined game
window.loadGameDeckForStage = function(stage) {
    var idx = resolveStageGameIndex(stage);
    if (idx >= 0) startCustomGame(idx, null);
};

// Close celebration handler
document.getElementById('close-celebration-btn').addEventListener('click', function() {
    document.getElementById('combined-celebration-overlay').style.display = 'none';
    if (window.game) window.game.resetToSetup();
});

// --- Last used game shortcut on Card Maker left panel ---
function populateCardMakerGames() {
    var container = document.getElementById('card-maker-games');
    container.innerHTML = '';
    if (currentGameViewIndex < 0) return;
    var games = loadCustomGames();
    var game = games[currentGameViewIndex];
    if (!game) return;
    var btn = document.createElement('button');
    btn.className = 'card-maker-game-btn';
    btn.textContent = game.name;
    btn.title = 'Go to: ' + game.name;
    btn.onclick = function() { openGameView(currentGameViewIndex, 'domino-library-screen'); };
    container.appendChild(btn);
}

// === Create built-in ABC game (only if it does not exist) ===
// Game card labels use "A01" format to avoid clashing with Numbers & Dots "A1"
function buildDefaultAbcGameCards() {
    var letters = ['A', 'B', 'C', 'D', 'E'];
    var colors = { A: '#336', B: '#633', C: '#363', D: '#663', E: '#636' };
    var abcCards = [];
    letters.forEach(function(letter) {
        for (var n = 1; n <= 3; n++) {
            var label = letter + '0' + n;
            var markup;
            if (n <= 2) {
                var color = colors[letter] || '#333';
                markup = '<text x="30" y="46" text-anchor="middle" font-size="48" font-weight="bold" fill="' + color + '">' + letter + '</text>';
            } else {
                markup = abcIcons[letter] ? abcIcons[letter].markup : '';
            }
            abcCards.push({
                label: label,
                isVariation: false,
                svgMarkup: markup,
                cardSet: 'ABC'
            });
        }
    });
    return abcCards;
}
// One-time migration: backfill missing svgMarkup on ABC game cards
(function migrateAbcGameMarkup() {
    var games = loadCustomGames();
    for (var i = 0; i < games.length; i++) {
        if (games[i].name === 'ABC') {
            var hasMissing = false;
            for (var j = 0; j < games[i].cards.length; j++) {
                if (!games[i].cards[j].svgMarkup) { hasMissing = true; break; }
            }
            if (hasMissing) {
                var defaults = {};
                buildDefaultAbcGameCards().forEach(function(c) { defaults[c.label] = c.svgMarkup; });
                games[i].cards.forEach(function(c) {
                    if (!c.svgMarkup && defaults[c.label]) {
                        c.svgMarkup = defaults[c.label];
                    }
                });
                saveCustomGames(games);
            }
            return;
        }
    }
})();

// Migrate: ensure all game cards have svgMarkup (backfill from DOM for older games)
(function migrateAllGameSvgMarkup() {
    var games = loadCustomGames();
    var changed = false;
    games.forEach(function(game) {
        if (!game.cards) return;
        game.cards.forEach(function(c) {
            if (c.svgMarkup) return; // already has markup
            // Try to find card in DOM
            var domCard = findCardByLabel(c.label, c.cardSet);
            if (domCard) {
                var svg = domCard.querySelector('svg');
                if (svg && svg.innerHTML.trim()) {
                    c.svgMarkup = svg.innerHTML;
                    changed = true;
                }
            }
        });
    });
    if (changed) {
        saveCustomGames(games);
    }
})();

// Migrate: backfill cardSet property on existing game cards
(function migrateCardSetProperty() {
    var games = loadCustomGames();
    var changed = false;
    games.forEach(function(game) {
        if (!game.cards) return;
        var setName = game.name === 'ABC' ? 'ABC' : 'Numbers and Dots';
        game.cards.forEach(function(c) {
            if (!c.cardSet) {
                c.cardSet = setName;
                changed = true;
            }
        });
    });
    if (changed) {
        saveCustomGames(games);
    }
})();

// Migrate: add gameName to combined game stages that don't have it yet
(function migrateCombinedGameNames() {
    var games = loadCustomGames();
    var combinedGames = loadCombinedGames();
    var changed = false;
    combinedGames.forEach(function(cg) {
        cg.stages.forEach(function(stage) {
            if (!stage.gameName && games[stage.gameIndex]) {
                stage.gameName = games[stage.gameIndex].name;
                changed = true;
            }
        });
    });
    if (changed) saveCombinedGames(combinedGames);
})();

// Initialize game lists on page load
populateLibraryGames();
populateStartScreenGames();
populateCardMakerGames();
