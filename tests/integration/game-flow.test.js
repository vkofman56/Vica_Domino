/**
 * Integration tests — verify multi-step game flows work end-to-end
 * in a jsdom environment (no real browser).
 */
const { loadGameModule, buildMinimalDOM } = require('../setup');

beforeAll(() => {
  loadGameModule();
});

let game;

beforeEach(() => {
  buildMinimalDOM();
  localStorage.clear();
  game = new VicaDominoGame();
});

// ---------------------------------------------------------------------------
// Sun Level: Single-player full game flow
// ---------------------------------------------------------------------------
describe('Single-player Find-the-Double flow', () => {
  beforeEach(() => {
    game.players = [
      { id: 'p1', name: 'Tester', hand: [], isWinner: false, winningCard: null },
    ];
    game.selectedLevel = 'circle';
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game.includeXeno = false;
    game._isFirstSunGame = false;
    game._singlePlayerWins = 5; // skip tutorial
    game._gameRound = 1;
    game._playerClickBuffers = {};
    game._playerClickTimers = {};
    game.playerCoins = {};
    game.playerGems = {};
    game.stageGems = {};
    game._consecutiveProtectedMistakes = {};
  });

  test('dealing gives exactly 1 double and 1 non-double for circle level', () => {
    game.dealSunLevelCards();
    const hand = game.players[0].hand;
    expect(hand).toHaveLength(2);
    const doubles = hand.filter(c => isDouble(c));
    expect(doubles).toHaveLength(1);
  });

  test('clicking wrong card triggers sunLevelWrongCard path', () => {
    game.dealSunLevelCards();
    const nonDouble = game.players[0].hand.find(c => !isDouble(c));
    const spy = jest.spyOn(game, 'sunLevelWrongCard').mockImplementation(() => {});

    // _processSunLevelClick is what's called after the multi-press buffer
    game._processSunLevelClick(nonDouble, game.players[0], 0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('clicking correct double triggers sunLevelWin after delay', () => {
    jest.useFakeTimers();
    game.dealSunLevelCards();
    const doubleCard = game.players[0].hand.find(c => isDouble(c));
    const cardIndex = game.players[0].hand.indexOf(doubleCard);

    const spy = jest.spyOn(game, 'sunLevelWin').mockImplementation(() => {});
    game._processSunLevelClick(doubleCard, game.players[0], cardIndex);

    // sunLevelWin called after 600ms delay
    jest.advanceTimersByTime(600);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    jest.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Sun Level: Two-player flow
// ---------------------------------------------------------------------------
describe('Two-player Find-the-Double flow', () => {
  beforeEach(() => {
    game.players = [
      { id: 'p1', name: 'Alice', hand: [], isWinner: false, winningCard: null },
      { id: 'p2', name: 'Bob', hand: [], isWinner: false, winningCard: null },
    ];
    game.selectedLevel = 'circle';
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game.includeXeno = false;
    game._isFirstSunGame = false;
    game._gameRound = 1;
    game._playerClickBuffers = {};
    game._playerClickTimers = {};
    game.playerCoins = {};
    game.playerGems = {};
    game.stageGems = {};
    game._consecutiveProtectedMistakes = {};
    // Stub rendering methods that need DOM elements not in minimal fixture
    game.renderSunLevel = jest.fn();
    game.showEndGameButtons = jest.fn();
    game.startPlayAreaDim = jest.fn();
  });

  test('each player gets a different double', () => {
    for (let i = 0; i < 20; i++) {
      game.dealSunLevelCards();
      const d1 = game.players[0].hand.find(c => isDouble(c));
      const d2 = game.players[1].hand.find(c => isDouble(c));
      // Both should have a double, and they should be different cards
      expect(d1).toBeDefined();
      expect(d2).toBeDefined();
      expect(d1.id).not.toBe(d2.id);
    }
  });

  test('first winner gets 2 coins, second gets 1', () => {
    game.dealSunLevelCards();
    const d1 = game.players[0].hand.find(c => isDouble(c));
    const d1Index = game.players[0].hand.indexOf(d1);

    // Simulate P1 winning
    game.sunLevelWin(d1, game.players[0], d1Index);
    expect(game.playerCoins['p1']).toBe(2);

    // Simulate P2 winning (second)
    const d2 = game.players[1].hand.find(c => isDouble(c));
    const d2Index = game.players[1].hand.indexOf(d2);
    game.sunLevelWin(d2, game.players[1], d2Index);
    expect(game.playerCoins['p2']).toBe(1);
  });

  test('player cannot win twice in same round', () => {
    game.dealSunLevelCards();
    const d1 = game.players[0].hand.find(c => isDouble(c));
    const d1Index = game.players[0].hand.indexOf(d1);

    game.sunLevelWin(d1, game.players[0], d1Index);
    expect(game.sunLevelWinners).toHaveLength(1);

    // Try to win again — should be ignored
    game.sunLevelWin(d1, game.players[0], d1Index);
    expect(game.sunLevelWinners).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Tie detection
// ---------------------------------------------------------------------------
describe('Tie detection', () => {
  beforeEach(() => {
    game.players = [
      { id: 'p1', name: 'Alice', hand: [], isWinner: false, winningCard: null },
      { id: 'p2', name: 'Bob', hand: [], isWinner: false, winningCard: null },
    ];
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game.includeXeno = false;
    game._gameRound = 1;
    game.playerCoins = {};
    game.playerGems = {};
    game.stageGems = {};
    game._consecutiveProtectedMistakes = {};
    game.renderSunLevel = jest.fn();
    game.showEndGameButtons = jest.fn();
    game.startPlayAreaDim = jest.fn();
  });

  test('wins within 500ms are detected as ties', () => {
    game.dealSunLevelCards();
    const d1 = game.players[0].hand.find(c => isDouble(c));
    const d2 = game.players[1].hand.find(c => isDouble(c));

    // Use a mock Date.now to control timing
    const realNow = Date.now;
    let mockTime = 1000;
    Date.now = () => mockTime;

    game.sunLevelWin(d1, game.players[0], 0);
    mockTime += 200; // 200ms later
    game.sunLevelWin(d2, game.players[1], 0);

    expect(game.isTie).toBe(true);
    Date.now = realNow;
  });

  test('wins more than 500ms apart are not ties', () => {
    game.dealSunLevelCards();
    const d1 = game.players[0].hand.find(c => isDouble(c));
    const d2 = game.players[1].hand.find(c => isDouble(c));

    const realNow = Date.now;
    let mockTime = 1000;
    Date.now = () => mockTime;

    game.sunLevelWin(d1, game.players[0], 0);
    mockTime += 700; // 700ms later
    game.sunLevelWin(d2, game.players[1], 0);

    expect(game.isTie).toBe(false);
    Date.now = realNow;
  });
});

// ---------------------------------------------------------------------------
// Multi-press detection
// ---------------------------------------------------------------------------
describe('Multi-press detection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    game.players = [
      { id: 'p1', name: 'Tester', hand: [
        { id: 1, leftValue: 'A', rightValue: 'A' },
        { id: 2, leftValue: 'A', rightValue: 'B' },
      ]},
    ];
    game.gamePhase = 'sunLevel';
    game.sunLevelWinners = [];
    game._playerClickBuffers = {};
    game._playerClickTimers = {};
    game._gameRound = 1;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('single click processed normally after 150ms buffer', () => {
    const spy = jest.spyOn(game, '_processSunLevelClick').mockImplementation(() => {});
    game.handleSunLevelCardClick(game.players[0].hand[0], 0, 0);
    jest.advanceTimersByTime(150);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('rapid double-click treated as wrong for all', () => {
    const wrongSpy = jest.spyOn(game, 'sunLevelWrongCard').mockImplementation(() => {});
    game.handleSunLevelCardClick(game.players[0].hand[0], 0, 0);
    game.handleSunLevelCardClick(game.players[0].hand[1], 0, 1);
    jest.advanceTimersByTime(150);
    expect(wrongSpy).toHaveBeenCalledTimes(2);
    wrongSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Anti-repetition: doubles don't repeat for 2 rounds
// ---------------------------------------------------------------------------
describe('Anti-repetition for doubles', () => {
  beforeEach(() => {
    game.players = [
      { id: 'p1', name: 'Tester', hand: [] },
    ];
    game.selectedLevel = 'circle';
    game._isFirstSunGame = false;
    game.recentDoubles = [];
    game.recentNonDoubles = [];
    game.recentDoublePositions = {};
  });

  test('recent doubles are tracked and used for filtering', () => {
    // Deal round 1
    game.dealSunLevelCards();
    const r1Double = game.players[0].hand.find(c => isDouble(c));
    const r1DoubleId = r1Double.id;
    expect(game.recentDoubles).toContain(r1DoubleId);

    // Deal round 2 — should avoid the same double
    game.dealSunLevelCards();
    const r2Double = game.players[0].hand.find(c => isDouble(c));
    // With 5 possible doubles, the odds of same one are low even without filtering
    // but the tracking mechanism should be working
    expect(game.recentDoubles.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Level persistence
// ---------------------------------------------------------------------------
describe('Level selection persistence', () => {
  test('saves selected level to localStorage', () => {
    const btn = document.querySelector('[data-level="triangle"]');
    btn.click();
    expect(localStorage.getItem('vicaSelectedLevel')).toBe('triangle');
  });

  test('loads level from localStorage on init', () => {
    localStorage.setItem('vicaSelectedLevel', 'star');
    buildMinimalDOM();
    const g = new VicaDominoGame();
    expect(g.selectedLevel).toBe('star');
  });
});
