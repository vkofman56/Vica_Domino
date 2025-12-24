/**
 * Vica Domino - Domino Card Definitions
 *
 * The 15 domino cards with values A, B, C, D, E
 * Each value can have up to 6 different representations (A1-A6, B1-B6, etc.)
 * For now, we display the letter labels. Later, custom assignments can be made.
 */

// Value ranking: E > D > C > B > A (E is highest)
const VALUE_RANK = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

// All 15 domino cards
const DOMINO_CARDS = [
    { id: 1,  left: 'A1', right: 'A2', leftValue: 'A', rightValue: 'A' }, // Double A
    { id: 2,  left: 'A3', right: 'B1', leftValue: 'A', rightValue: 'B' },
    { id: 3,  left: 'A4', right: 'C1', leftValue: 'A', rightValue: 'C' },
    { id: 4,  left: 'A5', right: 'D1', leftValue: 'A', rightValue: 'D' },
    { id: 5,  left: 'A6', right: 'E1', leftValue: 'A', rightValue: 'E' },
    { id: 6,  left: 'B2', right: 'B3', leftValue: 'B', rightValue: 'B' }, // Double B
    { id: 7,  left: 'B4', right: 'C2', leftValue: 'B', rightValue: 'C' },
    { id: 8,  left: 'B5', right: 'D2', leftValue: 'B', rightValue: 'D' },
    { id: 9,  left: 'B6', right: 'E2', leftValue: 'B', rightValue: 'E' },
    { id: 10, left: 'C3', right: 'C4', leftValue: 'C', rightValue: 'C' }, // Double C
    { id: 11, left: 'C5', right: 'D3', leftValue: 'C', rightValue: 'D' },
    { id: 12, left: 'C6', right: 'E3', leftValue: 'C', rightValue: 'E' },
    { id: 13, left: 'D4', right: 'D5', leftValue: 'D', rightValue: 'D' }, // Double D
    { id: 14, left: 'D6', right: 'E4', leftValue: 'D', rightValue: 'E' },
    { id: 15, left: 'E5', right: 'E6', leftValue: 'E', rightValue: 'E' }, // Double E
];

// Custom display assignments (can be modified later)
// Maps representation codes (A1, A2, etc.) to display text/images
let customAssignments = {};

/**
 * Get display text for a representation code
 * @param {string} code - The representation code (e.g., 'A1', 'B2')
 * @returns {string} - The display text
 */
function getDisplayText(code) {
    if (customAssignments[code]) {
        return customAssignments[code];
    }
    // Default: show the value letter
    return code.charAt(0);
}

/**
 * Check if a card is a double (both sides have same value)
 * @param {object} card - The domino card
 * @returns {boolean}
 */
function isDouble(card) {
    return card.leftValue === card.rightValue;
}

/**
 * Get the rank of a double card
 * @param {object} card - The domino card
 * @returns {number} - Rank (1-5, where 5 is highest)
 */
function getDoubleRank(card) {
    if (!isDouble(card)) return 0;
    return VALUE_RANK[card.leftValue];
}

/**
 * Find the highest double among given cards
 * @param {array} cards - Array of domino cards
 * @returns {object|null} - The highest double card or null
 */
function findHighestDouble(cards) {
    const doubles = cards.filter(isDouble);
    if (doubles.length === 0) return null;

    return doubles.reduce((highest, card) => {
        return getDoubleRank(card) > getDoubleRank(highest) ? card : highest;
    }, doubles[0]);
}

/**
 * Check if a card can be played on a given end value
 * @param {object} card - The domino card
 * @param {string} endValue - The value at the end of the board (A, B, C, D, or E)
 * @returns {boolean}
 */
function canPlayOn(card, endValue) {
    return card.leftValue === endValue || card.rightValue === endValue;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {array} array - The array to shuffle
 * @returns {array} - Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Create a deep copy of a card
 * @param {object} card - The card to copy
 * @returns {object} - Copy of the card
 */
function copyCard(card) {
    return { ...card };
}

/**
 * Create HTML element for a domino card
 * @param {object} card - The domino card
 * @param {boolean} isVertical - Whether to display vertically (for doubles on board)
 * @param {boolean} isOnBoard - Whether the card is on the board
 * @returns {HTMLElement}
 */
function createDominoElement(card, isVertical = false, isOnBoard = false) {
    const domino = document.createElement('div');
    domino.className = `domino ${isVertical ? 'vertical' : 'horizontal'}`;
    domino.dataset.cardId = card.id;

    if (isDouble(card)) {
        domino.classList.add('double');
    }

    if (isOnBoard) {
        domino.classList.add('on-board');
    }

    // Left/top half
    const leftHalf = document.createElement('div');
    leftHalf.className = 'domino-half';
    const leftDisplay = document.createElement('span');
    leftDisplay.className = `value-display value-${card.leftValue}`;
    leftDisplay.textContent = getDisplayText(card.left);
    leftHalf.appendChild(leftDisplay);

    // Right/bottom half
    const rightHalf = document.createElement('div');
    rightHalf.className = 'domino-half';
    const rightDisplay = document.createElement('span');
    rightDisplay.className = `value-display value-${card.rightValue}`;
    rightDisplay.textContent = getDisplayText(card.right);
    rightHalf.appendChild(rightDisplay);

    domino.appendChild(leftHalf);
    domino.appendChild(rightHalf);

    return domino;
}

/**
 * Set custom assignments for display
 * @param {object} assignments - Object mapping codes to display values
 */
function setCustomAssignments(assignments) {
    customAssignments = { ...assignments };
}

/**
 * Get all cards as a fresh shuffled deck
 * @returns {array} - Shuffled array of card copies
 */
function getShuffledDeck() {
    return shuffleArray(DOMINO_CARDS.map(copyCard));
}
