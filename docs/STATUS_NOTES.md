# Vica Domino - Project Status Notes
**Date**: March 11, 2026
**Branch**: `claude/review-project-docs-QNagl`
**Total Commits**: 500+
**Codebase Size**: ~15,864 lines across 4 main files

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
├── index.html          (7,328 lines) - Main UI + inline Card Maker/Library/Game Maker scripts
├── js/
│   ├── game.js         (3,614 lines) - VicaDominoGame class, all gameplay logic
│   └── domino.js       (185 lines)   - Card definitions, utility functions
├── css/
│   └── style.css       (4,737 lines) - All styling, animations, responsive layouts
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
- [x] **Variation editing in loupe** — double-click variation cards to edit in loupe with inverse transform coordinate conversion
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
- [x] **Insert SVG from file** — import external SVG files as stamps
- [x] **Over-scale slider (×1–×10)** — scale imported SVGs beyond card boundaries
- [ ] **Crop/pan tool** — reposition oversized imported SVGs within card area (partially working, has drag handler conflicts)
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
- [x] ~~**Auto-generate ABC game** from card library on first load~~ (removed March 4 — ABC game no longer auto-recreated after deletion)

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
- [x] Custom ABC cards beyond row E (F, G, ...) disappearing on reload
- [x] Symbol toggle swapping math operators along with numerals
- [x] Variations disappearing on reload for ABC and custom card sets
- [x] Built-in Numbers and Dots cards accidentally removed and restored
- [x] Custom card set data wiped when previewing in Library
- [x] Game-view × delete didn't visually remove the card (typo: `openCustomGameView` → `openGameView`)
- [x] Copying a card in Catch view created a square tile and wasn't persisted to `savedCatchGames`
- [x] Deleting one of two same-labeled copies removed both (label-only fallback fired because tile dataset lacked `stableId`)
- [x] GP rendered stale math-expression SVGs for cards edited in Card Maker after add (now resolves freshest svgContent by `stableId`)
- [x] GP domino count and pairings differed from Studio (GP now honors `mGroups`)
- [x] GP intro buttons could load the wrong game when localStorage changed in another tab (`populateIntroGames` re-runs on home click)
- [x] Cmd+Z / Ctrl+Z covers game-view edits (delete, copy, shape, M-card group) in both Find and Catch — re-renders the open game view after applying snapshot
- [x] "Add Cards to Game" — set-blind label match no longer hides cross-set cards (label match now scoped by `(label, cardSet)`)
- [x] `getCardsFromStorage` — custom set named "ABC" no longer aliases to the built-in `customDrawnCards_abc` key
- [x] **Non-stop Type of Game (Find)** — admin sets behavior per Type option in Game Settings; player picks Type on level-pick screen; round-end auto-restarts after a 3 s countdown unless user taps the button (skip-ahead) or stays idle for 60 s. `visibilitychange` pauses the countdown when the tab is hidden.

---

## What Still Needs To Be Done

### Known Issues / Incomplete Areas

1. **Code Organization**
   - `index.html` is 7,328 lines with significant inline JavaScript — should be extracted into separate JS modules
   - `css/style.css` at 4,737 lines could be split into component-specific files
   - `game.js` at 3,614 lines handles too many concerns (game logic, UI, animations, timer, tutorial)
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

13. **Recovery / undo gaps (deferred from April 26 session)**
    - `_undoStack` is in-memory only — page refresh wipes Cmd+Z history. Persisting it to localStorage was discussed (item "c") and deferred.
    - "Restore Cards from Cloud" only covers `customDrawnCards_*`, not `savedCustomGames` / `savedCatchGames`. A catch-game corruption can't be rolled back from cloud. Extending `_pushCardBackup` was discussed (item "d") and deferred.
    - Game-view mutations still NOT undoable: `confirmAddCards` (the + overlay), game rename / description, drag-reorder via `saveGameViewOrder`, combine games, clone-to-catch, delete entire game, copy game, plus ~22 direct `localStorage.setItem('savedCustomGames', …)` callers and ~10 direct `saveCatchGames(…)` callers. Audit-and-wire pass deferred. Easiest path: add the snapshot push inside `saveCatchGames` itself and a wrapper around savedCustomGames sets, then drop the per-call snapshots from `_saveCurrentViewGames` / `_removeCardFromThisGame`.

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

---

## March 4, 2026 Session — Card/Game Identity & Deletion Fixes

### Summary
Fixed a cluster of related bugs around game/card identity, cross-set confusion, and deletion not sticking. The root cause was that both card sets (ABC and Numbers & Dots) share the same label format (A1, B1, C1...), and several systems didn't distinguish between them.

### Changes Made (5 commits)

1. **Skip deleted cards when building game deck** (`startCustomGame`)
   - Cards removed from card sets but still stored in saved game data appeared during gameplay
   - Now cards are included only if they have stored `svgMarkup` OR exist in the card library DOM
   - Cards with neither (truly deleted, no fallback) are skipped
   - Key code: `index.html` lines ~5647-5650

2. **Scope `findCardByLabel` to the correct card set**
   - `findCardByLabel(label)` searched the entire DOM and returned the first match — wrong set if ABC appears before Numbers
   - Added optional `cardSet` parameter: `findCardByLabel(label, cardSet)`
   - When `cardSet` is `'ABC'`, searches only `#card-set-abc`; when `'Numbers and Dots'`, searches only `#card-set-numbers`; when omitted, searches everything (backward compatible)
   - Updated all callers that have `cardSet` info: `buildGameViewCard`, `getGameCardSVG`, `getGameVariationSVG`, `startCustomGame`, `buildGameViewVariations`, migration code
   - Callers without `cardSet` (variation restoration) still search all sets

3. **Removed hardcoded "Dots and Numbers" button from intro screen**
   - Line 18 had a hardcoded `<button>` that always showed regardless of user's games
   - Removed the button, the `selectIntroGame('dots-and-numbers')` highlight code, and the `goToMainPage()` branch for it
   - Intro screen now only shows dynamically populated games from `savedCustomGames` and `savedCombinedGames`

4. **Fixed ABC game cards not loading (plain letters instead of SVGs)**
   - The ABC card set DOM (`#card-set-abc`) is only populated when the user opens it in the card maker via `buildAbcCardSet()`
   - When starting a game, `findCardByLabel(label, 'ABC')` found nothing in the empty container
   - Original code skipped all cards → empty SVG map → dominos showed plain text fallback
   - Fixed: card inclusion now checks `hasMarkup || inDom` — cards with stored `svgMarkup` are included even if not in the DOM

5. **Stopped auto-recreating the ABC game on every page load**
   - `ensureAbcGameExists()` ran on every page load and re-created the ABC game if deleted
   - Replaced with `migrateAbcGameMarkup()` — a one-time migration that only backfills missing `svgMarkup` on an *existing* ABC game, never re-creates a deleted one

### Key Architecture Insights

- **Card identity is label + cardSet**: Labels like "A1" are NOT unique across the app. The `cardSet` property (`'ABC'` or `'Numbers and Dots'`) is required to disambiguate.
- **DOM vs stored data**: Card SVGs live in two places: (1) the card library DOM (built lazily per set), and (2) `svgMarkup` stored in `savedCustomGames`. Game loading must try DOM first, then fall back to stored markup.
- **Game data is a snapshot**: When a game is created, card data (including SVG markup) is copied into `savedCustomGames`. Deleting cards from a set doesn't automatically clean up game data — the game uses its stored copy as fallback.
- **ABC DOM is lazy**: `#card-set-abc` starts empty. `buildAbcCardSet()` populates it only when the user opens the ABC set in the card maker. Any code that needs ABC cards at startup must handle the empty-DOM case.

### Potential Follow-up Issues
- **Combined games referencing deleted games**: If a user deletes a game that's part of a combined game, the combined game still appears on the intro screen. `resolveStageGameIndex` looks up by name — if the game is gone, it returns -1 and `startCustomGame` silently fails. Could show a warning or auto-clean.
- **Orphaned localStorage keys**: When a game is deleted, `excludedDominos_N` and `excludedVariations_N` keys are removed for the deleted index, but indices shift — keys for games after the deleted one may become misaligned.
- **Custom card sets**: The `findCardByLabel` fix only handles `'ABC'` and `'Numbers and Dots'` containers. If custom card sets (stored in `#card-set-custom`) are used in games, they'd fall through to searching the full DOM.

## March 7, 2026 Session — Variation Toolbar Layout & Domino Display Improvements

### Summary
Two UI improvements: (1) reorganized the variation toolbar from a single row into a 2×4 grid, and (2) made non-double dominos in the Game View visually match the doubles' "joined pair" style using a copper outline.

### Changes Made (3 commits)

1. **Variation toolbar 2×4 layout** (`index.html`, `css/style.css`)
   - The variation toolbar had 8 buttons in a single horizontal row (4 reflections, 3 rotations, 1 symbol toggle) separated by `<div class="var-tool-sep">` dividers
   - Reorganized into two rows of 4 buttons each using `<div class="var-tool-row">` wrappers:
     - **Top row**: 4 reflection buttons (vertical, horizontal, diagonal \, diagonal /)
     - **Bottom row**: 3 rotation buttons (90°, 180°, 270°) + symbol toggle button
   - Removed the `<div class="var-tool-sep">` separators (rows provide visual grouping now)
   - CSS: `.variation-toolbar` changed from `flex-direction: row` to `flex-direction: column`
   - CSS: Added `.var-tool-row` class (`display: flex; flex-direction: row; gap: 4px`)
   - Also changed all SVG icon colors from hardcoded `#2255aa` to `currentColor` so icons inherit CSS color consistently (including the symbol toggle button which previously had a mismatched color)
   - Symbol toggle SVG size normalized from `width="22" height="22"` to `width="20" height="20"` to match other buttons
   - Key locations: `index.html` lines ~343-370, `css/style.css` lines ~623-641

2. **Copper outline for non-double dominos in Game View** (`css/style.css`)
   - In the Game View domino display, doubles had a gold `box-shadow: 0 0 0 2px #FFD700` outline making them look like joined domino pairs
   - Non-doubles had no outline, making the two card halves look disconnected ("too big distance, no distinct line")
   - Added `.game-view-domino:not(.double-domino) .game-view-domino-half { box-shadow: 0 0 0 2px #CD7F32; }` — a copper outline
   - Now all domino pairs look visually joined: **gold (#FFD700) for doubles, copper (#CD7F32) for non-doubles**
   - Key location: `css/style.css` lines ~1828-1835

3. **Symbol toggle button implemented** (`index.html`)
   - The symbol toggle button (bottom-right in V toolbar, shows "1↔2" icon) was disabled (`var-tool-disabled` class, `pointer-events:none`) and non-functional
   - Removed disabled state so button matches styling of other toolbar buttons
   - Implemented `applySymbolToggle()`: finds all placed elements (text, circles, stamps, etc.) in the card SVG and rotates their positions — element 0 moves to element 1's position, element 1 to element 2's, etc.
   - Helper functions: `getElementPosition()`, `setElementPosition()`, `collectCardElements()` handle different SVG element types (text x/y, circle cx/cy, rect x/y+size, group translate)
   - `collectCardElements()` unwraps one level of `<g>` wrapper (from previous variation transforms) to find the actual placed elements
   - The toggle silently does nothing if a card has fewer than 2 elements
   - Creates a proper variation (with duplicate detection) just like reflection/rotation tools
   - Key location: `index.html` — `createVariationSVG` and new helper functions after it

### Design Decisions
- **Copper vs gold distinction**: User requested a different color for non-doubles to distinguish them from doubles while still looking like proper dominos. Copper (#CD7F32) was chosen as a warm, complementary tone to gold.
- **`currentColor` for SVG icons**: Rather than hardcoding `#2255aa` in every SVG element, using `currentColor` means the icons automatically pick up whatever `color` property is set on the button via CSS. This makes future theming/color changes easier.
- **No separator divs needed**: With two rows, the spatial grouping is self-evident. The old `<div class="var-tool-sep">` vertical lines were removed as unnecessary.

### File Sizes After Changes
- `index.html`: ~6,946 lines (was ~6,938)
- `css/style.css`: ~4,731 lines (was ~4,726)

---

## March 7-8, 2026 Session — Variation Editing, Card Fixes, Library Safeguards

### Summary
Major enhancements to the variation system (loupe editing, persistence fixes), restoration of accidentally removed built-in cards, symbol toggle refinement, and a critical fix for custom card data being wiped during Library preview.

### Changes Made (9 commits)

1. **Custom ABC cards beyond row E (F, G, ...) disappearing on reload** (`index.html`)
   - `buildAbcCardSet()` only created rows A-E, so custom cards in rows F+ had no target row during restoration and were silently skipped
   - Now creates new rows on demand for any letter
   - Also fixed the preview builder to show extra rows and widened the game label regex from `[A-E]` to `[A-Z]`

2. **Symbol toggle refined to skip operators** (`index.html`)
   - `applySymbolToggle()` was rotating positions of ALL elements including math operators (+, -, ×, ÷, =)
   - Now filters out operators and only swaps positions of numerals/letters/symbols
   - Operators stay in their original position when toggling

3. **Variations disappearing on reload for ABC and custom card sets** (`index.html`)
   - `saveVariations()` now stores which `cardSet` each variation belongs to
   - `loadVariations()` defers ABC/custom set variations until those sets are lazily built
   - Includes backward compatibility for old saved data without the `cardSet` field

4. **Variation cards editable in the loupe** (`index.html`)
   - Double-click a variation card to open it in the loupe editor
   - Variation transform `<g>` marked with `data-variation-transform` attribute
   - Inverse transform matrix computed for coordinate conversion (click, drag, selection ring positioning)
   - Arrow key directions transformed so visual movement matches keys inside rotated/reflected variations
   - New elements drawn in loupe are appended inside variation `<g>`
   - Single-click on variations shows copy button
   - Edited variation SVG content saved/loaded in localStorage

5. **Built-in Numbers and Dots cards restored** (`index.html`)
   - 45 built-in cards (rows A-I with numbers, digits, and dot patterns) were accidentally removed in a previous commit and restored
   - Empty cards filled with new designs: A3 (hollow oval), A4 (cursive "0"), A5 (dashed box), H4 (7-dot pattern 3+1+3), H5 (8-dot pattern 3+2+3)

6. **Built-in set deletion attempted and reverted** (`index.html`)
   - Briefly prevented deletion of built-in card sets (Numbers and Dots, ABC) by removing delete buttons
   - Reverted immediately to keep deletion available

7. **Custom card set data preserved during Library preview** (`index.html`)
   - When clicking a custom set in the Library to preview it, `activeCardSet` was set to the custom set name
   - On page refresh/close, `beforeunload` handler called `saveCustomCards()`, which queried the empty `#card-set-custom` div (only populated when Card Maker is open) and saved an empty array, erasing all card data
   - Fix: guarded the custom set save path to only run when the Card Maker screen is actually visible

### Key Architecture Insights

- **Variation persistence requires card set context**: Variations saved without knowing which card set they belong to can't be restored when sets are lazily built. The `cardSet` field on saved variation data solves this.
- **Inverse transforms for loupe editing**: When a variation has a reflection/rotation transform, all mouse coordinates and directional inputs must be converted through the inverse matrix to work correctly in the element's local coordinate space.
- **Dynamic row creation**: Card sets shouldn't have a fixed row limit. Creating rows on demand for any letter allows the ABC set to grow beyond the original A-E.
- **Save guards matter**: Any save-on-unload handler that queries DOM state must verify the relevant UI is actually visible, since lazy/empty containers produce destructive empty saves.

### File Sizes After Changes
- `index.html`: ~7,328 lines (was ~6,946)
- `css/style.css`: ~4,737 lines (was ~4,731)

---

## March 10-11, 2026 Session — SVG Import & Overscale/Crop Tools

### Summary
Added the ability to import external SVG files into the Card Maker as stamps, with an over-scale slider and crop/pan tool for positioning oversized SVGs within card boundaries. Feature is partially working — crop/pan still has issues.

### Changes Made (5 commits)

1. **"Insert SVG from file" button** (`index.html`)
   - Added a new button to Card Maker draw tools that opens a file picker for `.svg` files
   - Imported SVG is parsed, cleaned, and inserted as a stamp element on the card canvas
   - Commit: `f0efe4f`

2. **Over-scale slider (×1–×10)** (`index.html`)
   - When an imported SVG stamp is selected, an over-scale slider appears allowing scaling from ×1 to ×10
   - Default scale fits the SVG within the card; over-scaling lets it extend beyond card boundaries for detail/crop effects
   - Commit: `f49ad32`

3. **Fix SVG overscale not applying to placed stamps** (`index.html`)
   - The overscale slider was only updating the preview, not the actual placed stamp element
   - Fixed to apply scale transform to the placed imported stamp
   - Commit: `c744ef2`

4. **Show crop/pan button at any scale for imported stamps** (`index.html`)
   - Initially crop/pan button only showed when scale > 1
   - Changed to show for imported stamps at any scale, since users may want to reposition
   - Commit: `6a7ff72`

5. **Fix crop/pan mode broken by competing drag handlers** (`index.html`)
   - The card canvas had existing drag handlers (for moving elements) that competed with the crop/pan drag
   - Partially fixed by adding a mode flag, but behavior is **still not fully correct**
   - Commit: `fcc139b`

### Known Issues (ACTIVE)
- **Crop/pan not fully working**: Drag interactions in crop/pan mode still conflict with other card canvas event handlers. The panning doesn't behave as expected in all cases. Needs rewrite.
- This is the **primary task for the next session**.

### Planned Fix: clipPath Model (Word-style crop)
The current approach tries to reuse the existing canvas drag handlers with a mode flag, causing conflicts. The fix is to use the standard image-editor pattern:
1. **Card = crop frame**: The card SVG boundary is fixed and acts as the visible window
2. **`<clipPath>` on a group**: Define a `<clipPath>` matching the card rect; wrap the imported SVG in a `<g clip-path="url(#...)">`
3. **Inner `<g>` for transforms**: Inside the clipped group, a child `<g transform="translate(x,y) scale(s)">` holds the actual SVG content
4. **Pan = update `translate()`**: Drag in pan mode only changes the inner group's translate — completely separate from the element selection/move system
5. **Scale = update `scale()`**: The overscale slider updates the inner group's scale, keeping the visual center stable
6. **No competing handlers**: Pan/scale operate on a dedicated inner group, not on individual card elements, so the existing element drag system is untouched

### File Sizes After Changes
- `index.html`: ~7,500+ lines (was ~7,328)

---

## March 23, 2026 Session — Player/Admin Split & Login Fixes

### Summary
Separated the app into Player and Admin pages, added role selection to the intro screen, fixed Firestore reserved ID errors, and fixed the admin login overlay showing an empty dialog.

### Changes Made

1. **Player/Admin role selection on intro screen** (`index.html`, `css/style.css`, `js/game.js`, `js/sync.js`)
   - Intro screen now shows Player and Admin buttons first
   - Player → game list + Play; Admin → superuser login → card library
   - `selectRole()` / `resetIntroScreen()` functions manage the flow
   - `_adminLoginPending` flag routes successful admin login to card library

2. **Separate admin page** (`pm-studio-DrV.html`)
   - Standalone HTML file for the admin/superuser site
   - Deployed at `/pm-studio-DrV` on GitHub Pages

3. **Fixed admin login overlay empty dialog** (`pm-studio-DrV.html`)
   - `showSyncLoginOverlay()` called `showRoleChoice()` which hid the admin login form
   - `sync-role-choice` div was empty on admin page → users saw blank dialog
   - Fixed: calls `showAdminLogin()` directly to show the superuser ID input

4. **Fixed Firestore reserved ID error** (`js/sync.js`)
   - `"__player__"` legacy ID caused Firestore `invalid-argument` error
   - Added `_isValidFirestoreId()` guard and auto-sanitization to `"player-guest"`

### File Structure Update
```
Vica_Domino/
├── index.html              - Player-facing app (intro → game selection → play)
├── pm-studio-DrV.html      - Admin/superuser app (login → card library/editor)
├── js/
│   ├── game.js             - VicaDominoGame class
│   ├── domino.js           - Card definitions
│   └── sync.js             - Firebase sync, login logic
├── css/
│   └── style.css           - All styling
└── docs/                   - Project documentation
```

---

---

## March 24 Session — Built-in Card Migration Fix

**Problem**: After the March 23 refactor that removed built-in cards and made everything custom, the 45 Numbers & Dots built-in cards and ABC cards were not appearing in Studio's Card Maker.

**Investigation**: Discovered two layered bugs:
1. **Wrong storage key**: The user had previously deleted the built-in "numbers" set and created a custom set "Numbers and Dots". The migration wrote to `customDrawnCards` (built-in key), but the custom set reads from `customDrawnCards_Numbers and Dots`
2. **Sync timing race**: Migration ran synchronously on page load as an IIFE, but `syncLogin()` is async — when Firestore pull completed, it wiped ALL localStorage and replaced with cloud data (which didn't have migrated cards)

**Fix (migration v2)**:
- Migration detects `deletedBuiltinSets` and `savedCardSets` to find the correct storage key dynamically
- Changed from IIFE `(function migrateBuiltinToCustom(){...})()` to named function `runBuiltinMigration()`
- Called inside every `syncLogin().then()` callback so it runs AFTER Firestore restore
- Still called immediately for offline/no-sync scenarios
- Uses flag `'v2'` instead of `'true'` to force re-run over old v1 migration
- Merges cards from old keys into the correct new key, cleans up legacy keys

**Files changed**: `pm-studio-DrV.html` (migration logic + syncLogin callbacks)

**Key commits**:
- `56d966d` — v2 migration with deleted/renamed set detection
- `d3888a7` — Fix timing: run migration after Firestore sync completes

**Key debugging lesson**: Any localStorage migration in this project MUST run AFTER the async Firestore `syncLogin()` completes, not before. The sync layer wipes and replaces all localStorage with cloud data.

---

## March 25, 2026 Session — Card Data Loss Prevention & Recovery

### Summary
Critical session focused on preventing card data loss, recovering lost Numbers and Dots cards, and adding automatic cloud backups. Also fixed the Play test button and VALUE_RANK error.

### Problems Discovered & Fixed

1. **Play test button showing empty page** (`pm-studio-DrV.html`)
   - Play mode loaded an iframe with `pm-studio-DrV.html?play=X`
   - `checkPlayMode()` ran BEFORE `populateStartScreenGames()` — game data wasn't ready
   - `VALUE_RANK` (defined in `domino.js`) wasn't loaded yet when `startCustomGame()` ran
   - Fix: moved play mode init AFTER initialization; added `VALUE_RANK` fallback

2. **Card data loss from beforeunload + iframe** (`pm-studio-DrV.html`)
   - `saveVariations()` → `saveCustomCards()` reads from Card Maker DOM
   - If Card Maker never opened, DOM is empty → saves empty arrays → wipes card data
   - `beforeunload` handler triggered this on every page close/refresh
   - Play mode iframe made it worse (loads Studio, never opens Card Maker, unloads → empty save)
   - Fix: Added `_cardMakerBuilt` flag — only set `true` when `buildNumbersCardSet()` or `buildAbcCardSet()` runs; `saveVariations()` and `saveCustomCards()` skip if flag is `false`

3. **`safeSaveCards()` wrapper** (`pm-studio-DrV.html`)
   - New function that blocks saving `[]` (empty array) when localStorage already has non-empty card data
   - Applied to all card save paths: Numbers, ABC, custom sets, variations
   - Console warning logged when a save is blocked
   - Explicit deletion (`deleteBuiltinCardSet`, `deleteCardSet`) uses `localStorage.removeItem()` directly, bypassing the guard

4. **Cloud sync wiping local cards** (`js/sync.js`)
   - `syncLogin()` pull replaced ALL localStorage with cloud data
   - If cloud had empty/missing card keys, local cards were wiped
   - Initially protected only 3 hardcoded keys — missed `customDrawnCards_Numbers and Dots` (custom set key)
   - Fix: now protects ALL keys matching `customDrawnCards*`, `cardMakerVariations`, `cardArrangement*`, `abcCardSnapshot`

5. **Numbers and Dots card recovery** (`recover-cards.html`)
   - Cards were lost from both localStorage and Firebase
   - Extracted all 45 original card SVGs from git history (commit `561692f^`)
   - Created `recover-cards.html` — standalone page that saves cards to correct localStorage key
   - Initial version had broken JS (unescaped quotes in innerHTML) — fixed with DOM API
   - Had to detect correct storage key (`customDrawnCards` vs `customDrawnCards_Numbers and Dots`)

6. **Automatic card backup to Firebase** (`js/sync.js`)
   - New `card_backups` subcollection in Firestore: `users/{userId}/card_backups/{timestamp}`
   - Saves all card-related localStorage keys every 20 minutes
   - First backup runs 30 seconds after login
   - Keeps last 3 backups, auto-deletes older ones
   - "Restore Cards from Cloud" button added to Backup & Restore section
   - Public API: `syncListCardBackups()`, `syncRestoreCardBackup(id)`

### Key Files Changed
- `pm-studio-DrV.html` — `_cardMakerBuilt` guard, `safeSaveCards()`, play mode fix, VALUE_RANK fix, cloud backup restore UI
- `js/sync.js` — sync guard for ALL card keys, auto card backup system
- `recover-cards.html` (NEW) — standalone card recovery page
- `data/numbers-cards-backup.json` (NEW) — JSON backup of 45 original cards

### Key Commits
- `8e75d1a` — Fix Play button empty page + initial card loss prevention
- `3000943` — Comprehensive card data loss guards
- `890037c` — Fix VALUE_RANK not defined in play mode
- `22a427a` — Fix sync guard to protect ALL card data keys
- `c49b8c3` — Fix recovery page storage key detection
- `3b03815` — Auto card backup to Firebase every 20 minutes

### Architecture Insights
- **Storage key complexity**: Numbers & Dots cards can be stored under `customDrawnCards` (built-in key) OR `customDrawnCards_Numbers and Dots` (custom set key). Always use `getNumbersStorageKey()` to get the right one. Check `deletedBuiltinSets` and `savedCardSets` to understand current state.
- **3 layers of card protection**: (1) `_cardMakerBuilt` flag prevents saving when DOM isn't populated, (2) `safeSaveCards()` blocks empty-over-non-empty saves, (3) sync guard preserves local cards when cloud is empty
- **Firebase backup structure**: `users/{userId}/card_backups/{ISO-timestamp}` with fields `{ timestamp, data }` where `data` is JSON string of all card-related localStorage keys
- **Syntax validation is critical**: Always run `node -e "new Function(code)"` before committing JS. Broken syntax in HTML inline scripts causes silent failures with no error in the page.

---

## Quick Start for New Session

1. The project is at `/home/user/Vica_Domino` on branch `claude/review-project-docs-JOOeh`
2. Main files: `index.html` (player UI), `pm-studio-DrV.html` (admin UI), `js/game.js` (game logic), `js/domino.js` (card data), `js/sync.js` (Firebase sync), `css/style.css` (styles)
3. No build step — open HTML files directly in a browser or via GitHub Pages
4. All state persisted in localStorage + Firebase sync for superusers
5. **Both player and admin pages are working** as of March 28
6. **Card data protection**: 3 layers — `_cardMakerBuilt` flag, `safeSaveCards()`, sync guard
7. **Auto card backup**: Every 20 min to Firebase `card_backups` subcollection
8. **ALWAYS validate JS syntax before committing** — use `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"`
9. **Numbers & Dots storage key**: Use `getNumbersStorageKey()` — returns `customDrawnCards` or `customDrawnCards_Numbers and Dots` depending on `deletedBuiltinSets`
10. **Crop/Pan tool**: Removed — was non-functional
11. **Recovery page**: `recover-cards.html` available if cards are ever lost again
12. **× slider**: Dynamic range with clickable max popup, 0.02 step, bottom-left anchor scaling
13. **SVG import**: Large SVGs (>200KB) auto-rasterized to 600×600 PNG; auto-sets Aa=90, r=10
14. **Game Creator +**: Add cards from any card set; deletion updates game data + auto-refreshes dominos
15. **localStorage quota**: Cards >500KB skipped; QuotaExceededError handled with revert
