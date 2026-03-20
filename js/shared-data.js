/**
 * Vica Domino - Shared Data Layer
 *
 * Provides localStorage-based persistence functions shared across
 * Card Editor, Game Creator, and Games apps.
 */

// ---- Custom Games (savedCustomGames) ----

function loadCustomGames() {
    try {
        var data = localStorage.getItem('savedCustomGames');
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

function saveCustomGames(games) {
    localStorage.setItem('savedCustomGames', JSON.stringify(games));
}

// ---- Combined Games (savedCombinedGames) ----

function loadCombinedGames() {
    try {
        var data = localStorage.getItem('savedCombinedGames');
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

function saveCombinedGames(games) {
    localStorage.setItem('savedCombinedGames', JSON.stringify(games));
}

// ---- Card Sets (savedCardSets) ----

function loadCardSets() {
    try {
        var data = localStorage.getItem('savedCardSets');
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

function saveCardSets(sets) {
    localStorage.setItem('savedCardSets', JSON.stringify(sets));
}

// ---- Per-game excluded dominos ----

function getDominoKey(d) {
    return d.leftCard.label + ':' + d.rightCard.label;
}

function getExcludedDominos(gameIndex) {
    try {
        var data = localStorage.getItem('excludedDominos_' + gameIndex);
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

function saveExcludedDominos(gameIndex, excludedKeys) {
    localStorage.setItem('excludedDominos_' + gameIndex, JSON.stringify(excludedKeys));
}

// ---- Per-game excluded variations ----

function getExcludedVariations(gameIndex) {
    try {
        var data = localStorage.getItem('excludedVariations_' + gameIndex);
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

function saveExcludedVariations(gameIndex, excludedKeys) {
    localStorage.setItem('excludedVariations_' + gameIndex, JSON.stringify(excludedKeys));
}

function getVariationKey(originalLabel, transform) {
    return originalLabel + ':' + transform;
}

// ---- Card building from stored markup ----

function buildCardFromMarkup(cardInfo) {
    if (!cardInfo.svgMarkup) return null;
    var card = document.createElement('div');
    card.className = 'library-card';
    var labelDiv = document.createElement('div');
    labelDiv.className = 'library-label';
    labelDiv.textContent = cardInfo.label;
    card.appendChild(labelDiv);
    var preview = document.createElement('div');
    preview.className = 'domino-half-preview';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.innerHTML = cardInfo.svgMarkup;
    if (cardInfo.isVariation && cardInfo.transform) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', cardInfo.transform);
        while (svg.firstChild) g.appendChild(svg.firstChild);
        svg.appendChild(g);
    }
    preview.appendChild(svg);
    card.appendChild(preview);
    var desc = document.createElement('div');
    desc.className = 'library-desc';
    desc.textContent = '';
    card.appendChild(desc);
    return card;
}

// ---- SVG fallback builder (no DOM dependencies on card editor) ----

function buildSVGFromMarkup(cardInfo) {
    if (!cardInfo.svgMarkup) return null;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    svg.innerHTML = cardInfo.svgMarkup;
    if (cardInfo.isVariation && cardInfo.transform) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', cardInfo.transform);
        while (svg.firstChild) g.appendChild(svg.firstChild);
        svg.appendChild(g);
    }
    return svg;
}

// ---- Resolve combined game stage to actual game index ----

function resolveStageGameIndex(stage) {
    var games = loadCustomGames();
    // First try to find by name (robust against index shifts from deletes)
    if (stage.gameName) {
        for (var i = 0; i < games.length; i++) {
            if (games[i].name === stage.gameName) return i;
        }
    }
    // Fallback to stored index
    if (games[stage.gameIndex]) return stage.gameIndex;
    return -1;
}

// ---- Utility ----

function randomPick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}
