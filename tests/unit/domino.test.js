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
  test('returns 15 cards', () => {
    expect(getShuffledDeck()).toHaveLength(15);
  });

  test('returns copies, not references to original', () => {
    const deck = getShuffledDeck();
    deck[0].leftValue = 'Z';
    // Original should be unchanged
    expect(DOMINO_CARDS[0].leftValue).not.toBe('Z');
  });

  test('uses custom deck when set', () => {
    const customDeck = [
      { id: 100, left: 'X1', right: 'X2', leftValue: 'X', rightValue: 'X' },
    ];
    global.window = global.window || {};
    window.customGameDeck = customDeck;
    const deck = getShuffledDeck();
    expect(deck).toHaveLength(1);
    expect(deck[0].id).toBe(100);
    // Cleanup
    delete window.customGameDeck;
  });
});

// ---------------------------------------------------------------------------
// createDominoElement()
// ---------------------------------------------------------------------------
describe('createDominoElement', () => {
  test('creates a div with domino class', () => {
    const card = DOMINO_CARDS[0];
    const el = createDominoElement(card);
    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('domino')).toBe(true);
  });

  test('adds horizontal class by default', () => {
    const el = createDominoElement(DOMINO_CARDS[0]);
    expect(el.classList.contains('horizontal')).toBe(true);
  });

  test('adds vertical class when requested', () => {
    const el = createDominoElement(DOMINO_CARDS[0], true);
    expect(el.classList.contains('vertical')).toBe(true);
  });

  test('adds double class for double cards', () => {
    const doubleCard = DOMINO_CARDS.find(c => isDouble(c));
    const el = createDominoElement(doubleCard);
    expect(el.classList.contains('double')).toBe(true);
  });

  test('adds on-board class when specified', () => {
    const el = createDominoElement(DOMINO_CARDS[0], false, true);
    expect(el.classList.contains('on-board')).toBe(true);
  });

  test('sets data-card-id attribute', () => {
    const card = DOMINO_CARDS[3];
    const el = createDominoElement(card);
    expect(el.dataset.cardId).toBe(String(card.id));
  });

  test('contains two domino-half children', () => {
    const el = createDominoElement(DOMINO_CARDS[0]);
    const halves = el.querySelectorAll('.domino-half');
    expect(halves).toHaveLength(2);
  });
});
