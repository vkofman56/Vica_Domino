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

/**
 * Build a minimal DOM for the Game Creator module.
 */
function buildGameCreatorDOM() {
  document.body.innerHTML = `
    <div class="game-container">
      <div class="screen" id="creator-screen">
        <button id="creator-games-btn"></button>
        <button id="creator-create-edit-btn"></button>
      </div>
      <div class="screen" id="intro-screen" style="display:none;">
        <div id="intro-custom-games"></div>
        <button id="back-to-creator-btn"></button>
      </div>
      <div class="screen" id="start-screen" style="display:none;">
        <div class="subtitle">Game: Find the Double!</div>
        <button id="back-to-intro-btn"></button>
        <button id="mpp-start-btn" style="display:none;"></button>
        <div class="setup-panel">
          <div class="game-level-select">
            <button class="level-btn selected" data-level="circle">
              <svg class="level-dominos-svg"></svg>
            </button>
            <button class="level-btn" data-level="triangle">
              <svg class="level-dominos-svg"></svg>
            </button>
            <button class="level-btn" data-level="star">
              <svg class="level-dominos-svg"></svg>
            </button>
          </div>
        </div>
        <div id="start-custom-games"></div>
      </div>
      <div id="mpp-panel" style="display:none;">
        <div id="mpp-drag-handle"></div>
        <div id="mpp-levels"></div>
        <div id="mpp-hint"></div>
        <button class="mpp-close-btn"></button>
      </div>
      <div id="game-view-cards"></div>
      <div id="combine-games-overlay" style="display:none;">
        <div id="combine-games-list"></div>
      </div>
      <div id="combined-celebration-overlay" style="display:none;">
        <button id="close-celebration-btn"></button>
      </div>
      <div id="combine-games-btn" style="display:none;"></div>
      <div id="novelty-prompt-overlay" style="display:none;">
        <div class="novelty-prompt-dialog">
          <div class="novelty-slider" id="novelty-prompt-slider"><div class="novelty-slider-knob"></div></div>
          <button id="novelty-keep-btn">Keep pink</button>
          <button id="novelty-dismiss-btn">Dismiss</button>
        </div>
      </div>
      <div id="library-set-1-games"></div>
      <div id="card-maker-games"></div>
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
        <div class="domino-library-content"></div>
      </div>
    </div>
  `;
}

function loadSharedDataModule() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'shared-data.js'), 'utf8');
  const wrapped = `(function() {
    ${code}
    return {
      loadCustomGames, saveCustomGames,
      loadCombinedGames, saveCombinedGames,
      loadCardSets, saveCardSets,
      getDominoKey, getExcludedDominos, saveExcludedDominos,
      getExcludedVariations, saveExcludedVariations, getVariationKey,
      buildCardFromMarkup, buildSVGFromMarkup,
      resolveStageGameIndex, randomPick,
      getNovelCards, saveNovelCards, getNoveltyLocked, setNoveltyLocked, clearNovelty
    };
  })()`;
  const exports = eval(wrapped);
  Object.assign(global, exports);
}

function loadGameCreatorModule() {
  loadDominoModule();
  loadSharedDataModule();
  buildGameCreatorDOM();

  // game-creator.js references abcIcons and findCardByLabel from card-editor.js
  // Provide stubs so the module can load without the full card-editor
  global.abcIcons = {
    A: { markup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#336">A</text>' },
    B: { markup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#633">B</text>' },
    C: { markup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#363">C</text>' },
    D: { markup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#663">D</text>' },
    E: { markup: '<text x="30" y="46" text-anchor="middle" font-size="48" fill="#636">E</text>' },
  };
  global.findCardByLabel = global.findCardByLabel || function() { return null; };
  global.populateLibraryGames = global.populateLibraryGames || function() {};
  global.populateStartScreenGames = global.populateStartScreenGames || function() {};
  global.populateCardMakerGames = global.populateCardMakerGames || function() {};
  global.currentGameViewIndex = -1;
  global.activeCardSet = 'numbers';

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'game-creator.js'), 'utf8');
  const wrapped = `(function() {
    ${code}
    return {
      selectedIntroGame,
      populateIntroGames, selectIntroGame, goToMainPage,
      activeCustomGameIndex,
      startCustomGame, clearCustomGame,
      updateLevelDominoIcons, resetLevelDominoIcons,
      getGameCardSVG, getGameVariationSVG,
      openMainPagePictures, saveMainPagePictures, closeMainPagePictures,
      mppSelectHalf, mppAssignCard, applyMppConfigToClone, updateMppHint,
      updateCombineButton, openCombineDialog, confirmCombineGames, cancelCombineGames,
      startCombinedGameFromMenu,
      populateCardMakerGames
    };
  })()`;
  const exports = eval(wrapped);
  Object.assign(global, exports);
}

/**
 * Build a minimal DOM for the Card Editor module.
 */
function buildCardEditorDOM() {
  document.body.innerHTML = `
    <div class="game-container">
      <div class="screen" id="domino-library-screen">
        <div class="domino-library-content">
          <div id="card-set-numbers">
            <div class="library-row" data-row-letter="A">
              <div class="library-card">
                <div class="library-label">A1</div>
                <div class="domino-half-preview">
                  <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="10" fill="red"/></svg>
                </div>
                <div class="library-desc"></div>
              </div>
              <div class="library-card">
                <div class="library-label">A2</div>
                <div class="domino-half-preview">
                  <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="10" fill="blue"/></svg>
                </div>
                <div class="library-desc"></div>
              </div>
            </div>
            <div class="library-row" data-row-letter="B">
              <div class="library-card">
                <div class="library-label">B1</div>
                <div class="domino-half-preview">
                  <svg viewBox="0 0 60 60"><rect x="10" y="10" width="20" height="20" fill="green"/></svg>
                </div>
                <div class="library-desc"></div>
              </div>
            </div>
          </div>
          <div id="card-set-abc" style="display:none;"></div>
          <div id="card-set-custom" style="display:none;"></div>
        </div>
        <div class="library-zoom-fixed">
          <button id="zoom-loupe-btn"></button>
          <div id="zoom-panel" style="display:none;">
            <button id="loupe-mode-btn"></button>
          </div>
          <button id="border-btn"></button>
          <button id="toggle-var-btn">V+</button>
          <button id="var-tool-btn"></button>
          <div id="variation-toolbar" style="display:none;"></div>
          <button id="new-card-btn"></button>
          <div id="new-group-row" style="display:none;"></div>
        </div>
        <button id="back-from-library-btn"></button>
      </div>
      <div id="loupe-overlay" style="display:none;">
        <div id="loupe-card-container"></div>
        <button id="loupe-close-btn"></button>
        <div id="draw-toolbar" style="display:none;">
          <button id="draw-crop-btn"></button>
          <span id="draw-overscale-val">1</span>
        </div>
      </div>
      <div id="lib-ruler-rect" style="display:none;">
        <div class="ruler-tl"></div>
        <div class="ruler-tr"></div>
        <div class="ruler-bl"></div>
        <div class="ruler-br"></div>
      </div>
      <div id="duplicate-var-overlay" style="display:none;">
        <button id="dup-var-confirm-btn"></button>
        <button id="dup-var-cancel-btn"></button>
      </div>
      <div class="screen" id="creator-screen">
        <button id="creator-games-btn"></button>
        <button id="creator-create-edit-btn"></button>
      </div>
      <div class="screen" id="create-edit-screen" style="display:none;">
        <button id="back-from-create-edit-btn"></button>
        <button id="card-library-btn"></button>
      </div>
      <div class="screen" id="card-library-screen" style="display:none;">
        <button id="back-from-card-library-btn"></button>
        <button id="back-from-library-set-btn"></button>
      </div>
      <div id="card-maker-games"></div>
      <div id="library-set-1-games"></div>
      <div id="game-view-screen" style="display:none;">
        <button id="back-from-game-view-btn"></button>
        <div id="game-view-title"></div>
        <div id="game-view-desc"></div>
        <div id="game-view-cards"></div>
        <div id="game-view-dominos-area"></div>
        <div id="game-view-variations-area" style="display:none;"></div>
        <button id="game-view-var-btn"></button>
        <button id="game-view-flip-btn"></button>
        <button id="game-view-undo-btn" style="display:none;"></button>
        <button id="game-view-erase-btn" style="opacity:0.4;"></button>
        <button id="game-view-add-btn" style="opacity:0.4;"></button>
      </div>
      <div id="gm-popup" style="display:none;"></div>
      <div id="card-maker-save-overlay" style="display:none;"></div>
      <div id="novelty-prompt-overlay" style="display:none;">
        <div class="novelty-prompt-dialog">
          <div class="novelty-slider" id="novelty-prompt-slider"><div class="novelty-slider-knob"></div></div>
          <button id="novelty-keep-btn">Keep pink</button>
          <button id="novelty-dismiss-btn">Dismiss</button>
        </div>
      </div>
    </div>
  `;
}

function loadCardEditorModule() {
  loadDominoModule();
  loadSharedDataModule();
  buildCardEditorDOM();

  // Stubs for functions referenced by card-editor but defined elsewhere
  global.populateIntroGames = global.populateIntroGames || function() {};
  global.populateLibraryGames = global.populateLibraryGames || function() {};
  global.populateStartScreenGames = global.populateStartScreenGames || function() {};
  global.populateCardMakerGames = global.populateCardMakerGames || function() {};
  global.getGameCardSVG = global.getGameCardSVG || function() { return null; };
  global.getGameVariationSVG = global.getGameVariationSVG || function() { return null; };
  global.currentGameViewIndex = -1;
  global.activeCardSet = 'numbers';

  // Stub XMLSerializer for svgToPixels
  global.XMLSerializer = global.XMLSerializer || class {
    serializeToString(node) { return '<svg></svg>'; }
  };

  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'card-editor.js'), 'utf8');
  const wrapped = `(function() {
    ${code}
    return {
      toggleLibRuler, toggleLibBorder, updateLibBorderVars,
      libBorderOn, lbx, lby, llbx, llby,
      libZoom, libraryZoomIn, libraryZoomOut, libraryZoomReset,
      GRID_UNIT, snapToGrid, gridToSvg, svgToGrid, getEffectiveSize,
      drawSizeCoarse, drawSizeFine,
      getNextLetter, getNextNumber,
      generateCopyLabel,
      createVariationSVG,
      getElementPosition, setElementPosition,
      collectCardElements, isMathOperator, applySymbolToggle,
      pixelsMatch,
      getRowLetter, updateRowEmptyState,
      findCardByLabel,
      variationTools,
      getGameSetKey,
      cardMakerLabelToGameLabel,
      toggleVariationVisibility, variationsHidden,
      applyLibZoom,
      toggleGameViewEraseMode, eraseGameCard, eraseGameRow,
      gameViewEraseMode, openGameView, syncAbcCardsToGame,
      getCardRow, addCardsToCurrentGame,
      buildAvailableCardsArea, getAvailableCardsFromSet,
      toggleGameViewAddCards, gameViewAddMode,
      hideGameView, doHideGameView, showNoveltyPrompt
    };
  })()`;
  const exports = eval(wrapped);
  Object.assign(global, exports);
}

module.exports = {
  loadDominoModule, loadGameModule, buildMinimalDOM,
  loadSharedDataModule,
  loadGameCreatorModule, buildGameCreatorDOM,
  loadCardEditorModule, buildCardEditorDOM
};
