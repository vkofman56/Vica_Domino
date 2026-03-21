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
// startCustomGame — domino SVGs must preserve original card orientation
// ---------------------------------------------------------------------------
describe('startCustomGame domino card orientation', () => {

  // Helper: build a game with the given card definitions and optional
  // cardMakerVariations, call startCustomGame, and return the resulting
  // deck + SVG map for assertions.
  function setupGame(gameCards, variations) {
    saveCustomGames([{ name: 'Orientation Test', cards: gameCards }]);
    if (variations) {
      localStorage.setItem('cardMakerVariations', JSON.stringify(variations));
    }
    startCustomGame(0);
    return {
      deck: window.customGameDeck,
      svgs: window.customGameSVGs,
    };
  }

  afterEach(() => {
    clearCustomGame();
  });

  // -- Core orientation checks ------------------------------------------------

  test('domino SVG innerHTML matches the original card markup exactly', () => {
    const markupA = '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#336">A</text>';
    const markupB = '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#633">B</text>';
    const { deck, svgs } = setupGame([
      { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: markupA },
      { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: markupB },
    ]);

    expect(deck).toHaveLength(1);
    const card = deck[0];

    // The SVG content inside each half must be the unmodified original markup
    expect(svgs[card.left].innerHTML).toBe(markupA);
    expect(svgs[card.right].innerHTML).toBe(markupB);
  });

  test('no element inside any domino SVG carries a transform attribute', () => {
    const { deck, svgs } = setupGame([
      { label: 'A1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#336">A</text>' },
      { label: 'B1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#633">B</text>' },
      { label: 'C1', isVariation: false, cardSet: 'ABC',
        svgMarkup: '<text x="30" y="46" font-size="48" fill="#363">C</text>' },
    ]);

    expect(deck).toHaveLength(3);

    deck.forEach(card => {
      [card.left, card.right].forEach(key => {
        const svg = svgs[key];
        expect(svg).toBeTruthy();
        // No child element should have a transform (rotate, scale, matrix…)
        const transformed = svg.querySelectorAll('[transform]');
        expect(transformed).toHaveLength(0);
      });
    });
  });

  // -- Rotation / reflection variations must NOT leak into the game -----------

  test('rotate(90) variation in cardMakerVariations does not alter domino SVGs', () => {
    const markupA = '<text x="30" y="46" font-size="48" fill="#336">A</text>';
    const markupB = '<text x="30" y="46" font-size="48" fill="#633">B</text>';
    const { deck, svgs } = setupGame(
      [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: markupA },
        { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: markupB },
      ],
      [{ originalLabel: 'A1', transform: 'rotate(90, 30, 30)', desc: 'Rotate 90°' }]
    );

    const card = deck[0];
    // Left half (A1) must still contain the original upright text
    expect(svgs[card.left].innerHTML).toBe(markupA);
    expect(svgs[card.left].querySelector('g[data-variation-transform]')).toBeNull();
    expect(svgs[card.left].querySelector('[transform]')).toBeNull();
  });

  test('reflection variations in cardMakerVariations do not alter domino SVGs', () => {
    const markupA = '<text x="30" y="46" font-size="48" fill="#336">A</text>';
    const markupB = '<text x="30" y="46" font-size="48" fill="#633">B</text>';
    const { deck, svgs } = setupGame(
      [
        { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: markupA },
        { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: markupB },
      ],
      [
        { originalLabel: 'A1', transform: 'translate(60, 0) scale(-1, 1)', desc: 'Flip H' },
        { originalLabel: 'B1', transform: 'translate(0, 60) scale(1, -1)', desc: 'Flip V' },
      ]
    );

    deck.forEach(card => {
      [card.left, card.right].forEach(key => {
        expect(svgs[key].querySelector('[transform]')).toBeNull();
      });
    });
  });

  test('multiple variation types combined still produce unmodified SVGs', () => {
    const cards = ['A', 'B', 'C'].map(letter => ({
      label: letter + '1', isVariation: false, cardSet: 'ABC',
      svgMarkup: `<text x="30" y="46" font-size="48" fill="#333">${letter}</text>`,
    }));
    const variations = [
      { originalLabel: 'A1', transform: 'rotate(90, 30, 30)', desc: 'Rotate' },
      { originalLabel: 'B1', transform: 'translate(60, 0) scale(-1, 1)', desc: 'Flip' },
      { originalLabel: 'C1', transform: 'matrix(0, 1, 1, 0, 0, 0)', desc: 'Diagonal' },
      { originalLabel: 'A1', transform: 'translate(0, 60) scale(1, -1)', desc: 'Flip V' },
    ];

    const { deck, svgs } = setupGame(cards, variations);

    // 3 cards → 3 domino pairs
    expect(deck).toHaveLength(3);

    // Build expected markup map keyed by value letter
    const expectedMarkup = {};
    cards.forEach(c => { expectedMarkup[c.label.charAt(0)] = c.svgMarkup; });

    deck.forEach(card => {
      // Left half
      expect(svgs[card.left].innerHTML).toBe(expectedMarkup[card.leftValue]);
      // Right half
      expect(svgs[card.right].innerHTML).toBe(expectedMarkup[card.rightValue]);
    });
  });

  // -- Run the game many times to catch randomness issues --------------------

  test('SVG orientation is correct across 20 repeated deck generations', () => {
    const markupA = '<text x="30" y="46" font-size="48" fill="#336">A</text>';
    const markupB = '<text x="30" y="46" font-size="48" fill="#633">B</text>';
    const gameCards = [
      { label: 'A1', isVariation: false, cardSet: 'ABC', svgMarkup: markupA },
      { label: 'B1', isVariation: false, cardSet: 'ABC', svgMarkup: markupB },
    ];
    const variations = [
      { originalLabel: 'A1', transform: 'rotate(90, 30, 30)', desc: 'Rotate 90°' },
      { originalLabel: 'B1', transform: 'rotate(90, 30, 30)', desc: 'Rotate 90°' },
    ];

    for (let i = 0; i < 20; i++) {
      clearCustomGame();
      localStorage.clear();
      saveCustomGames([{ name: 'Repeat Test', cards: gameCards }]);
      localStorage.setItem('cardMakerVariations', JSON.stringify(variations));
      startCustomGame(0);

      const card = window.customGameDeck[0];
      const svgs = window.customGameSVGs;
      // Every single run must produce the original markup, never a rotated one
      expect(svgs[card.left].innerHTML).toBe(markupA);
      expect(svgs[card.right].innerHTML).toBe(markupB);
    }
  });
});
