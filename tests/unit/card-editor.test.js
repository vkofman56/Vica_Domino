/**
 * Unit tests for js/card-editor.js — Card Editor module.
 */
const { loadCardEditorModule, buildCardEditorDOM } = require('../setup');

beforeAll(() => {
  loadCardEditorModule();
});

beforeEach(() => {
  buildCardEditorDOM();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Grid utilities
// ---------------------------------------------------------------------------
describe('Grid utilities', () => {
  test('GRID_UNIT equals 0.6', () => {
    expect(GRID_UNIT).toBeCloseTo(0.6);
  });

  test('snapToGrid rounds to nearest grid unit', () => {
    expect(snapToGrid(0)).toBe(0);
    expect(snapToGrid(0.6)).toBeCloseTo(0.6);
    expect(snapToGrid(0.3)).toBeCloseTo(0.6); // rounds to nearest 0.6
    expect(snapToGrid(0.9)).toBeCloseTo(1.2); // 0.9/0.6 = 1.5 -> rounds to 2 -> 2*0.6 = 1.2
    expect(snapToGrid(1.0)).toBeCloseTo(1.2); // 1.0/0.6 ≈ 1.67 -> rounds to 2 -> 1.2
  });

  test('gridToSvg converts grid units to SVG units', () => {
    expect(gridToSvg(0)).toBe(0);
    expect(gridToSvg(1)).toBeCloseTo(0.6);
    expect(gridToSvg(10)).toBeCloseTo(6);
    expect(gridToSvg(100)).toBeCloseTo(60);
  });

  test('svgToGrid converts SVG units to grid units', () => {
    expect(svgToGrid(0)).toBe(0);
    expect(svgToGrid(0.6)).toBeCloseTo(1);
    expect(svgToGrid(6)).toBeCloseTo(10);
    expect(svgToGrid(60)).toBeCloseTo(100);
  });

  test('gridToSvg and svgToGrid are inverses', () => {
    for (let v = 0; v <= 100; v += 10) {
      expect(svgToGrid(gridToSvg(v))).toBeCloseTo(v);
    }
  });
});

// ---------------------------------------------------------------------------
// getEffectiveSize
// ---------------------------------------------------------------------------
describe('getEffectiveSize', () => {
  test('returns sum of coarse and fine, capped at 100', () => {
    // getEffectiveSize uses global drawSizeCoarse and drawSizeFine
    // We test its behavior by calling it (it reads module-scoped vars)
    const size = getEffectiveSize();
    expect(size).toBeGreaterThanOrEqual(0);
    expect(size).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// getNextLetter
// ---------------------------------------------------------------------------
describe('getNextLetter', () => {
  test('returns A when no letters are used', () => {
    expect(getNextLetter([])).toBe('A');
  });

  test('skips used letters', () => {
    expect(getNextLetter(['A'])).toBe('B');
    expect(getNextLetter(['A', 'B'])).toBe('C');
    expect(getNextLetter(['A', 'C'])).toBe('B');
  });

  test('returns null when all 26 letters are used', () => {
    const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(getNextLetter(all)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getNextNumber
// ---------------------------------------------------------------------------
describe('getNextNumber', () => {
  test('returns 1 when no cards with letter exist', () => {
    expect(getNextNumber('C')).toBe(1);
  });

  test('returns max+1 for existing labels', () => {
    // The DOM has A1 and A2 in card-set-numbers
    expect(getNextNumber('A')).toBe(3);
  });

  test('returns max+1 for B labels', () => {
    // The DOM has B1
    expect(getNextNumber('B')).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// generateCopyLabel
// ---------------------------------------------------------------------------
describe('generateCopyLabel', () => {
  test('generates label in same letter group', () => {
    const label = generateCopyLabel('A1');
    expect(label.charAt(0)).toBe('A');
    // Should be A3 since A1 and A2 exist in DOM
    expect(label).toBe('A3');
  });

  test('generates label for B group', () => {
    const label = generateCopyLabel('B1');
    expect(label.charAt(0)).toBe('B');
    expect(label).toBe('B2');
  });
});

// ---------------------------------------------------------------------------
// cardMakerLabelToGameLabel
// ---------------------------------------------------------------------------
describe('cardMakerLabelToGameLabel', () => {
  test('converts single digit: A1 -> A01', () => {
    expect(cardMakerLabelToGameLabel('A1')).toBe('A01');
  });

  test('converts B2 -> B02', () => {
    expect(cardMakerLabelToGameLabel('B2')).toBe('B02');
  });

  test('passes through already-formatted labels', () => {
    expect(cardMakerLabelToGameLabel('A01')).toBe('A01');
  });

  test('passes through labels that do not match pattern', () => {
    expect(cardMakerLabelToGameLabel('ABC')).toBe('ABC');
  });
});

// ---------------------------------------------------------------------------
// isMathOperator
// ---------------------------------------------------------------------------
describe('isMathOperator', () => {
  test('returns true for math operators in text elements', () => {
    const operators = ['+', '-', '\u00D7', '\u00F7', '='];
    operators.forEach(op => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.textContent = op;
      expect(isMathOperator(el)).toBe(true);
    });
  });

  test('returns false for letters/numbers in text elements', () => {
    ['A', '1', 'X', '7'].forEach(ch => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.textContent = ch;
      expect(isMathOperator(el)).toBe(false);
    });
  });

  test('returns false for non-text elements', () => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    expect(isMathOperator(el)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getElementPosition / setElementPosition
// ---------------------------------------------------------------------------
describe('getElementPosition', () => {
  const ns = 'http://www.w3.org/2000/svg';

  test('gets position for text elements', () => {
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', '10');
    el.setAttribute('y', '20');
    expect(getElementPosition(el)).toEqual({ x: 10, y: 20 });
  });

  test('gets position for circle elements (center)', () => {
    const el = document.createElementNS(ns, 'circle');
    el.setAttribute('cx', '30');
    el.setAttribute('cy', '40');
    expect(getElementPosition(el)).toEqual({ x: 30, y: 40 });
  });

  test('gets position for ellipse elements', () => {
    const el = document.createElementNS(ns, 'ellipse');
    el.setAttribute('cx', '15');
    el.setAttribute('cy', '25');
    expect(getElementPosition(el)).toEqual({ x: 15, y: 25 });
  });

  test('gets center position for rect elements', () => {
    const el = document.createElementNS(ns, 'rect');
    el.setAttribute('x', '10');
    el.setAttribute('y', '20');
    el.setAttribute('width', '30');
    el.setAttribute('height', '40');
    expect(getElementPosition(el)).toEqual({ x: 25, y: 40 });
  });

  test('returns {0,0} for unknown elements', () => {
    const el = document.createElementNS(ns, 'path');
    expect(getElementPosition(el)).toEqual({ x: 0, y: 0 });
  });
});

describe('setElementPosition', () => {
  const ns = 'http://www.w3.org/2000/svg';

  test('sets position for text elements', () => {
    const el = document.createElementNS(ns, 'text');
    setElementPosition(el, { x: 15, y: 25 });
    expect(el.getAttribute('x')).toBe('15');
    expect(el.getAttribute('y')).toBe('25');
  });

  test('sets position for circle elements', () => {
    const el = document.createElementNS(ns, 'circle');
    setElementPosition(el, { x: 30, y: 40 });
    expect(el.getAttribute('cx')).toBe('30');
    expect(el.getAttribute('cy')).toBe('40');
  });
});

// ---------------------------------------------------------------------------
// pixelsMatch
// ---------------------------------------------------------------------------
describe('pixelsMatch', () => {
  test('returns true for identical pixel arrays', () => {
    const a = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const b = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    expect(pixelsMatch(a, b)).toBe(true);
  });

  test('returns true for nearly identical pixels (within threshold)', () => {
    const a = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const b = new Uint8ClampedArray([250, 5, 0, 255, 0, 250, 5, 255]);
    expect(pixelsMatch(a, b)).toBe(true);
  });

  test('returns false for very different pixels', () => {
    const a = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const b = new Uint8ClampedArray([0, 255, 255, 0, 255, 0, 255, 0]);
    expect(pixelsMatch(a, b)).toBe(false);
  });

  test('returns false when arrays are null', () => {
    expect(pixelsMatch(null, null)).toBe(false);
    expect(pixelsMatch(null, new Uint8ClampedArray(4))).toBe(false);
  });

  test('returns false for different length arrays', () => {
    const a = new Uint8ClampedArray([255, 0, 0, 255]);
    const b = new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]);
    expect(pixelsMatch(a, b)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createVariationSVG
// ---------------------------------------------------------------------------
describe('createVariationSVG', () => {
  test('wraps SVG children in a transformed group', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 60 60');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '30');
    circle.setAttribute('cy', '30');
    circle.setAttribute('r', '10');
    svg.appendChild(circle);

    const result = createVariationSVG(svg, 'rotate(90, 30, 30)');
    const g = result.querySelector('g');
    expect(g).not.toBeNull();
    expect(g.getAttribute('transform')).toBe('rotate(90, 30, 30)');
    expect(g.getAttribute('data-variation-transform')).toBe('1');
    expect(g.querySelector('circle')).not.toBeNull();
  });

  test('does not mutate the original SVG', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = 'A';
    svg.appendChild(text);

    createVariationSVG(svg, 'translate(60, 0) scale(-1, 1)');
    // Original should still have its text child
    expect(svg.querySelector('text')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// variationTools
// ---------------------------------------------------------------------------
describe('variationTools', () => {
  test('defines 8 variation tools', () => {
    expect(variationTools).toHaveLength(8);
  });

  test('each tool has transform and desc', () => {
    variationTools.forEach(tool => {
      expect(tool).toHaveProperty('transform');
      expect(tool).toHaveProperty('desc');
      expect(tool.transform.length).toBeGreaterThan(0);
      expect(tool.desc.length).toBeGreaterThan(0);
    });
  });

  test('last tool is symbol toggle', () => {
    expect(variationTools[7].transform).toBe('__symbol_toggle__');
    expect(variationTools[7].desc).toContain('Toggle');
  });
});

// ---------------------------------------------------------------------------
// getGameSetKey
// ---------------------------------------------------------------------------
describe('getGameSetKey', () => {
  test('returns abc for games with only ABC cards', () => {
    const game = { cards: [{ cardSet: 'ABC' }, { cardSet: 'ABC' }] };
    expect(getGameSetKey(game)).toBe('abc');
  });

  test('returns numbers for games with Numbers and Dots cards', () => {
    const game = { cards: [{ cardSet: 'Numbers and Dots' }] };
    expect(getGameSetKey(game)).toBe('numbers');
  });

  test('returns numbers for cards with missing cardSet (default)', () => {
    const game = { cards: [{ label: 'A1' }] };
    expect(getGameSetKey(game)).toBe('numbers');
  });

  test('returns null for mixed card sets', () => {
    const game = { cards: [{ cardSet: 'ABC' }, { cardSet: 'Numbers and Dots' }] };
    expect(getGameSetKey(game)).toBeNull();
  });

  test('returns null for empty cards array', () => {
    expect(getGameSetKey({ cards: [] })).toBeNull();
  });

  test('returns null when cards is missing', () => {
    expect(getGameSetKey({})).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getRowLetter
// ---------------------------------------------------------------------------
describe('getRowLetter', () => {
  test('returns data-row-letter attribute if set', () => {
    const row = document.createElement('div');
    row.dataset.rowLetter = 'C';
    expect(getRowLetter(row)).toBe('C');
  });

  test('returns first char of first label if no data attribute', () => {
    const row = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'library-label';
    label.textContent = 'D3';
    row.appendChild(label);
    expect(getRowLetter(row)).toBe('D');
  });

  test('returns empty string when no label or attribute', () => {
    const row = document.createElement('div');
    expect(getRowLetter(row)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// updateRowEmptyState
// ---------------------------------------------------------------------------
describe('updateRowEmptyState', () => {
  test('adds empty-row class when no cards', () => {
    const row = document.createElement('div');
    row.className = 'library-row';
    updateRowEmptyState(row);
    expect(row.classList.contains('empty-row')).toBe(true);
  });

  test('removes empty-row class when cards exist', () => {
    const row = document.createElement('div');
    row.className = 'library-row empty-row';
    const card = document.createElement('div');
    card.className = 'library-card';
    row.appendChild(card);
    updateRowEmptyState(row);
    expect(row.classList.contains('empty-row')).toBe(false);
  });

  test('handles null input gracefully', () => {
    expect(() => updateRowEmptyState(null)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// findCardByLabel
// ---------------------------------------------------------------------------
describe('findCardByLabel', () => {
  test('finds card A1 in Numbers and Dots set', () => {
    const card = findCardByLabel('A1', 'Numbers and Dots');
    expect(card).not.toBeNull();
    expect(card.querySelector('.library-label').textContent).toBe('A1');
  });

  test('finds card B1', () => {
    const card = findCardByLabel('B1', 'Numbers and Dots');
    expect(card).not.toBeNull();
  });

  test('returns null for non-existent label', () => {
    expect(findCardByLabel('Z9', 'Numbers and Dots')).toBeNull();
  });

  test('searches in domino-library-screen when cardSet not specified', () => {
    const card = findCardByLabel('A1');
    expect(card).not.toBeNull();
  });

  test('finds ABC cards by game label format (A01 matches A1 in DOM)', () => {
    // Build ABC card set in DOM with Card Maker labels (A1, B1, etc.)
    var abcDiv = document.getElementById('card-set-abc');
    abcDiv.innerHTML = `
      <div class="library-card">
        <div class="library-label">A1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>ABC-A1</text></svg>
        </div>
      </div>
      <div class="library-card">
        <div class="library-label">B2</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>ABC-B2</text></svg>
        </div>
      </div>
    `;
    // Game labels use A01 format — should still find A1
    var card = findCardByLabel('A01', 'ABC');
    expect(card).not.toBeNull();
    expect(card.querySelector('.library-label').textContent).toBe('A1');

    var card2 = findCardByLabel('B02', 'ABC');
    expect(card2).not.toBeNull();
    expect(card2.querySelector('.library-label').textContent).toBe('B2');

    // Direct Card Maker label should still work too
    var card3 = findCardByLabel('A1', 'ABC');
    expect(card3).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// toggleLibRuler
// ---------------------------------------------------------------------------
describe('toggleLibRuler', () => {
  test('toggles ruler display between none and block', () => {
    const ruler = document.getElementById('lib-ruler-rect');
    expect(ruler.style.display).toBe('none');
    toggleLibRuler();
    expect(ruler.style.display).toBe('block');
    toggleLibRuler();
    expect(ruler.style.display).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// syncAbcCardsToGame — must NOT overwrite non-ABC games
// ---------------------------------------------------------------------------
describe('syncAbcCardsToGame', () => {
  test('only updates the game named ABC, not other games with ABC cards', () => {
    // Create two games: "ABC" and "letters" both using cardSet: 'ABC'
    var abcGame = {
      name: 'ABC',
      description: 'Default ABC game',
      cards: [
        { label: 'A01', isVariation: false, svgMarkup: '<text>old-A-abc</text>', cardSet: 'ABC' },
        { label: 'B01', isVariation: false, svgMarkup: '<text>old-B-abc</text>', cardSet: 'ABC' },
      ]
    };
    var lettersGame = {
      name: 'letters',
      description: 'Custom letters game',
      cards: [
        { label: 'A01', isVariation: false, svgMarkup: '<text>custom-A-letters</text>', cardSet: 'ABC' },
        { label: 'B01', isVariation: false, svgMarkup: '<text>custom-B-letters</text>', cardSet: 'ABC' },
      ]
    };
    saveCustomGames([abcGame, lettersGame]);

    // Build ABC card set in DOM with new markup
    var abcDiv = document.getElementById('card-set-abc');
    abcDiv.innerHTML = `
      <div class="library-card">
        <div class="library-label">A1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>new-A-from-cardmaker</text></svg>
        </div>
      </div>
      <div class="library-card">
        <div class="library-label">B1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>new-B-from-cardmaker</text></svg>
        </div>
      </div>
    `;

    syncAbcCardsToGame();

    var games = loadCustomGames();
    // ABC game should be updated
    expect(games[0].cards[0].svgMarkup).toBe('<text>new-A-from-cardmaker</text>');
    expect(games[0].cards[1].svgMarkup).toBe('<text>new-B-from-cardmaker</text>');
    // "letters" game must NOT be touched
    expect(games[1].cards[0].svgMarkup).toBe('<text>custom-A-letters</text>');
    expect(games[1].cards[1].svgMarkup).toBe('<text>custom-B-letters</text>');
  });
});

// ---------------------------------------------------------------------------
// openGameView — must not overwrite game card svgMarkup
// ---------------------------------------------------------------------------
describe('openGameView', () => {
  test('does not overwrite non-ABC game svgMarkup when opening game view', () => {
    // Put different markup in the ABC Card Maker DOM
    var abcDiv = document.getElementById('card-set-abc');
    abcDiv.innerHTML = `
      <div class="library-card">
        <div class="library-label">A1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>DIFFERENT-A</text></svg>
        </div>
      </div>
    `;

    var lettersGame = {
      name: 'letters',
      description: 'Custom letters game',
      cards: [
        { label: 'A01', isVariation: false, svgMarkup: '<text>custom-A</text>', cardSet: 'ABC' },
        { label: 'B01', isVariation: false, svgMarkup: '<text>custom-B</text>', cardSet: 'ABC' },
        { label: 'C01', isVariation: false, svgMarkup: '<text>custom-C</text>', cardSet: 'ABC' },
      ]
    };
    saveCustomGames([lettersGame]);

    openGameView(0, 'card-library-screen');

    // Verify stored svgMarkup was NOT overwritten by Card Maker DOM
    var games = loadCustomGames();
    expect(games[0].cards[0].svgMarkup).toBe('<text>custom-A</text>');
    expect(games[0].cards[1].svgMarkup).toBe('<text>custom-B</text>');
    expect(games[0].cards[2].svgMarkup).toBe('<text>custom-C</text>');
  });
});

// ---------------------------------------------------------------------------
// Erase mode
// ---------------------------------------------------------------------------
describe('toggleGameViewEraseMode', () => {
  test('toggles erase mode on and off via DOM class', () => {
    var container = document.getElementById('game-view-cards');
    var btn = document.getElementById('game-view-erase-btn');
    expect(container.classList.contains('erase-mode')).toBe(false);
    toggleGameViewEraseMode();
    expect(container.classList.contains('erase-mode')).toBe(true);
    expect(btn.style.opacity).toBe('1');
    toggleGameViewEraseMode();
    expect(container.classList.contains('erase-mode')).toBe(false);
    expect(btn.style.opacity).toBe('0.4');
  });
});

describe('eraseGameCard', () => {
  beforeEach(() => {
    var game = {
      name: 'TestGame',
      description: 'Test',
      cards: [
        { label: 'A01', isVariation: false, svgMarkup: '<text>A</text>', cardSet: 'ABC' },
        { label: 'A02', isVariation: false, svgMarkup: '<text>a</text>', cardSet: 'ABC' },
        { label: 'B01', isVariation: false, svgMarkup: '<text>B</text>', cardSet: 'ABC' },
        { label: 'B02', isVariation: false, svgMarkup: '<text>b</text>', cardSet: 'ABC' },
      ]
    };
    saveCustomGames([game]);
  });

  test('removes a single card from the game', () => {
    eraseGameCard('A01', 0);
    var games = loadCustomGames();
    var labels = games[0].cards.map(c => c.label);
    expect(labels).not.toContain('A01');
    expect(labels).toContain('A02');
    expect(labels).toContain('B01');
    expect(labels).toContain('B02');
  });

  test('also removes variations of the erased card', () => {
    var games = loadCustomGames();
    games[0].cards.push({ label: 'A01v1', isVariation: true, originalLabel: 'A01', svgMarkup: '<text>Av</text>', cardSet: 'ABC' });
    saveCustomGames(games);

    eraseGameCard('A01', 0);
    games = loadCustomGames();
    var labels = games[0].cards.map(c => c.label);
    expect(labels).not.toContain('A01');
    expect(labels).not.toContain('A01v1');
  });

  test('cleans up excluded dominos referencing erased card', () => {
    saveExcludedDominos(0, ['A01:B01', 'A02:B01', 'B01:B02']);
    eraseGameCard('A01', 0);
    var excluded = getExcludedDominos(0);
    expect(excluded).not.toContain('A01:B01');
    expect(excluded).toContain('A02:B01');
    expect(excluded).toContain('B01:B02');
  });

  test('prevents erasing when only 2 cards remain', () => {
    var games = loadCustomGames();
    games[0].cards = [
      { label: 'A01', isVariation: false, svgMarkup: '<text>A</text>', cardSet: 'ABC' },
      { label: 'B01', isVariation: false, svgMarkup: '<text>B</text>', cardSet: 'ABC' },
    ];
    saveCustomGames(games);
    // Mock alert
    var alertCalled = false;
    var origAlert = global.alert;
    global.alert = function() { alertCalled = true; };
    eraseGameCard('A01', 0);
    global.alert = origAlert;
    // Card should NOT be erased
    games = loadCustomGames();
    expect(games[0].cards).toHaveLength(2);
    expect(alertCalled).toBe(true);
  });
});

describe('eraseGameRow', () => {
  beforeEach(() => {
    var game = {
      name: 'TestGame',
      description: 'Test',
      cards: [
        { label: 'A01', isVariation: false, svgMarkup: '<text>A</text>', cardSet: 'ABC' },
        { label: 'A02', isVariation: false, svgMarkup: '<text>a</text>', cardSet: 'ABC' },
        { label: 'B01', isVariation: false, svgMarkup: '<text>B</text>', cardSet: 'ABC' },
        { label: 'B02', isVariation: false, svgMarkup: '<text>b</text>', cardSet: 'ABC' },
        { label: 'C01', isVariation: false, svgMarkup: '<text>C</text>', cardSet: 'ABC' },
      ]
    };
    saveCustomGames([game]);
    // Mock confirm to auto-accept
    global._origConfirm = global.confirm;
    global.confirm = function() { return true; };
  });

  afterEach(() => {
    global.confirm = global._origConfirm;
  });

  test('removes all cards of a given row letter', () => {
    eraseGameRow('A', 0);
    var games = loadCustomGames();
    var labels = games[0].cards.map(c => c.label);
    expect(labels).not.toContain('A01');
    expect(labels).not.toContain('A02');
    expect(labels).toContain('B01');
    expect(labels).toContain('B02');
    expect(labels).toContain('C01');
  });

  test('cleans up excluded dominos referencing erased row', () => {
    saveExcludedDominos(0, ['A01:B01', 'A02:C01', 'B01:C01']);
    eraseGameRow('A', 0);
    var excluded = getExcludedDominos(0);
    expect(excluded).not.toContain('A01:B01');
    expect(excluded).not.toContain('A02:C01');
    expect(excluded).toContain('B01:C01');
  });

  test('prevents erasing when too few cards would remain', () => {
    var games = loadCustomGames();
    // Only have A and B rows (2 cards each), erasing B would leave only A
    games[0].cards = [
      { label: 'A01', isVariation: false, svgMarkup: '<text>A</text>', cardSet: 'ABC' },
      { label: 'B01', isVariation: false, svgMarkup: '<text>B</text>', cardSet: 'ABC' },
    ];
    saveCustomGames(games);
    var alertCalled = false;
    var origAlert = global.alert;
    global.alert = function() { alertCalled = true; };
    eraseGameRow('B', 0);
    global.alert = origAlert;
    games = loadCustomGames();
    expect(games[0].cards).toHaveLength(2);
    expect(alertCalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCardRow — effective row letter for a game card
// ---------------------------------------------------------------------------
describe('getCardRow', () => {
  test('returns gameRow when set', () => {
    expect(getCardRow({ label: 'A1', gameRow: 'D' })).toBe('D');
  });

  test('falls back to first character of label when gameRow is absent', () => {
    expect(getCardRow({ label: 'B2' })).toBe('B');
  });

  test('falls back when gameRow is undefined', () => {
    expect(getCardRow({ label: 'C3', gameRow: undefined })).toBe('C');
  });
});

// ---------------------------------------------------------------------------
// addCardsToCurrentGame — new cards go into a new alphabetically-named row
// ---------------------------------------------------------------------------
describe('addCardsToCurrentGame', () => {
  beforeEach(() => {
    // Stub openGameView and toggleGameViewAddCards to prevent DOM errors
    global._origOpenGameView = global.openGameView;
    global._origToggleAdd = global.toggleGameViewAddCards;
    global.openGameView = function() {};
    global.toggleGameViewAddCards = function() {};
    global.gameViewAddMode = false;
    global.gameViewReturnScreen = 'card-library-screen';
    global.currentGameViewIndex = 0;
  });

  afterEach(() => {
    global.openGameView = global._origOpenGameView;
    global.toggleGameViewAddCards = global._origToggleAdd;
  });

  test('newly added card gets a gameRow property', () => {
    // Start with a game that has cards in row A
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'A2', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'B1', svgContent: '<text>B</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    const added = games[0].cards.find(c => c.label === 'B1');
    expect(added).toBeTruthy();
    expect(added.gameRow).toBeDefined();
  });

  test('new card row letter is after the last existing row', () => {
    // Row A is taken by existing cards
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'A2', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'B1', svgContent: '<text>B</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    const added = games[0].cards.find(c => c.label === 'B1');
    // A is used by existing cards, so new card should go to B (after A)
    expect(added.gameRow).toBe('B');
  });

  test('places new row after the highest existing row', () => {
    // Rows A and B are used
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>B</text>' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'C1', svgContent: '<text>C</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    const added = games[0].cards.find(c => c.label === 'C1');
    // Last row is B, so new card goes to C (after B)
    expect(added.gameRow).toBe('C');
  });

  test('uses gameRow property to determine last row', () => {
    // Row A by label, row B by gameRow
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'X1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>X</text>', gameRow: 'B' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'D1', svgContent: '<text>D</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    const added = games[0].cards.find(c => c.label === 'D1');
    // Highest row is B (by gameRow), so new card goes to C
    expect(added.gameRow).toBe('C');
  });

  test('new row goes after last row even when there are gaps', () => {
    // Rows A and C are used (B is a gap)
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'X1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>X</text>', gameRow: 'C' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'E1', svgContent: '<text>E</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    const added = games[0].cards.find(c => c.label === 'E1');
    // Highest row is C, so new card goes to D (not B)
    expect(added.gameRow).toBe('D');
  });

  test('all cards in one batch get the same new row letter', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
      ]
    }]);

    addCardsToCurrentGame(
      [
        { label: 'C1', svgContent: '<text>C</text>' },
        { label: 'D1', svgContent: '<text>D</text>' },
      ],
      'ABC', 0
    );

    const games = loadCustomGames();
    const c1 = games[0].cards.find(c => c.label === 'C1');
    const d1 = games[0].cards.find(c => c.label === 'D1');
    expect(c1.gameRow).toBe('B');
    expect(d1.gameRow).toBe('B');
  });

  test('does not add duplicate cards', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'A1', svgContent: '<text>A</text>' }],
      'ABC', 0
    );

    const games = loadCustomGames();
    expect(games[0].cards).toHaveLength(1);
  });

  test('openGameView groups cards by gameRow when set', () => {
    // Restore real openGameView for this test
    global.openGameView = global._origOpenGameView;

    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'A2', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>A</text>' },
        { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: '<text>B</text>', gameRow: 'C' },
      ]
    }]);

    openGameView(0, 'card-library-screen');

    const container = document.getElementById('game-view-cards');
    const rows = container.querySelectorAll('.library-row');
    // Should have 2 rows: A (for A1, A2) and C (for B1 with gameRow=C)
    expect(rows).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// buildAvailableCardsArea — accordion card set picker
// ---------------------------------------------------------------------------
describe('buildAvailableCardsArea', () => {
  beforeEach(() => {
    // Set up a game with one card so some cards are "available"
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' },
      ]
    }]);
    global.currentGameViewIndex = 0;
  });

  test('renders accordion headers with correct CSS classes', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const headers = area.querySelectorAll('.add-cards-accordion-header');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    headers.forEach(h => {
      expect(h.classList.contains('add-cards-set-header')).toBe(true);
      expect(h.classList.contains('add-cards-accordion-header')).toBe(true);
    });
  });

  test('accordion bodies are hidden by default', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const bodies = area.querySelectorAll('.add-cards-accordion-body');
    expect(bodies.length).toBeGreaterThanOrEqual(1);
    bodies.forEach(body => {
      expect(body.style.display).toBe('none');
    });
  });

  test('clicking header expands its accordion body', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const header = area.querySelector('.add-cards-accordion-header');
    const body = area.querySelector('.add-cards-accordion-body');

    // Click to expand
    header.click();
    expect(body.style.display).toBe('block');
    expect(header.classList.contains('expanded')).toBe(true);
  });

  test('clicking header again collapses its accordion body', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const header = area.querySelector('.add-cards-accordion-header');
    const body = area.querySelector('.add-cards-accordion-body');

    // Click to expand, then click to collapse
    header.click();
    header.click();
    expect(body.style.display).toBe('none');
    expect(header.classList.contains('expanded')).toBe(false);
  });

  test('card rows are placed inside accordion body, not directly in area', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    // Row divs should be inside accordion bodies
    const rowsInBody = area.querySelectorAll('.add-cards-accordion-body .add-cards-row');
    const rowsDirectInArea = Array.from(area.children).filter(
      el => el.classList.contains('add-cards-row')
    );
    expect(rowsDirectInArea).toHaveLength(0);
    expect(rowsInBody.length).toBeGreaterThanOrEqual(1);
  });

  test('header has "Click to expand" title', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const header = area.querySelector('.add-cards-accordion-header');
    expect(header.title).toBe('Click to expand');
  });

  test('each card set source gets its own header-body pair', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const headers = area.querySelectorAll('.add-cards-accordion-header');
    const bodies = area.querySelectorAll('.add-cards-accordion-body');
    expect(headers.length).toBe(bodies.length);
  });

  test('multiple accordions toggle independently', () => {
    // Add ABC cards so there are at least 2 accordion sections
    const abcDiv = document.getElementById('card-set-abc');
    abcDiv.innerHTML = `
      <div class="library-card">
        <div class="library-label">X1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>X</text></svg>
        </div>
      </div>
    `;

    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const headers = area.querySelectorAll('.add-cards-accordion-header');
    const bodies = area.querySelectorAll('.add-cards-accordion-body');

    if (headers.length >= 2) {
      // Expand first
      headers[0].click();
      expect(bodies[0].style.display).toBe('block');
      expect(bodies[1].style.display).toBe('none');

      // Expand second — first stays open (independent)
      headers[1].click();
      expect(bodies[0].style.display).toBe('block');
      expect(bodies[1].style.display).toBe('block');

      // Collapse first — second stays open
      headers[0].click();
      expect(bodies[0].style.display).toBe('none');
      expect(bodies[1].style.display).toBe('block');
    }
  });

  test('clears area content before rebuilding', () => {
    const area = document.createElement('div');
    area.innerHTML = '<div class="old-content">stale</div>';

    buildAvailableCardsArea(0, area);

    expect(area.querySelector('.old-content')).toBeNull();
  });

  test('shows message when all cards are already in game', () => {
    // Hide both built-in sets so only Numbers (from DOM) is a source
    localStorage.setItem('deletedBuiltinSets', JSON.stringify(['abc']));
    // Clear ABC DOM so it has no cards
    document.getElementById('card-set-abc').innerHTML = '';

    // Add all Numbers cards to the game
    const numbersDiv = document.getElementById('card-set-numbers');
    const allLabels = [];
    numbersDiv.querySelectorAll('.library-card .library-label').forEach(lbl => {
      allLabels.push(lbl.textContent);
    });

    const cards = allLabels.map(label => ({
      label, isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>' + label + '</text>'
    }));
    saveCustomGames([{ name: 'Full', cards }]);

    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    // Should show the "all cards already in game" message
    const msg = area.querySelector('p');
    expect(msg).not.toBeNull();
    expect(msg.textContent).toContain('All available cards are already in this game');
  });

  test('does nothing for invalid game index', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(999, area);
    // Area should be empty (innerHTML cleared, nothing added)
    expect(area.children.length).toBe(0);
  });

  test('row buttons have correct title text', () => {
    const area = document.createElement('div');
    buildAvailableCardsArea(0, area);

    const rowBtns = area.querySelectorAll('.add-row-btn');
    rowBtns.forEach(btn => {
      expect(btn.title).toContain('as a new line');
    });
  });
});

// ---------------------------------------------------------------------------
// getAvailableCardsFromSet
// ---------------------------------------------------------------------------
describe('getAvailableCardsFromSet', () => {
  test('returns available Numbers and Dots cards not in game', () => {
    const inGame = { 'A1': true };
    const cards = getAvailableCardsFromSet(
      { name: 'Numbers and Dots', key: 'numbers', cardSetValue: 'Numbers and Dots' },
      inGame
    );
    // A1 is in game, so should not be in results
    const labels = cards.map(c => c.label);
    expect(labels).not.toContain('A1');
    // A2 and B1 are in the DOM and not in game
    expect(labels).toContain('A2');
    expect(labels).toContain('B1');
  });

  test('returns empty when all cards are in game', () => {
    const inGame = { 'A1': true, 'A2': true, 'B1': true };
    const cards = getAvailableCardsFromSet(
      { name: 'Numbers and Dots', key: 'numbers', cardSetValue: 'Numbers and Dots' },
      inGame
    );
    expect(cards).toHaveLength(0);
  });

  test('returns ABC cards from DOM', () => {
    const abcDiv = document.getElementById('card-set-abc');
    abcDiv.innerHTML = `
      <div class="library-card">
        <div class="library-label">A1</div>
        <div class="domino-half-preview">
          <svg viewBox="0 0 60 60"><text>ABC-A</text></svg>
        </div>
      </div>
    `;
    const cards = getAvailableCardsFromSet(
      { name: 'ABC', key: 'abc', cardSetValue: 'ABC' },
      {}
    );
    expect(cards).toHaveLength(1);
    expect(cards[0].label).toBe('A1');
  });

  test('returns custom set cards from localStorage', () => {
    const customCards = [
      { label: 'C1', svgContent: '<text>C</text>' },
      { label: 'C2', svgContent: '<text>C2</text>' },
    ];
    localStorage.setItem('customDrawnCards_MySet', JSON.stringify(customCards));

    const cards = getAvailableCardsFromSet(
      { name: 'MySet', key: 'MySet', cardSetValue: 'MySet', isCustom: true },
      { 'C1': true }
    );
    expect(cards).toHaveLength(1);
    expect(cards[0].label).toBe('C2');
  });

  test('skips custom cards with empty svgContent', () => {
    const customCards = [
      { label: 'D1', svgContent: '' },
      { label: 'D2', svgContent: '   ' },
      { label: 'D3', svgContent: '<text>D3</text>' },
    ];
    localStorage.setItem('customDrawnCards_TestSet', JSON.stringify(customCards));

    const cards = getAvailableCardsFromSet(
      { name: 'TestSet', key: 'TestSet', cardSetValue: 'TestSet', isCustom: true },
      {}
    );
    expect(cards).toHaveLength(1);
    expect(cards[0].label).toBe('D3');
  });

  test('returns empty for custom set with no localStorage data', () => {
    const cards = getAvailableCardsFromSet(
      { name: 'Nonexistent', key: 'Nonexistent', cardSetValue: 'Nonexistent', isCustom: true },
      {}
    );
    expect(cards).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// toggleGameViewAddCards
// ---------------------------------------------------------------------------
describe('toggleGameViewAddCards', () => {
  beforeEach(() => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' },
      ]
    }]);
    global.currentGameViewIndex = 0;
    global.gameViewAddMode = false;
    // Remove any existing add-cards area
    var existing = document.getElementById('game-view-add-cards-area');
    if (existing) existing.remove();
  });

  test('creates add-cards area on first toggle', () => {
    toggleGameViewAddCards();
    const area = document.getElementById('game-view-add-cards-area');
    expect(area).not.toBeNull();
    expect(area.style.display).toBe('block');
  });

  test('hides add-cards area on second toggle', () => {
    toggleGameViewAddCards();
    toggleGameViewAddCards();
    const area = document.getElementById('game-view-add-cards-area');
    expect(area.style.display).toBe('none');
  });

  test('toggles add button opacity to indicate active state', () => {
    const btn = document.getElementById('game-view-add-btn');
    toggleGameViewAddCards();
    expect(btn.style.opacity).toBe('1');
    toggleGameViewAddCards();
    expect(btn.style.opacity).toBe('');
  });
});

// ---------------------------------------------------------------------------
// completeGame — card ordering for custom card sets
// ---------------------------------------------------------------------------
describe('completeGame', () => {
  test('preserves DOM order for custom card set cards', () => {
    // Add DOM elements needed by cancelGameMaker (called at end of completeGame)
    if (!document.getElementById('game-maker-bar')) {
      const bar = document.createElement('div');
      bar.id = 'game-maker-bar';
      bar.style.display = 'none';
      const barText = document.createElement('span');
      barText.id = 'game-maker-bar-text';
      bar.appendChild(barText);
      document.body.appendChild(bar);
    }
    if (!document.getElementById('card-maker-set-title')) {
      const title = document.createElement('span');
      title.id = 'card-maker-set-title';
      document.body.appendChild(title);
    }

    // Populate card-set-custom with cards in a known order
    const customDiv = document.getElementById('card-set-custom');
    customDiv.style.display = '';
    customDiv.innerHTML = '';
    const labels = ['E1', 'E2', 'E3', 'E4', 'E5'];
    const row = document.createElement('div');
    row.className = 'library-row';
    labels.forEach(lbl => {
      const card = document.createElement('div');
      card.className = 'library-card';
      const labelEl = document.createElement('div');
      labelEl.className = 'library-label';
      labelEl.textContent = lbl;
      card.appendChild(labelEl);
      const preview = document.createElement('div');
      preview.className = 'domino-half-preview';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 60 60');
      svg.innerHTML = '<circle cx="30" cy="30" r="10"/>';
      preview.appendChild(svg);
      card.appendChild(preview);
      row.appendChild(card);
    });
    customDiv.appendChild(row);

    // Set up game maker state as if creating a new game from a custom set
    global.activeCardSet = 'MyCustomSet';
    // gameMakerEditIndex defaults to -1 (new game) in the module closure
    // Push items into the closure's array reference (don't replace it)
    gameMakerSelected.length = 0;
    labels.forEach(lbl => {
      gameMakerSelected.push({
        label: lbl,
        isVariation: false,
        cardSet: 'MyCustomSet',
        svgMarkup: '<circle cx="30" cy="30" r="10"/>'
      });
    });

    // Suppress alert and stub functions called at end of completeGame
    const origAlert = global.alert;
    global.alert = () => {};
    const origPopLib = global.populateLibraryGames;
    const origPopStart = global.populateStartScreenGames;
    const origPopCM = global.populateCardMakerGames;
    global.populateLibraryGames = () => {};
    global.populateStartScreenGames = () => {};
    global.populateCardMakerGames = () => {};
    completeGame();
    global.alert = origAlert;
    global.populateLibraryGames = origPopLib;
    global.populateStartScreenGames = origPopStart;
    global.populateCardMakerGames = origPopCM;

    // Verify saved game has cards in original DOM order
    const games = loadCustomGames();
    expect(games).toHaveLength(1);
    const savedLabels = games[0].cards.map(c => c.label);
    expect(savedLabels).toEqual(labels);

    // Restore
    global.activeCardSet = 'numbers';
  });
});

// ---------------------------------------------------------------------------
// setupGameViewDrag — drag-and-drop card reordering in game view
// ---------------------------------------------------------------------------
describe('setupGameViewDrag', () => {
  test('attaches pointer event listeners to container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const addSpy = jest.spyOn(container, 'addEventListener');

    setupGameViewDrag(container, 0);

    expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    addSpy.mockRestore();
    document.body.removeChild(container);
  });

  test('drag setup does not throw on empty container', () => {
    const container = document.createElement('div');
    expect(() => setupGameViewDrag(container, 0)).not.toThrow();
  });

  test('pointerdown on a card element starts tracking', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const row = document.createElement('div');
    row.className = 'library-row';
    row.dataset.gameRow = 'A';
    const card = document.createElement('div');
    card.className = 'library-card';
    card.dataset.cardLabel = 'A1';
    row.appendChild(card);
    container.appendChild(row);

    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);

    setupGameViewDrag(container, 0);

    // Simulate pointerdown — should not throw
    const event = new MouseEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true });
    expect(() => card.dispatchEvent(event)).not.toThrow();

    document.body.removeChild(container);
  });

  test('does not initiate drag on erase button click', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const row = document.createElement('div');
    row.className = 'library-row';
    row.dataset.gameRow = 'A';
    const card = document.createElement('div');
    card.className = 'library-card';
    card.dataset.cardLabel = 'A1';
    const eraseBtn = document.createElement('button');
    eraseBtn.className = 'card-erase-btn';
    card.appendChild(eraseBtn);
    row.appendChild(card);
    container.appendChild(row);

    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);

    setupGameViewDrag(container, 0);

    // Pointerdown on erase button should not add dragging class
    const event = new MouseEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true });
    eraseBtn.dispatchEvent(event);
    expect(card.classList.contains('dragging')).toBe(false);

    document.body.removeChild(container);
  });
});

// ---------------------------------------------------------------------------
// eraseGameCard — novel card removal
// ---------------------------------------------------------------------------
describe('eraseGameCard — novel card cleanup', () => {
  beforeEach(() => {
    global._origOpenGameView = global.openGameView;
    global.openGameView = function() {};
    global.gameViewReturnScreen = 'card-library-screen';
    global.gameViewEraseMode = false;
  });

  afterEach(() => {
    global.openGameView = global._origOpenGameView;
  });

  test('removes erased card from novel cards list', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B</text>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'B1']);

    eraseGameCard('A1', 0);

    const novels = getNovelCards(0);
    expect(novels).not.toContain('A1');
    expect(novels).toContain('B1');
  });

  test('preserves novel cards that are not erased', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B</text>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'A2', 'B1']);

    eraseGameCard('A2', 0);

    const novels = getNovelCards(0);
    expect(novels).toEqual(['A1', 'B1']);
  });

  test('erasing a non-novel card does not affect novel list', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B</text>' },
      ]
    }]);
    saveNovelCards(0, ['A1']);

    eraseGameCard('A2', 0);

    const novels = getNovelCards(0);
    expect(novels).toEqual(['A1']);
  });
});

// ---------------------------------------------------------------------------
// eraseGameRow — novel card removal for entire row
// ---------------------------------------------------------------------------
describe('eraseGameRow — novel card cleanup', () => {
  beforeEach(() => {
    global._origOpenGameView = global.openGameView;
    global.openGameView = function() {};
    global.gameViewReturnScreen = 'card-library-screen';
    global.gameViewEraseMode = false;
    global._origConfirm = global.confirm;
    global.confirm = () => true;
  });

  afterEach(() => {
    global.openGameView = global._origOpenGameView;
    global.confirm = global._origConfirm;
  });

  test('removes all cards in erased row from novel cards list', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B</text>' },
        { label: 'B2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B2</text>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'A2', 'B1']);

    eraseGameRow('A', 0);

    const novels = getNovelCards(0);
    expect(novels).not.toContain('A1');
    expect(novels).not.toContain('A2');
    expect(novels).toContain('B1');
  });

  test('handles row with gameRow property', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'X1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>', gameRow: 'A' },
        { label: 'X2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>', gameRow: 'A' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B</text>' },
        { label: 'B2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<text>B2</text>' },
      ]
    }]);
    saveNovelCards(0, ['X1', 'X2', 'B1']);

    eraseGameRow('A', 0);

    const novels = getNovelCards(0);
    expect(novels).not.toContain('X1');
    expect(novels).not.toContain('X2');
    expect(novels).toContain('B1');
  });
});

// ---------------------------------------------------------------------------
// copyGame — novelty data copying
// ---------------------------------------------------------------------------
describe('copyGame — novelty data', () => {
  beforeEach(() => {
    global._origPrompt = global.prompt;
    global._origAlert = global.alert;
    global._origOpenGameView = global.openGameView;
    global.prompt = () => 'Copy of Test';
    global.alert = () => {};
    global.openGameView = function() {};
    global.gameViewReturnScreen = 'card-library-screen';
  });

  afterEach(() => {
    global.prompt = global._origPrompt;
    global.alert = global._origAlert;
    global.openGameView = global._origOpenGameView;
  });

  test('copies novel cards to new game', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'B1']);

    copyGame(0);

    const novels = getNovelCards(1);
    expect(novels).toEqual(['A1', 'B1']);
  });

  test('copies novelty locked state to new game', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);
    saveNovelCards(0, ['A1']);
    setNoveltyLocked(0, true);

    copyGame(0);

    expect(getNoveltyLocked(1)).toBe(true);
  });

  test('does not copy novelty if source has none', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);

    copyGame(0);

    const novels = getNovelCards(1);
    expect(novels).toEqual([]);
    expect(getNoveltyLocked(1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteGame — novelty data cleanup
// ---------------------------------------------------------------------------
describe('deleteGame — novelty data cleanup', () => {
  beforeEach(() => {
    global._origConfirm = global.confirm;
    global._origOpenGameView = global.openGameView;
    global.confirm = () => true;
    global.openGameView = function() {};
    global.gameViewReturnScreen = 'card-library-screen';
  });

  afterEach(() => {
    global.confirm = global._origConfirm;
    global.openGameView = global._origOpenGameView;
  });

  test('clears novel cards when game is deleted', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'A2']);
    setNoveltyLocked(0, true);

    deleteGame(0);

    expect(getNovelCards(0)).toEqual([]);
    expect(getNoveltyLocked(0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildGameViewDomino — novel-domino class application
// ---------------------------------------------------------------------------
describe('buildGameViewDomino — novel-domino class', () => {
  beforeEach(() => {
    // Stub getGameCardSVGWithFallback which is used internally
    global._origGetGameCardSVG = global.getGameCardSVG;
    global.getGameCardSVG = function() { return null; };
  });

  afterEach(() => {
    global.getGameCardSVG = global._origGetGameCardSVG;
    window._gameViewNovelSet = null;
  });

  test('adds novel-domino class when left card is novel', () => {
    window._gameViewNovelSet = { 'A1': true };
    const domino = {
      leftCard: { label: 'A1', svgMarkup: '<circle/>' },
      rightCard: { label: 'B1', svgMarkup: '<rect/>' },
      isDouble: false
    };
    const el = buildGameViewDomino(domino);
    expect(el.classList.contains('novel-domino')).toBe(true);
  });

  test('adds novel-domino class when right card is novel', () => {
    window._gameViewNovelSet = { 'B1': true };
    const domino = {
      leftCard: { label: 'A1', svgMarkup: '<circle/>' },
      rightCard: { label: 'B1', svgMarkup: '<rect/>' },
      isDouble: false
    };
    const el = buildGameViewDomino(domino);
    expect(el.classList.contains('novel-domino')).toBe(true);
  });

  test('does not add novel-domino class when neither card is novel', () => {
    window._gameViewNovelSet = { 'C1': true };
    const domino = {
      leftCard: { label: 'A1', svgMarkup: '<circle/>' },
      rightCard: { label: 'B1', svgMarkup: '<rect/>' },
      isDouble: false
    };
    const el = buildGameViewDomino(domino);
    expect(el.classList.contains('novel-domino')).toBe(false);
  });

  test('does not add novel-domino class when novel set is null', () => {
    window._gameViewNovelSet = null;
    const domino = {
      leftCard: { label: 'A1', svgMarkup: '<circle/>' },
      rightCard: { label: 'B1', svgMarkup: '<rect/>' },
      isDouble: false
    };
    const el = buildGameViewDomino(domino);
    expect(el.classList.contains('novel-domino')).toBe(false);
  });

  test('adds double-domino class for double dominos', () => {
    window._gameViewNovelSet = null;
    const domino = {
      leftCard: { label: 'A1', svgMarkup: '<circle/>' },
      rightCard: { label: 'A1', svgMarkup: '<circle/>' },
      isDouble: true
    };
    const el = buildGameViewDomino(domino);
    expect(el.classList.contains('double-domino')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// hideGameView — novelty prompt trigger logic
// ---------------------------------------------------------------------------
describe('hideGameView — novelty prompt', () => {
  beforeEach(() => {
    global._origPopCM = global.populateCardMakerGames;
    global.populateCardMakerGames = function() {};
  });

  afterEach(() => {
    global.populateCardMakerGames = global._origPopCM;
    window._gameViewNovelSet = null;
  });

  test('calls doHideGameView directly when no novel cards', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [{ label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' }]
    }]);
    // Open game view to set internal currentGameViewIndex
    openGameView(0, 'card-library-screen');

    hideGameView();

    const gvScreen = document.getElementById('game-view-screen');
    expect(gvScreen.style.display).toBe('none');
  });

  test('calls doHideGameView directly when novelty is locked', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [{ label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' }]
    }]);
    saveNovelCards(0, ['A1']);
    setNoveltyLocked(0, true);
    openGameView(0, 'card-library-screen');

    hideGameView();

    const gvScreen = document.getElementById('game-view-screen');
    expect(gvScreen.style.display).toBe('none');
  });

  test('shows novelty prompt when novel cards exist and not locked', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [{ label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' }]
    }]);
    saveNovelCards(0, ['A1']);
    // Not locked
    openGameView(0, 'card-library-screen');

    hideGameView();

    // Prompt overlay should be visible
    const overlay = document.getElementById('novelty-prompt-overlay');
    expect(overlay.style.display).toBe('flex');
    // Clean up - dismiss the prompt
    document.getElementById('novelty-dismiss-btn').click();
  });

  test('doHideGameView clears _gameViewNovelSet', () => {
    window._gameViewNovelSet = { 'A1': true };
    doHideGameView();
    expect(window._gameViewNovelSet).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// showNoveltyPrompt — keep/dismiss interactions
// ---------------------------------------------------------------------------
describe('showNoveltyPrompt', () => {
  test('shows overlay and calls onDone when keep is clicked', () => {
    let doneCalled = false;
    showNoveltyPrompt(0, () => { doneCalled = true; });

    const overlay = document.getElementById('novelty-prompt-overlay');
    expect(overlay.style.display).toBe('flex');

    document.getElementById('novelty-keep-btn').click();
    expect(doneCalled).toBe(true);
    expect(overlay.style.display).toBe('none');
    expect(getNoveltyLocked(0)).toBe(true);
  });

  test('dismiss clears all novelty data', () => {
    saveNovelCards(0, ['A1', 'B1']);
    setNoveltyLocked(0, false);

    let doneCalled = false;
    showNoveltyPrompt(0, () => { doneCalled = true; });

    document.getElementById('novelty-dismiss-btn').click();
    expect(doneCalled).toBe(true);
    expect(getNovelCards(0)).toEqual([]);
    expect(getNoveltyLocked(0)).toBe(false);
  });

  test('slider toggles active class on click', () => {
    showNoveltyPrompt(0, () => {});

    const slider = document.getElementById('novelty-prompt-slider');
    expect(slider.classList.contains('active')).toBe(false);

    slider.click();
    expect(slider.classList.contains('active')).toBe(true);

    slider.click();
    expect(slider.classList.contains('active')).toBe(false);

    // Clean up
    document.getElementById('novelty-dismiss-btn').click();
  });

  test('calls onDone immediately if overlay element is missing', () => {
    const overlay = document.getElementById('novelty-prompt-overlay');
    overlay.id = 'novelty-prompt-overlay-hidden';

    let doneCalled = false;
    showNoveltyPrompt(0, () => { doneCalled = true; });
    expect(doneCalled).toBe(true);

    overlay.id = 'novelty-prompt-overlay';
  });
});

// ---------------------------------------------------------------------------
// openGameView — novel card pink border application
// ---------------------------------------------------------------------------
describe('openGameView — novel card borders', () => {
  test('applies novel-card class to novel non-variation cards', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' },
        { label: 'A2', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect x="10" y="10" width="20" height="20" fill="blue"/>' },
      ]
    }]);
    saveNovelCards(0, ['A1']);

    openGameView(0, 'card-library-screen');

    const container = document.getElementById('game-view-cards');
    const cards = container.querySelectorAll('.library-card');
    let novelCount = 0;
    cards.forEach(c => {
      if (c.dataset.cardLabel === 'A1') {
        expect(c.classList.contains('novel-card')).toBe(true);
        novelCount++;
      }
      if (c.dataset.cardLabel === 'A2') {
        expect(c.classList.contains('novel-card')).toBe(false);
      }
    });
    expect(novelCount).toBe(1);
  });

  test('does not apply novel-card class to variation cards', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>' },
        { label: 'A1v', isVariation: true, originalLabel: 'A1', cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="5" fill="green"/>' },
        { label: 'B1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<rect/>' },
      ]
    }]);
    saveNovelCards(0, ['A1', 'A1v']);

    openGameView(0, 'card-library-screen');

    const container = document.getElementById('game-view-cards');
    const varCard = container.querySelector('[data-card-label="A1v"]');
    // Variation cards should not get novel-card class even if in novel list
    if (varCard) {
      expect(varCard.classList.contains('novel-card')).toBe(false);
    }
  });

  test('sets data-cardLabel and data-gameRow on elements', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle cx="30" cy="30" r="10" fill="red"/>', gameRow: 'X' },
      ]
    }]);

    openGameView(0, 'card-library-screen');

    const container = document.getElementById('game-view-cards');
    const card = container.querySelector('[data-card-label="A1"]');
    expect(card).not.toBeNull();
    const row = container.querySelector('[data-game-row="X"]');
    expect(row).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// addCardsToCurrentGame — novel card tracking
// ---------------------------------------------------------------------------
describe('addCardsToCurrentGame — novel card tracking', () => {
  beforeEach(() => {
    global._origOpenGameView = global.openGameView;
    global._origToggleAdd = global.toggleGameViewAddCards;
    global.openGameView = function() {};
    global.toggleGameViewAddCards = function() {};
    global.gameViewAddMode = false;
    global.gameViewReturnScreen = 'card-library-screen';
    global.currentGameViewIndex = 0;
  });

  afterEach(() => {
    global.openGameView = global._origOpenGameView;
    global.toggleGameViewAddCards = global._origToggleAdd;
  });

  test('marks newly added cards as novel', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);

    addCardsToCurrentGame(
      [{ label: 'B1', svgContent: '<text>B</text>' }],
      'Numbers and Dots', 0
    );

    const novels = getNovelCards(0);
    expect(novels).toContain('B1');
  });

  test('does not duplicate novel labels when adding same card again', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);
    saveNovelCards(0, ['B1']);

    addCardsToCurrentGame(
      [{ label: 'B1', svgContent: '<text>B</text>' }],
      'Numbers and Dots', 0
    );

    // B1 is already in game (as duplicate), so it won't be added again
    // Novel list should still contain B1 exactly once
    const novels = getNovelCards(0);
    const b1Count = novels.filter(l => l === 'B1').length;
    expect(b1Count).toBeLessThanOrEqual(1);
  });

  test('adds multiple cards to novel list', () => {
    saveCustomGames([{
      name: 'Test',
      cards: [
        { label: 'A1', isVariation: false, cardSet: 'Numbers and Dots', svgMarkup: '<circle/>' },
      ]
    }]);

    addCardsToCurrentGame(
      [
        { label: 'C1', svgContent: '<text>C</text>' },
        { label: 'D1', svgContent: '<text>D</text>' },
      ],
      'Numbers and Dots', 0
    );

    const novels = getNovelCards(0);
    expect(novels).toContain('C1');
    expect(novels).toContain('D1');
  });
});

// ---------------------------------------------------------------------------
// Shared data layer — novel card persistence functions
// ---------------------------------------------------------------------------
describe('Novel card persistence (shared-data)', () => {
  test('getNovelCards returns empty array when no data', () => {
    expect(getNovelCards(0)).toEqual([]);
  });

  test('saveNovelCards and getNovelCards round-trip', () => {
    saveNovelCards(0, ['A1', 'B1', 'C1']);
    expect(getNovelCards(0)).toEqual(['A1', 'B1', 'C1']);
  });

  test('saveNovelCards removes key when empty array', () => {
    saveNovelCards(0, ['A1']);
    saveNovelCards(0, []);
    expect(localStorage.getItem('novelCards_0')).toBeNull();
  });

  test('getNoveltyLocked returns false by default', () => {
    expect(getNoveltyLocked(0)).toBe(false);
  });

  test('setNoveltyLocked persists lock state', () => {
    setNoveltyLocked(0, true);
    expect(getNoveltyLocked(0)).toBe(true);
  });

  test('setNoveltyLocked(false) removes the key', () => {
    setNoveltyLocked(0, true);
    setNoveltyLocked(0, false);
    expect(localStorage.getItem('noveltyLocked_0')).toBeNull();
  });

  test('clearNovelty removes both novel cards and lock', () => {
    saveNovelCards(0, ['A1', 'B1']);
    setNoveltyLocked(0, true);
    clearNovelty(0);
    expect(getNovelCards(0)).toEqual([]);
    expect(getNoveltyLocked(0)).toBe(false);
  });

  test('novel data is per-game-index', () => {
    saveNovelCards(0, ['A1']);
    saveNovelCards(1, ['B1']);
    setNoveltyLocked(0, true);

    expect(getNovelCards(0)).toEqual(['A1']);
    expect(getNovelCards(1)).toEqual(['B1']);
    expect(getNoveltyLocked(0)).toBe(true);
    expect(getNoveltyLocked(1)).toBe(false);
  });
});
