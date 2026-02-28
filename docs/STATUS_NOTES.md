# Vica Domino - Project Status Notes
**Date**: February 28, 2026
**Branch**: `claude/read-todays-notes-zfR1g`
**Total Commits**: 484 (199 original + 148 post-Feb-14 + PR merges)
**Codebase Size**: ~14,759 lines across 4 main files

---

## Project Overview

**Vica Domino** is an educational math game built as a single-page web app under the **Pinky Math Gaming** brand. The primary game is **"Find the Double"** — a domino-based game where players must identify the double card from a dealt hand before time runs out. It supports 1-2 human players plus an optional AI opponent ("Xeno"), custom card creation, and multi-stage game progression.

### Tech Stack
- **Pure HTML/CSS/JavaScript** — no frameworks or build tools
- **SVG-based** card and icon rendering
- **localStorage** for persistence (games, cards, variations, arrangements)
- **Single `index.html`** with inline scripts + external `game.js` and `domino.js`

### File Structure (current)
```
Vica_Domino/
├── index.html          (6,373 lines) - Main UI + inline Card Maker/Library/Game Maker scripts
├── js/
│   ├── game.js         (3,617 lines) - VicaDominoGame class, all gameplay logic
│   └── domino.js       (185 lines)   - Card definitions, utility functions
├── css/
│   └── style.css       (4,584 lines) - All styling, animations, responsive layouts
├── audio/
│   └── select-double.mp3             - Voice instruction audio
├── docs/
│   ├── MEMORY.md                     - Quick-reference project memory
│   ├── project-details.md            - Detailed architecture docs (written Feb 14)
│   └── STATUS_NOTES.md               - This file
└── README.md                         - Project description
```

---

## What Has Been Done (Complete Feature List)

### Core Game Engine
- [x] **Sun Level "Find the Double"** — primary game mode with 3 difficulty levels:
  - Circle/Sun = 2 cards, Triangle/Alien = 3 cards, Star/Sunflower = 4 cards
- [x] **Classic Domino Mode** — traditional domino gameplay with board placement
- [x] **1-2 player support** with player name/icon selection
- [x] **Xeno AI opponent** (pink alien) with simple strategy
- [x] **Adaptive Xeno Timer** — starts at 20s, adjusts based on wins/losses
- [x] **Keyboard controls** — number keys 1-4 (P1) and 7-0 (P2) for card selection
- [x] **W/P keyboard shortcuts** for Play Again / New Game
- [x] **Tie detection** (within 500ms window for 2-player)
- [x] **Anti-repetition system** — prevents same doubles/positions repeating
- [x] **Multi-press detection** — buffered clicks per player (150ms), multi-press = wrong
- [x] **Wrong answer feedback** — shake animation, coin deduction, "Try again"
- [x] **Winning animation** — domino slides up with scale bounce, others slide down

### Tutorial System (1-Player)
- [x] **Progressive tutorial finger** — shows pointing animation, hides after 3 wins
- [x] **"Double" label** — blinking label above the double card for beginners
- [x] **Voice instruction** — "Select a double" audio plays on first game
- [x] **Floating number keys** — key hint labels above dominos
- [x] **Keyboard popup** — miniature SVG keyboard appears on hover/click
- [x] **Progressive disclosure** — tutorial elements hide as player gains experience

### Multiplayer Tutorial
- [x] **Hover keyboard popup** for multiplayer
- [x] **"Press to select" labels** — shown for Win0/Win1, hidden from Win2 onward
- [x] **Number labels under dominos** — hidden from Win2 onward

### Card System
- [x] **Numbers & Dots set** — 5 values (A-E) with 6 representations each (A1-A6, etc.)
- [x] **ABC Card Set** — 25 letter cards (A-Y) with 5 values × 5 representations
- [x] **Picture icons for ABC** — Ant, Brain, Cat, Dog, Egg animal icons
- [x] **Custom card creation** — SVG-based draw tools
- [x] **Card variations** — multiple visual representations per card value
- [x] **Duplicate variation detection** — pixel-based comparison
- [x] **Card deletion** — single-click shows delete cross, separate deletion tracking for ABC
- [x] **Predefined library cards** for numbers 7-10 with optical corrections

### Card Maker (Editor)
- [x] **Draw tools** — pencil, eraser, shapes with snap-to-grid
- [x] **Text tool (T button)** with font selector and text submenu
- [x] **Stamps palette** — Sun, Alien, Sunflower + ABC animal icons (Ant, Brain, Cat, Dog, Egg)
- [x] **Stamp resizing** — via radius slider, max = full card size
- [x] **Aa and r sliders** — unified sizing controls (Aa 0-90, r 0-10)
- [x] **Color palette** — in variation box and Loupe editor toolbox
- [x] **Reflect/Rotate** — click-to-pin and transform in place
- [x] **Loupe mode** — magnified card inspection with grid overlay
- [x] **Magnifier/zoom** — +, -, ++ controls
- [x] **Select/move/edit/delete** for card symbols in draw mode
- [x] **New Card (+) button** — shows letter labels for rows
- [x] **Copy button on cards** — duplicate card designs
- [x] **Drag-to-move between rows** — reorganize card assignments
- [x] **Within-row card reordering** via drag-and-drop
- [x] **Card row persistence** — assignments and arrangement saved across reloads
- [x] **Save/cancel prompt** when leaving Card Maker
- [x] **Separate storage** for Numbers and ABC card sets
- [x] **Double-click to edit** cards in Card Maker
- [x] **Variation box** — shown only when clicking "v" button on card corner

### Game Maker
- [x] **Create custom games** — select cards, name games, manage domino pairs
- [x] **Edit/delete games** — full game management
- [x] **Copy game** — duplicate with name prompt
- [x] **Per-game variation exclusions** — different variations per game
- [x] **Domino pair generation** — all card-to-card pairs (cross-value + doubles)
- [x] **Individual domino exclusion** — exclude specific pairs from gameplay
- [x] **UP/DOWN flip mode** per game
- [x] **Game View** — show dominos with card editing, click title/description to edit

### Library System
- [x] **Two-column layout** — Card Sets and Games side by side
- [x] **Card set browsing** — Numbers & Dots and ABC sets
- [x] **All 25 ABC cards** shown in Library preview
- [x] **Inline card previews** — merged Library into single page
- [x] **Dim games** that don't belong to selected card set
- [x] **Custom game buttons** on start screen launch playable games
- [x] **Auto-generate ABC game** from card library on first load

### Main Page Pictures (MPP) Editor
- [x] **Custom domino level previews** — assign card images to level buttons
- [x] **Floating draggable panel** — click-to-assign interface
- [x] **Level icon system** — SVG markup stored in game data
- [x] **Unique domino pairs** with different halves in previews
- [x] **Filter out empty cards** from level previews

### Introductory Page
- [x] **Game selection page** before main setup screen
- [x] **Create and Edit** accessible from intro page
- [x] **Combined game loading** from intro page

### Economy & Progression
- [x] **Coin/Gem system** — win = +2 coins, wrong = -1 coin, 5 coins = 1 gem
- [x] **Gold coin visuals** with stacking animation
- [x] **Vertical coin columns** — coins displayed to left of dominos
- [x] **Stage stones** — progression indicator in header
- [x] **Combined Games** — chain multiple games into stages
- [x] **Stage transition** with "Level Up!" overlay
- [x] **Final celebration** with confetti canvas animation

### UI/UX Polish
- [x] **Domino icons** — dot patterns with game image face replacement
- [x] **Winner boxes** — personalized text, side-by-side layout
- [x] **Timer ripple rings** — multi-colored on timer expiry
- [x] **Finger push animation** when pressing number keys
- [x] **Sad wah-wah sound** on 1-player loss
- [x] **Responsive design** — iPad landscape/portrait, tablet, Android
- [x] **Right-click disabled** during gameplay
- [x] **Back button navigation** on all screens

### Bug Fixes (Major ones resolved)
- [x] Card corruption from drag/order persistence — fixed with unified cardArrangement
- [x] ABC cards reappearing after deletion — fixed with separate deletedCards_abc key
- [x] Cards disappearing from Game View — fixed with svgMarkup fallback
- [x] Custom cards not appearing in Numbers set — fixed with cardSet property
- [x] Color palette not persisting on ABC cards
- [x] Card sets mixing in Card Maker
- [x] ABC game showing wrong cards (numbers/dots instead of letters)
- [x] Text editing requiring multiple Enter presses / hanging
- [x] Combined game loading wrong content from intro page
- [x] Dominos disappearing when timer expires
- [x] Duplicate ID `draw-btn` causing conflicts
- [x] `const` redeclaration SyntaxError freezing everything
- [x] Dominos disappearing on second 2-player game
- [x] Xeno timer overlapping game board

---

## What Still Needs To Be Done

### Known Issues / Incomplete Areas

1. **Code Organization**
   - `index.html` is 6,373 lines with significant inline JavaScript — should be extracted into separate JS modules
   - `css/style.css` at 4,584 lines could be split into component-specific files
   - `game.js` at 3,617 lines handles too many concerns (game logic, UI, animations, timer, tutorial)
   - No build system, bundler, or minification

2. **Testing**
   - No automated tests exist (no unit tests, integration tests, or E2E tests)
   - All testing has been manual

3. **ABC Card Set**
   - Only 5 picture icons implemented (Ant, Brain, Cat, Dog, Egg) for letters A-E
   - Remaining 20 letters (F-Y) need picture icons
   - Card designs for letters F-Y are basic/default

4. **Classic Domino Mode**
   - Less polished compared to Sun Level "Find the Double" mode
   - Most recent development focused on Sun Level; classic mode may have edge cases

5. **Mobile/Touch**
   - Responsive layouts exist but may need further testing on actual devices
   - Touch interactions (drag-and-drop for card reordering) may not work smoothly on all touch devices

6. **Accessibility**
   - No ARIA labels or screen reader support
   - No high-contrast mode
   - Color-dependent game elements with no alternative indicators

7. **Audio**
   - Only one audio file (`select-double.mp3`)
   - Wah-wah disapproval sound is generated programmatically (Web Audio API)
   - Could add more audio feedback (win sounds, card click sounds, timer warnings)

8. **Performance**
   - Large single HTML file (6K+ lines) loaded all at once
   - localStorage used extensively — no cleanup/garbage collection of old data
   - No lazy loading of card sets or game data

9. **Multiplayer Enhancements**
   - No online/networked multiplayer — only local same-device
   - No score persistence across sessions
   - No leaderboard or player profiles

10. **Game Content**
    - Limited to "Find the Double" and Classic Domino modes
    - Combined Games feature exists but needs more game variety
    - Card sets limited to Numbers & Dots and ABC

11. **Documentation**
    - Existing docs (`MEMORY.md`, `project-details.md`) cover architecture but are from Feb 14
    - No user-facing documentation/help within the app
    - No in-app tutorial beyond the progressive finger animation

12. **Deployment**
    - No hosting/deployment pipeline
    - No PWA support (offline capability, installable)
    - No service worker for caching

---

## Development Timeline Summary

### Phase 1: Core Game (Feb 1-3) — ~26 commits
Basic domino game, Sun Level, player setup, Xeno opponent, keyboard controls

### Phase 2: Polish & Adaptive Timer (Feb 4-6) — ~24 commits
Title changes, two-column layout, adaptive timer, back button, iPad layouts

### Phase 3: Card Library & Design (Feb 7-8) — ~87 commits (most active)
Domino library preview, extensive card design pixel adjustments, zoom/scale

### Phase 4: Card Maker & Game Maker (Feb 9-11) — ~36 commits
Card editing, variation system, Game Maker, custom games, flip mode

### Phase 5: Advanced Tooling (Feb 12-13) — ~22 commits
Magnifier/loupe, draw tools, symbol editing, GM popup improvements

### Phase 6: Economy & Combined Games (Feb 14) — ~5 commits
Coin/gem economy, combined games, gold coin visuals

### Phase 7: UI Overhaul & 1-Player Tutorial (Feb 15-18) — ~50 commits
Level display overhaul, domino icons redesign, 1-player tutorial system (finger, double label, voice, progressive disclosure), timer ripple effects, multiplayer tutorial, coin layout

### Phase 8: Level Icons & MPP Editor (Feb 18-19) — ~12 commits
Main Page Pictures editor, level icon system, domino previews on buttons

### Phase 9: Card Maker Enhancements (Feb 19-22) — ~30 commits
Draw tool reorganization (T/Stamps), color palette, stamp icons, Aa/r sliders, stamp resizing, ABC animal icons, introductory page, ABC game auto-generation, Library redesign

### Phase 10: Advanced Card Management (Feb 22-27) — ~30 commits
Card Maker UX (double-click edit, save/cancel, letter labels), separate ABC storage, reflect/rotate, drag-to-move, copy cards, row reordering, card arrangement persistence, card corruption fixes

---

## localStorage Keys Reference

| Key | Purpose |
|-----|---------|
| `savedCustomGames` | Array of custom game definitions |
| `customCards` | Custom card SVG data (Numbers set) |
| `customCards_abc` | Custom card SVG data (ABC set) |
| `deletedCards_abc` | Tracking deleted ABC cards |
| `cardArrangement` | Unified card row/order persistence |
| `cardVariations` | Card variation definitions |
| `combinedGameConfig` | Combined game stage configuration |
| `_singlePlayerWins` | Tutorial progression counter |

---

## Quick Start for New Session

1. The project is at `/home/user/Vica_Domino` on branch `claude/read-todays-notes-zfR1g`
2. Main files: `index.html` (UI + inline scripts), `js/game.js` (game logic), `js/domino.js` (card data), `css/style.css` (styles)
3. No build step — open `index.html` directly in a browser
4. All state persisted in localStorage
5. Most recent work: Card arrangement persistence, drag-and-drop reordering, ABC card deletion fixes, card corruption fixes
