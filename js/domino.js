/**
 * Vica Domino - Domino Card Definitions
 *
 * All cards are custom-made via Card Maker. There are no built-in cards.
 * Game decks are built dynamically from saved custom games.
 */

// Value ranking — dynamically set when a custom game is loaded
const VALUE_RANK = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

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
    if (window.customGameSVGs && window.customGameSVGs[card.left]) {
        const svg = window.customGameSVGs[card.left].cloneNode(true);
        svg.classList.add('custom-face');
        leftHalf.appendChild(svg);
    } else {
        const leftDisplay = document.createElement('span');
        leftDisplay.className = `value-display value-${card.leftValue}`;
        leftDisplay.textContent = card.leftValue || '?';
        leftHalf.appendChild(leftDisplay);
    }

    // Right/bottom half
    const rightHalf = document.createElement('div');
    rightHalf.className = 'domino-half';
    if (window.customGameSVGs && window.customGameSVGs[card.right]) {
        const svg = window.customGameSVGs[card.right].cloneNode(true);
        svg.classList.add('custom-face');
        rightHalf.appendChild(svg);
    } else {
        const rightDisplay = document.createElement('span');
        rightDisplay.className = `value-display value-${card.rightValue}`;
        rightDisplay.textContent = card.rightValue || '?';
        rightHalf.appendChild(rightDisplay);
    }

    domino.appendChild(leftHalf);
    domino.appendChild(rightHalf);

    return domino;
}

/**
 * Get all cards as a fresh shuffled deck
 * @returns {array} - Shuffled array of card copies
 */
function getShuffledDeck() {
    if (window.customGameDeck && window.customGameDeck.length > 0) {
        return shuffleArray(window.customGameDeck.map(copyCard));
    }
    // No game selected — return empty deck
    console.warn('[Domino] No game deck loaded. Please select a game first.');
    return [];
}
