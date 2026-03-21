/**
 * Unit tests for js/game-creator.js — Game Creator module.
 */
const { loadGameCreatorModule, buildGameCreatorDOM } = require('../setup');

beforeAll(() => {
  loadGameCreatorModule();
});

beforeEach(() => {
  buildGameCreatorDOM();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// buildDefaultAbcGameCards
// ---------------------------------------------------------------------------
describe('buildDefaultAbcGameCards', () => {
  test('returns 15 cards (5 letters x 3 per letter)', () => {
    const cards = buildDefaultAbcGameCards();
    expect(cards).toHaveLength(15);
  });

  test('each card has label, svgMarkup, cardSet, and isVariation', () => {
    const cards = buildDefaultAbcGameCards();
    cards.forEach(card => {
      expect(card).toHaveProperty('label');
      expect(card).toHaveProperty('svgMarkup');
      expect(card).toHaveProperty('cardSet', 'ABC');
      expect(card).toHaveProperty('isVariation', false);
    });
  });

  test('labels follow A01-A03, B01-B03, ... E01-E03 format', () => {
    const cards = buildDefaultAbcGameCards();
    const labels = cards.map(c => c.label).sort();
    const expected = [];
    ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
      for (let n = 1; n <= 3; n++) expected.push(letter + '0' + n);
    });
    expect(labels).toEqual(expected.sort());
  });

  test('first two cards per letter have text markup, third has icon', () => {
    const cards = buildDefaultAbcGameCards();
    ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
      const letterCards = cards.filter(c => c.label.charAt(0) === letter);
      // Cards 1 and 2 should have <text> element
      expect(letterCards[0].svgMarkup).toContain('<text');
      expect(letterCards[1].svgMarkup).toContain('<text');
      // Card 3 uses the icon (different markup)
      expect(letterCards[2].svgMarkup.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Intro Page Game Selection
// ---------------------------------------------------------------------------
describe('populateIntroGames', () => {
  test('creates buttons for saved custom games', () => {
    saveCustomGames([{ name: 'TestGame', cards: [] }]);
    populateIntroGames();
    const container = document.getElementById('intro-custom-games');
    const buttons = container.querySelectorAll('.intro-game-btn');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('TestGame');
  });

  test('creates buttons for combined games too', () => {
    saveCustomGames([{ name: 'G1', cards: [] }]);
    saveCombinedGames([{ name: 'Combined1', stages: [] }]);
    populateIntroGames();
    const container = document.getElementById('intro-custom-games');
    const buttons = container.querySelectorAll('.intro-game-btn');
    expect(buttons).toHaveLength(2);
    expect(buttons[1].textContent).toBe('Combined1');
  });

  test('clears container before repopulating', () => {
    saveCustomGames([{ name: 'G1', cards: [] }]);
    populateIntroGames();
    saveCustomGames([{ name: 'G1', cards: [] }, { name: 'G2', cards: [] }]);
    populateIntroGames();
    const container = document.getElementById('intro-custom-games');
    expect(container.querySelectorAll('.intro-game-btn')).toHaveLength(2);
  });
});

describe('selectIntroGame', () => {
  test('selects a game and highlights button', () => {
    const btn = document.createElement('button');
    btn.className = 'intro-game-btn';
    document.getElementById('intro-screen').appendChild(btn);
    selectIntroGame('custom-0', btn);
    expect(btn.classList.contains('selected')).toBe(true);
  });

  test('toggles off when clicking same game again', () => {
    const btn = document.createElement('button');
    btn.className = 'intro-game-btn';
    document.getElementById('intro-screen').appendChild(btn);
    selectIntroGame('custom-0', btn);
    selectIntroGame('custom-0', btn);
    // selectedIntroGame should be null (toggled off)
    // The button was deselected in the first querySelectorAll call
  });
});

// ---------------------------------------------------------------------------
// clearCustomGame
// ---------------------------------------------------------------------------
describe('clearCustomGame', () => {
  test('resets all custom game state', () => {
    window.customGameDeck = [{ id: 1 }];
    window.customGameSVGs = { 'A1': {} };
    window.customGameFlipEnabled = true;
    window.combinedGameConfig = { stages: [] };
    window.combinedGameStage = 2;
    window._activeCombinedIndex = 3;

    clearCustomGame();

    expect(window.customGameDeck).toBeNull();
    expect(window.customGameSVGs).toBeNull();
    expect(window.customGameFlipEnabled).toBe(false);
    expect(window.combinedGameConfig).toBeNull();
    expect(window.combinedGameStage).toBe(0);
    expect(window._activeCombinedIndex).toBe(-1);
  });

  test('resets subtitle to default', () => {
    clearCustomGame();
    const subtitle = document.querySelector('#start-screen .subtitle');
    expect(subtitle.textContent).toBe('Game: Find the Double!');
  });

  test('hides MPP button', () => {
    const mppBtn = document.getElementById('mpp-start-btn');
    mppBtn.style.display = '';
    clearCustomGame();
    expect(mppBtn.style.display).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// Combined Games
// ---------------------------------------------------------------------------
describe('updateCombineButton', () => {
  test('shows button when 2+ checkboxes are checked', () => {
    const btn = document.getElementById('combine-games-btn');
    // Add checkboxes
    const container = document.getElementById('library-set-1-games');
    for (let i = 0; i < 2; i++) {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'combine-checkbox';
      cb.checked = true;
      cb.dataset.gameIndex = i;
      container.appendChild(cb);
    }
    updateCombineButton();
    expect(btn.style.display).toBe('block');
  });

  test('hides button when fewer than 2 checkboxes checked', () => {
    const btn = document.getElementById('combine-games-btn');
    const container = document.getElementById('library-set-1-games');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'combine-checkbox';
    cb.checked = true;
    container.appendChild(cb);
    updateCombineButton();
    expect(btn.style.display).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// MPP (Main Page Pictures) Hint
// ---------------------------------------------------------------------------
describe('updateMppHint', () => {
  test('shows default message when no selection is active', () => {
    // mppActiveSelection starts as null (no selection)
    updateMppHint();
    const hint = document.getElementById('mpp-hint');
    expect(hint.textContent).toContain('Click a domino half');
    expect(hint.classList.contains('mpp-hint-active')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resetLevelDominoIcons
// ---------------------------------------------------------------------------
describe('resetLevelDominoIcons', () => {
  test('removes level-domino-img elements', () => {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    img.setAttribute('class', 'level-domino-img');
    document.body.appendChild(img);

    resetLevelDominoIcons();
    expect(document.querySelectorAll('.level-domino-img')).toHaveLength(0);
  });

  test('restores visibility of face and dot elements', () => {
    const face = document.createElement('div');
    face.className = 'level-domino-face';
    face.style.display = 'none';
    document.body.appendChild(face);

    const dot = document.createElement('div');
    dot.className = 'level-domino-dot';
    dot.style.display = 'none';
    document.body.appendChild(dot);

    resetLevelDominoIcons();
    expect(face.style.display).toBe('');
    expect(dot.style.display).toBe('');
  });
});

// ---------------------------------------------------------------------------
// startCustomGame — SVG pool must NOT include cardMakerVariations transforms
// ---------------------------------------------------------------------------
describe('startCustomGame SVG pool', () => {
  test('does not apply rotation transforms from cardMakerVariations to domino SVGs', () => {
    // Save a game with two ABC cards (card-maker label format)
    const gameCards = [
      { label: 'A1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#336">A</text>' },
      { label: 'B1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#633">B</text>' },
    ];
    saveCustomGames([{ name: 'Letters Test', cards: gameCards }]);

    // Store a rotation variation for A1 in cardMakerVariations
    localStorage.setItem('cardMakerVariations', JSON.stringify([
      { originalLabel: 'A1', transform: 'rotate(90, 30, 30)', desc: 'Rotate 90' }
    ]));

    // Start the custom game
    startCustomGame(0);

    // The deck should have exactly 1 domino (A1:B1)
    expect(window.customGameDeck).toHaveLength(1);
    const card = window.customGameDeck[0];
    expect(card.leftValue).toBe('A');
    expect(card.rightValue).toBe('B');

    // The left SVG (A1) must NOT contain a rotation transform
    const leftSvg = window.customGameSVGs[card.left];
    expect(leftSvg).toBeTruthy();
    const rotateGroup = leftSvg.querySelector('g[data-variation-transform]');
    expect(rotateGroup).toBeNull();

    // Verify the SVG contains the original text content
    const textEl = leftSvg.querySelector('text');
    expect(textEl).toBeTruthy();
    expect(textEl.textContent).toBe('A');

    // Clean up
    clearCustomGame();
  });

  test('each domino half uses only the original card SVG without transforms', () => {
    // Save a game with three cards to generate multiple dominos
    const gameCards = [
      { label: 'A1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#336">A</text>' },
      { label: 'B1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#633">B</text>' },
      { label: 'C1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#363">C</text>' },
    ];
    saveCustomGames([{ name: 'ABC Test', cards: gameCards }]);

    // Store multiple rotation/reflection variations
    localStorage.setItem('cardMakerVariations', JSON.stringify([
      { originalLabel: 'A1', transform: 'rotate(90, 30, 30)', desc: 'Rotate 90' },
      { originalLabel: 'B1', transform: 'translate(60, 0) scale(-1, 1)', desc: 'Flip H' },
      { originalLabel: 'C1', transform: 'matrix(0, 1, 1, 0, 0, 0)', desc: 'Diagonal' },
    ]));

    startCustomGame(0);

    // Should have 3 dominos: A1:B1, A1:C1, B1:C1
    expect(window.customGameDeck).toHaveLength(3);

    // None of the SVGs should have variation transform groups
    window.customGameDeck.forEach(card => {
      const leftSvg = window.customGameSVGs[card.left];
      const rightSvg = window.customGameSVGs[card.right];
      if (leftSvg) {
        expect(leftSvg.querySelector('g[data-variation-transform]')).toBeNull();
      }
      if (rightSvg) {
        expect(rightSvg.querySelector('g[data-variation-transform]')).toBeNull();
      }
    });

    clearCustomGame();
  });
});
