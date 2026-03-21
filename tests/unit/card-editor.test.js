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
