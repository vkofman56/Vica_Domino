/**
 * Test setup — loads domino.js and game.js globals into the Jest jsdom environment.
 */
const fs = require('fs');
const path = require('path');

function loadDominoModule() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'domino.js'), 'utf8');
  // Wrap in a function that returns all declarations, then assign to global
  const wrapped = `(function() {
    ${code}
    return {
      VALUE_RANK, DOMINO_CARDS, customAssignments,
      getDisplayText, isDouble, getDoubleRank, findHighestDouble,
      canPlayOn, shuffleArray, copyCard, createDominoElement,
      setCustomAssignments, getShuffledDeck
    };
  })()`;
  const exports = eval(wrapped);
  Object.assign(global, exports);
}

/**
 * Build a minimal DOM that VicaDominoGame's constructor expects.
 */
function buildMinimalDOM() {
  document.body.innerHTML = `
    <div class="game-container">
      <div class="screen" id="creator-screen">
        <button id="creator-games-btn"></button>
        <button id="creator-create-edit-btn"></button>
      </div>
      <div class="screen" id="intro-screen" style="display:none;">
        <button id="back-to-creator-btn"></button>
      </div>
      <div class="screen" id="start-screen" style="display:none;">
        <button id="back-to-intro-btn"></button>
        <button id="mpp-start-btn" style="display:none;"></button>
        <div class="setup-panel">
          <div class="game-level-select">
            <button class="level-btn selected" data-level="circle"></button>
            <button class="level-btn" data-level="triangle"></button>
            <button class="level-btn" data-level="star"></button>
          </div>
          <button class="player-btn" data-count="1">1 Player</button>
          <button class="player-btn" data-count="2">2 Players</button>
        </div>
        <div id="player-names-container"></div>
        <button id="start-game-btn">Start</button>
        <button id="back-to-setup-btn"></button>
      </div>
      <div class="screen" id="game-screen" style="display:none;">
        <button id="back-arrow-btn"></button>
        <div id="status-message"></div>
        <div id="game-board"></div>
        <div id="player-areas"></div>
        <div id="bank-area">
          <button id="bank-draw-btn">Draw</button>
          <span id="bank-count">0</span>
        </div>
        <button id="pass-btn" style="display:none;">Pass</button>
        <button id="play-again-game-btn" style="display:none;">Play Again</button>
        <div id="timer-display"></div>
      </div>
      <div class="screen" id="winner-screen" style="display:none;">
        <button id="play-again-btn">Play Again</button>
        <button id="new-game-btn">New Game</button>
      </div>
      <div class="screen" id="create-edit-screen" style="display:none;">
        <button id="back-from-create-edit-btn"></button>
        <button id="card-library-btn"></button>
      </div>
      <div class="screen" id="card-library-screen" style="display:none;">
        <button id="back-from-card-library-btn"></button>
        <button id="back-from-library-set-btn"></button>
      </div>
      <div class="screen" id="domino-library-screen" style="display:none;">
        <button id="back-from-library-btn"></button>
      </div>
    </div>
  `;
}

function loadGameModule() {
  loadDominoModule();
  buildMinimalDOM();

  // Stub AudioContext
  global.AudioContext = class {
    constructor() { this.currentTime = 0; this.destination = {}; }
    createOscillator() {
      return {
        connect() {}, start() {}, stop() {},
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        type: 'sine',
      };
    }
    createGain() {
      return {
        connect() {},
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      };
    }
  };
  global.webkitAudioContext = global.AudioContext;

  // Stub Audio constructor
  global.Audio = class {
    constructor() { this.volume = 1; }
    play() { return Promise.resolve(); }
  };

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf8');
  const wrapped = `(function() {
    ${code}
    return { CHARACTER_ICONS, XENO_ICON_SVG, VicaDominoGame };
  })()`;
  const exports = eval(wrapped);
  Object.assign(global, exports);
}

module.exports = { loadDominoModule, loadGameModule, buildMinimalDOM };
