/**
 * Unit tests for js/domino.js — card definitions and utility functions.
 */
const { loadDominoModule } = require('../setup');

beforeAll(() => {
  loadDominoModule();
});

// ---------------------------------------------------------------------------
// DOMINO_CARDS dataset
// ---------------------------------------------------------------------------
describe('DOMINO_CARDS', () => {
  test('contains exactly 15 cards', () => {
    expect(DOMINO_CARDS).toHaveLength(15);
  });

  test('each card has required fields', () => {
    DOMINO_CARDS.forEach(card => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('left');
      expect(card).toHaveProperty('right');
      expect(card).toHaveProperty('leftValue');
      expect(card).toHaveProperty('rightValue');
    });
  });

  test('card IDs are unique and sequential 1-15', () => {
    const ids = DOMINO_CARDS.map(c => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  test('contains exactly 5 doubles (AA, BB, CC, DD, EE)', () => {
    const doubles = DOMINO_CARDS.filter(c => c.leftValue === c.rightValue);
    expect(doubles).toHaveLength(5);
    const doubleValues = doubles.map(c => c.leftValue).sort();
    expect(doubleValues).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  test('contains exactly 10 non-doubles', () => {
    const nonDoubles = DOMINO_CARDS.filter(c => c.leftValue !== c.rightValue);
    expect(nonDoubles).toHaveLength(10);
  });

  test('all values are from set {A, B, C, D, E}', () => {
    const validValues = new Set(['A', 'B', 'C', 'D', 'E']);
    DOMINO_CARDS.forEach(card => {
      expect(validValues.has(card.leftValue)).toBe(true);
      expect(validValues.has(card.rightValue)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// VALUE_RANK
// ---------------------------------------------------------------------------
describe('VALUE_RANK', () => {
  test('ranks E > D > C > B > A', () => {
    expect(VALUE_RANK['A']).toBe(1);
    expect(VALUE_RANK['B']).toBe(2);
    expect(VALUE_RANK['C']).toBe(3);
    expect(VALUE_RANK['D']).toBe(4);
    expect(VALUE_RANK['E']).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// isDouble()
// ---------------------------------------------------------------------------
describe('isDouble', () => {
  test('returns true for double cards', () => {
    expect(isDouble({ leftValue: 'A', rightValue: 'A' })).toBe(true);
    expect(isDouble({ leftValue: 'E', rightValue: 'E' })).toBe(true);
  });

  test('returns false for non-double cards', () => {
    expect(isDouble({ leftValue: 'A', rightValue: 'B' })).toBe(false);
    expect(isDouble({ leftValue: 'C', rightValue: 'E' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDoubleRank()
// ---------------------------------------------------------------------------
describe('getDoubleRank', () => {
  test('returns rank for double cards', () => {
    expect(getDoubleRank({ leftValue: 'A', rightValue: 'A' })).toBe(1);
    expect(getDoubleRank({ leftValue: 'E', rightValue: 'E' })).toBe(5);
  });

  test('returns 0 for non-double cards', () => {
    expect(getDoubleRank({ leftValue: 'A', rightValue: 'B' })).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findHighestDouble()
// ---------------------------------------------------------------------------
describe('findHighestDouble', () => {
  test('finds the highest-ranked double', () => {
    const cards = [
      { leftValue: 'A', rightValue: 'A' },
      { leftValue: 'C', rightValue: 'C' },
      { leftValue: 'B', rightValue: 'D' },
    ];
    const result = findHighestDouble(cards);
    expect(result.leftValue).toBe('C');
  });

  test('returns null when no doubles exist', () => {
    const cards = [
      { leftValue: 'A', rightValue: 'B' },
      { leftValue: 'C', rightValue: 'D' },
    ];
    expect(findHighestDouble(cards)).toBeNull();
  });

  test('returns the only double when there is one', () => {
    const cards = [
      { leftValue: 'A', rightValue: 'B' },
      { leftValue: 'D', rightValue: 'D' },
    ];
    expect(findHighestDouble(cards).leftValue).toBe('D');
  });
});

// ---------------------------------------------------------------------------
// canPlayOn()
// ---------------------------------------------------------------------------
describe('canPlayOn', () => {
  test('matches left value', () => {
    expect(canPlayOn({ leftValue: 'A', rightValue: 'C' }, 'A')).toBe(true);
  });

  test('matches right value', () => {
    expect(canPlayOn({ leftValue: 'A', rightValue: 'C' }, 'C')).toBe(true);
  });

  test('returns false for no match', () => {
    expect(canPlayOn({ leftValue: 'A', rightValue: 'C' }, 'B')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// shuffleArray()
// ---------------------------------------------------------------------------
describe('shuffleArray', () => {
  test('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(5);
  });

  test('does not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  test('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// copyCard()
// ---------------------------------------------------------------------------
describe('copyCard', () => {
  test('creates a shallow copy', () => {
    const card = { id: 1, left: 'A1', right: 'A2', leftValue: 'A', rightValue: 'A' };
    const copy = copyCard(card);
    expect(copy).toEqual(card);
    expect(copy).not.toBe(card);
  });
});

// ---------------------------------------------------------------------------
// getDisplayText()
// ---------------------------------------------------------------------------
describe('getDisplayText', () => {
  test('returns first character by default', () => {
    expect(getDisplayText('A1')).toBe('A');
    expect(getDisplayText('E3')).toBe('E');
  });

  test('returns custom assignment when set', () => {
    setCustomAssignments({ 'A1': 'Apple' });
    expect(getDisplayText('A1')).toBe('Apple');
    // Cleanup
    setCustomAssignments({});
  });
});

// ---------------------------------------------------------------------------
// getShuffledDeck()
// ---------------------------------------------------------------------------
describe('getShuffledDeck', () => {
  afterEach(() => {
    delete window.customGameDeck;
  });

  test('returns empty array when no custom deck is set', () => {
    window.customGameDeck = null;
    expect(getShuffledDeck()).toEqual([]);
  });

  test('returns shuffled copies of custom deck', () => {
    const customDeck = [
      { id: 1, left: 'X1', right: 'Y1', leftValue: 'X', rightValue: 'Y' },
      { id: 2, left: 'X2', right: 'Z1', leftValue: 'X', rightValue: 'Z' },
      { id: 3, left: 'Y2', right: 'Z2', leftValue: 'Y', rightValue: 'Z' },
    ];
    window.customGameDeck = customDeck;
    const deck = getShuffledDeck();
    expect(deck).toHaveLength(3);
    // Must be copies, not references
    deck[0].leftValue = 'CHANGED';
    expect(customDeck[0].leftValue).toBe('X');
  });

  test('returns all elements from custom deck', () => {
    const customDeck = [
      { id: 10, left: 'A1_d1L', right: 'B1_d1R', leftValue: 'A', rightValue: 'B' },
      { id: 20, left: 'C1_d2L', right: 'D1_d2R', leftValue: 'C', rightValue: 'D' },
    ];
    window.customGameDeck = customDeck;
    const deck = getShuffledDeck();
    const ids = deck.map(c => c.id).sort((a, b) => a - b);
    expect(ids).toEqual([10, 20]);
  });
});

// ---------------------------------------------------------------------------
// createDominoElement()
// ---------------------------------------------------------------------------
describe('createDominoElement', () => {
  const testCard = { id: 1, left: 'A1', right: 'A2', leftValue: 'A', rightValue: 'A' };
  const nonDoubleCard = { id: 2, left: 'A3', right: 'B1', leftValue: 'A', rightValue: 'B' };

  test('creates a div with domino class', () => {
    const el = createDominoElement(testCard);
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('domino')).toBe(true);
  });

  test('adds horizontal class by default', () => {
    const el = createDominoElement(testCard);
    expect(el.classList.contains('horizontal')).toBe(true);
  });

  test('adds vertical class when requested', () => {
    const el = createDominoElement(testCard, true);
    expect(el.classList.contains('vertical')).toBe(true);
  });

  test('adds double class for double cards', () => {
    const el = createDominoElement(testCard);
    expect(el.classList.contains('double')).toBe(true);
  });

  test('does not add double class for non-double cards', () => {
    const el = createDominoElement(nonDoubleCard);
    expect(el.classList.contains('double')).toBe(false);
  });

  test('adds on-board class when specified', () => {
    const el = createDominoElement(testCard, false, true);
    expect(el.classList.contains('on-board')).toBe(true);
  });

  test('sets data-card-id attribute', () => {
    const el = createDominoElement(nonDoubleCard);
    expect(el.dataset.cardId).toBe(String(nonDoubleCard.id));
  });

  test('contains two domino-half children', () => {
    const el = createDominoElement(testCard);
    const halves = el.querySelectorAll('.domino-half');
    expect(halves).toHaveLength(2);
  });

  test('populates halves with SVG when customGameSVGs are set', () => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.innerHTML = '<circle cx="30" cy="30" r="10" fill="red"/>';
    window.customGameSVGs = { 'A1': svgEl, 'A2': svgEl };
    const el = createDominoElement(testCard);
    const svgs = el.querySelectorAll('.custom-face');
    expect(svgs).toHaveLength(2);
    // Cleanup
    delete window.customGameSVGs;
  });

  test('halves are empty when no customGameSVGs set', () => {
    window.customGameSVGs = null;
    const el = createDominoElement(testCard);
    const halves = el.querySelectorAll('.domino-half');
    expect(halves[0].children).toHaveLength(0);
    expect(halves[1].children).toHaveLength(0);
  });
});
