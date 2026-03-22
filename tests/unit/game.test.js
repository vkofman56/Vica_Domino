/**
 * Unit tests for js/game.js — VicaDominoGame class core logic.
 */
const { loadGameModule } = require('../setup');

beforeAll(() => {
  loadGameModule();
});

let game;

beforeEach(() => {
  // Reset DOM for each test
  const { buildMinimalDOM } = require('../setup');
  buildMinimalDOM();
  localStorage.clear();
  game = new VicaDominoGame();
});

// ---------------------------------------------------------------------------
// Constructor / Initialization
// ---------------------------------------------------------------------------
describe('VicaDominoGame constructor', () => {
  test('initializes with setup phase', () => {
    expect(game.gamePhase).toBe('setup');
  });

  test('starts with empty players array', () => {
    expect(game.players).toEqual([]);
  });

  test('starts with empty board', () => {
    expect(game.board).toEqual([]);
  });

  test('default level is circle', () => {
    expect(game.selectedLevel).toBe('circle');
  });

  test('default timer duration is 20', () => {
    expect(game.currentTimerDuration).toBe(20);
  });

  test('tracks recent doubles as empty', () => {
    expect(game.recentDoubles).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CHARACTER_ICONS
// ---------------------------------------------------------------------------
describe('CHARACTER_ICONS', () => {
  test('defines exactly 5 characters', () => {
    expect(Object.keys(CHARACTER_ICONS)).toHaveLength(5);
  });

  test('includes star, cat, robot, dino, unicorn', () => {
    expect(CHARACTER_ICONS).toHaveProperty('star');
    expect(CHARACTER_ICONS).toHaveProperty('cat');
    expect(CHARACTER_ICONS).toHaveProperty('robot');
    expect(CHARACTER_ICONS).toHaveProperty('dino');
    expect(CHARACTER_ICONS).toHaveProperty('unicorn');
  });

  test('each icon has name, color, svg', () => {
    Object.values(CHARACTER_ICONS).forEach(icon => {
      expect(icon).toHaveProperty('name');
      expect(icon).toHaveProperty('color');
      expect(icon).toHaveProperty('svg');
      expect(icon.svg).toContain('<svg');
    });
  });
});

// ---------------------------------------------------------------------------
// Adaptive Timer Logic
// ---------------------------------------------------------------------------
describe('adaptiveTimerWin', () => {
  beforeEach(() => {
    game.includeXeno = true;
  });

  test('T >= 10 decreases by 5', () => {
    game.currentTimerDuration = 20;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(15);

    game.currentTimerDuration = 15;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(10);

    game.currentTimerDuration = 10;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(5);
  });

  test('T >= 7 drops to 5', () => {
    game.currentTimerDuration = 7;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(5);

    game.currentTimerDuration = 9;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(5);
  });

  test('T=5 or T=6 drops to 4', () => {
    game.currentTimerDuration = 5;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(4);

    game.currentTimerDuration = 6;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(4);
  });

  test('T=4 stays at 4 until 2 consecutive wins', () => {
    game.currentTimerDuration = 4;
    game.consecutiveWinsAtMin = 0;

    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(4);
    expect(game.consecutiveWinsAtMin).toBe(1);

    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(3);
    expect(game.consecutiveWinsAtMin).toBe(0);
  });

  test('T=3 stays at 3 until 3 consecutive wins', () => {
    game.currentTimerDuration = 3;
    game.consecutiveWinsAtMin = 0;

    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(3);
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(3);
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(2);
  });

  test('does nothing when Xeno is not included', () => {
    game.includeXeno = false;
    game.currentTimerDuration = 20;
    game.adaptiveTimerWin();
    expect(game.currentTimerDuration).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Coin / Gem Economy
// ---------------------------------------------------------------------------
describe('addCoins', () => {
  beforeEach(() => {
    game.playerCoins = {};
    game.playerGems = {};
    game.stageGems = {};
    game._consecutiveProtectedMistakes = {};
    game._gameRound = 1;
  });

  test('adds coins to a player', () => {
    game.addCoins('p1', 2);
    expect(game.playerCoins['p1']).toBe(2);
  });

  test('accumulates coins across calls', () => {
    game.addCoins('p1', 2);
    game.addCoins('p1', 3);
    expect(game.playerCoins['p1']).toBe(5);
  });

  test('resets consecutive protected mistakes on coin gain', () => {
    game._consecutiveProtectedMistakes['p1'] = 3;
    game.addCoins('p1', 1);
    expect(game._consecutiveProtectedMistakes['p1']).toBe(0);
  });

  test('tracks coin-added info for animation', () => {
    game.addCoins('p1', 2);
    expect(game._coinAddedInfo['p1']).toBeDefined();
    expect(game._coinAddedInfo['p1'].amount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// dealSunLevelCards
// ---------------------------------------------------------------------------
describe('dealSunLevelCards', () => {
  beforeEach(() => {
    // Provide a custom deck so getShuffledDeck returns cards
    window.customGameDeck = [
      { id: 1,  left: 'A1', right: 'A2', leftValue: 'A', rightValue: 'A' },
      { id: 2,  left: 'A3', right: 'B1', leftValue: 'A', rightValue: 'B' },
      { id: 3,  left: 'A4', right: 'C1', leftValue: 'A', rightValue: 'C' },
      { id: 4,  left: 'A5', right: 'D1', leftValue: 'A', rightValue: 'D' },
      { id: 5,  left: 'A6', right: 'E1', leftValue: 'A', rightValue: 'E' },
      { id: 6,  left: 'B2', right: 'B3', leftValue: 'B', rightValue: 'B' },
      { id: 7,  left: 'B4', right: 'C2', leftValue: 'B', rightValue: 'C' },
      { id: 8,  left: 'B5', right: 'D2', leftValue: 'B', rightValue: 'D' },
      { id: 9,  left: 'B6', right: 'E2', leftValue: 'B', rightValue: 'E' },
      { id: 10, left: 'C3', right: 'C4', leftValue: 'C', rightValue: 'C' },
      { id: 11, left: 'C5', right: 'D3', leftValue: 'C', rightValue: 'D' },
      { id: 12, left: 'C6', right: 'E3', leftValue: 'C', rightValue: 'E' },
      { id: 13, left: 'D4', right: 'D5', leftValue: 'D', rightValue: 'D' },
      { id: 14, left: 'D6', right: 'E4', leftValue: 'D', rightValue: 'E' },
      { id: 15, left: 'E5', right: 'E6', leftValue: 'E', rightValue: 'E' },
    ];
    game.players = [
      { id: 'p1', name: 'Alice', hand: [] },
    ];
    game.recentDoubles = [];
    game.recentNonDoubles = [];
    game.recentDoublePositions = {};
    game._isFirstSunGame = false;
  });

  afterEach(() => {
    delete window.customGameDeck;
  });

  test('deals 2 cards for circle level', () => {
    game.selectedLevel = 'circle';
    game.dealSunLevelCards();
    expect(game.players[0].hand).toHaveLength(2);
  });

  test('deals 3 cards for triangle level', () => {
    game.selectedLevel = 'triangle';
    game.dealSunLevelCards();
    expect(game.players[0].hand).toHaveLength(3);
  });

  test('deals 4 cards for star level', () => {
    game.selectedLevel = 'star';
    game.dealSunLevelCards();
    expect(game.players[0].hand).toHaveLength(4);
  });

  test('always includes exactly 1 double per player', () => {
    game.selectedLevel = 'star';
    // Run multiple times to account for randomness
    for (let i = 0; i < 20; i++) {
      game.dealSunLevelCards();
      const doubles = game.players[0].hand.filter(c => isDouble(c));
      expect(doubles).toHaveLength(1);
    }
  });

  test('first game places double as rightmost card', () => {
    game._isFirstSunGame = true;
    game.selectedLevel = 'triangle';
    game.dealSunLevelCards();
    const hand = game.players[0].hand;
    const lastCard = hand[hand.length - 1];
    expect(isDouble(lastCard)).toBe(true);
  });

  test('two players each get exactly 1 double', () => {
    game.players = [
      { id: 'p1', name: 'Alice', hand: [] },
      { id: 'p2', name: 'Bob', hand: [] },
    ];
    game.selectedLevel = 'circle';
    for (let i = 0; i < 20; i++) {
      game.dealSunLevelCards();
      game.players.forEach(player => {
        const doubles = player.hand.filter(c => isDouble(c));
        expect(doubles).toHaveLength(1);
      });
    }
  });

  test('tracks recent doubles after dealing', () => {
    game.selectedLevel = 'circle';
    game.dealSunLevelCards();
    expect(game.recentDoubles.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Keyboard Mapping
// ---------------------------------------------------------------------------
describe('handleKeyPress', () => {
  beforeEach(() => {
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game._playerClickBuffers = {};
    game._playerClickTimers = {};
    game._gameRound = 1;
    game.players = [
      {
        id: 'p1', name: 'Player 1',
        hand: [
          { id: 1, leftValue: 'A', rightValue: 'A' },
          { id: 2, leftValue: 'A', rightValue: 'B' },
        ],
      },
    ];
  });

  test('ignores keys when not in sunLevel phase', () => {
    game.gamePhase = 'setup';
    game.handleKeyPress({ key: '1' });
    expect(game._playerClickBuffers['p1']).toBeUndefined();
  });

  test('W or P key triggers playAgain in sunLevelWon phase', () => {
    game.gamePhase = 'sunLevelWon';
    const spy = jest.spyOn(game, 'playAgain').mockImplementation(() => {});
    game.handleKeyPress({ key: 'W' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('P key triggers playAgain in sunLevelWon phase', () => {
    game.gamePhase = 'sunLevelWon';
    const spy = jest.spyOn(game, 'playAgain').mockImplementation(() => {});
    game.handleKeyPress({ key: 'p' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('key 1 buffers click for first card of player 1', () => {
    game.handleKeyPress({ key: '1' });
    expect(game._playerClickBuffers['p1']).toHaveLength(1);
    expect(game._playerClickBuffers['p1'][0].cardIndex).toBe(0);
  });

  test('key 2 buffers click for second card of player 1', () => {
    game.handleKeyPress({ key: '2' });
    expect(game._playerClickBuffers['p1']).toHaveLength(1);
    expect(game._playerClickBuffers['p1'][0].cardIndex).toBe(1);
  });

  test('key 5 does nothing for single player', () => {
    game.handleKeyPress({ key: '5' });
    expect(game._playerClickBuffers['p1']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Player 2 Key Mapping (dynamic offset)
// ---------------------------------------------------------------------------
describe('Player 2 key mapping with dynamic offset', () => {
  beforeEach(() => {
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game._playerClickBuffers = {};
    game._playerClickTimers = {};
    game._gameRound = 1;
    game.players = [
      { id: 'p1', name: 'P1', hand: [{ id: 1, leftValue: 'A', rightValue: 'A' }] },
      { id: 'p2', name: 'P2', hand: [] },
    ];
  });

  test('2-card hand: keys 9,0 map to indices 0,1', () => {
    game.players[1].hand = [
      { id: 10, leftValue: 'C', rightValue: 'C' },
      { id: 11, leftValue: 'C', rightValue: 'D' },
    ];
    game.handleKeyPress({ key: '9' });
    expect(game._playerClickBuffers['p2'][0].cardIndex).toBe(0);
    game._playerClickBuffers = {};

    game.handleKeyPress({ key: '0' });
    expect(game._playerClickBuffers['p2'][0].cardIndex).toBe(1);
  });

  test('3-card hand: keys 8,9,0 map to indices 0,1,2', () => {
    game.players[1].hand = [
      { id: 10, leftValue: 'C', rightValue: 'C' },
      { id: 11, leftValue: 'C', rightValue: 'D' },
      { id: 12, leftValue: 'C', rightValue: 'E' },
    ];
    game.handleKeyPress({ key: '8' });
    expect(game._playerClickBuffers['p2'][0].cardIndex).toBe(0);
  });

  test('4-card hand: keys 7,8,9,0 map to indices 0,1,2,3', () => {
    game.players[1].hand = [
      { id: 10, leftValue: 'C', rightValue: 'C' },
      { id: 11, leftValue: 'C', rightValue: 'D' },
      { id: 12, leftValue: 'C', rightValue: 'E' },
      { id: 13, leftValue: 'D', rightValue: 'D' },
    ];
    game.handleKeyPress({ key: '7' });
    expect(game._playerClickBuffers['p2'][0].cardIndex).toBe(0);

    game._playerClickBuffers = {};
    game.handleKeyPress({ key: '0' });
    expect(game._playerClickBuffers['p2'][0].cardIndex).toBe(3);
  });
});
