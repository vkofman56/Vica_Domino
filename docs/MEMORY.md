# Vica Domino Project Memory
**Last Updated**: March 31, 2026

## Deployment Notes
- **Site URL**: https://vkofman56.github.io/Vica_Domino/pm-studio-DrV
- **Deployed from**: `claude/review-project-docs-JOOeh` branch on GitHub (GitHub Pages)
- **IMPORTANT**: Every push must include `git push origin master:claude/review-project-docs-JOOeh` to deploy
- **Push command**: `git push origin master && git push origin master:claude/review-project-docs-JOOeh`
- **Trial timestamp**: Update the trial timestamp in the Library title (`pm-studio-DrV.html` line ~302) with every push so the user can verify they're seeing the latest version. Use San Francisco time (TZ='America/Los_Angeles').
- **GitHub Pages delay**: Deployment takes 30-120 seconds after pushing

## Project Overview
- **Brand**: "Pinky Math"
- **Platform**: "Pinky Math Gaming" — a game generator that produces standalone game applications
- **Repo/codename**: Vica_Domino
- **First standalone apps**: "Find the Double" — a family of domino-based games (various versions)
- **Type**: Educational math game generator, single-page web app
- **Vision**: Each completed game is extracted as a standalone application; the generator continues developing new games
- **Development**: 484+ commits over Feb 1-27, 2026 (most active: Feb 7 with 68 commits)
- **Detailed notes**: See [project-details.md](project-details.md) and [STATUS_NOTES.md](STATUS_NOTES.md)

## Project Structure (current sizes)
- `index.html` (~7,328 lines): Main UI, HTML screens, inline `<script>` for Card Maker/Library/Game Maker
- `js/game.js` (3,614 lines): `VicaDominoGame` class - all gameplay logic
- `js/domino.js` (185 lines): Card definitions, utility functions (isDouble, canPlayOn, etc.)
- `css/style.css` (~4,737 lines): All styling, animations, responsive layouts
- `audio/select-double.mp3`: Voice instruction for tutorial
- Inline script in index.html runs BEFORE game.js loads
- `game.js` uses `DOMContentLoaded` to instantiate `VicaDominoGame`
- **Total**: ~15,864 lines of code

## Game Modes
1. **Sun Level (Find the Double)**: Primary mode - each player gets N dominos, must find the double
   - Circle/Sun = 2 cards, Triangle/Alien = 3 cards, Star/Sunflower = 4 cards
2. **Classic Domino**: Traditional domino gameplay with board placement (left/right)
3. **Combined Games**: Multi-stage progression with coin/gem economy

## Card Sets
1. **Numbers & Dots** — 5 values (A-E) with 6 representations each, 15 domino pairs
2. **ABC Card Set** — 25 letter cards (A-Y), 5 values × 5 representations, with animal icons (Ant, Brain, Cat, Dog, Egg)

## Key Features
- **1-2 player** support + optional **Xeno** computer opponent (pink alien AI)
- **Adaptive Xeno Timer**: Starts at 20s, decreases on wins, increases on losses
- **Keyboard controls**: Number keys 1-4 (player 1) and 7-0 (player 2) for card selection
- **W/P shortcuts** for Play Again in end-game state
- **Tie detection** (within 500ms for 2-player)
- **Progressive tutorial**: finger animation, "double" label, voice instruction, keyboard hints — all hide after N wins
- **Card Maker**: Create/edit custom card designs with draw tools (pencil, eraser, shapes, text, stamps), font selector, SVG-based, Aa/r sliders, color palette, reflect/rotate
- **Variation toolbar**: 2×4 grid layout — top row: 4 reflections, bottom row: 3 rotations + symbol toggle; SVG icons use `currentColor`
- **Game Maker**: Create custom games, select cards, manage domino pairs, per-game variation exclusions, flip mode
- **Card Library**: Two-column layout (Card Sets + Games), browse with zoom, loupe mode, grid overlay
- **Card Variations**: Multiple visual representations per card value, with pixel-based duplicate detection; editable in loupe via double-click
- **Drag-and-drop**: Copy cards, move between rows, reorder within rows, persistent arrangement
- **Main Page Pictures (MPP)**: Custom domino level preview icons
- **Introductory page**: Game selection before main setup
- **Combined Games**: Chain multiple games into stages with coin (5 coins = 1 gem) progression
- **Coin/Gem economy**: Gold coin visuals, vertical stacking, stage stones in header
- **LocalStorage persistence** for custom games, variations, card data, arrangements
- **Responsive design**: iPad landscape/portrait, tablet, mobile

## localStorage Keys
| Key | Purpose |
|-----|---------|
| `savedCustomGames` | Custom game definitions |
| `customDrawnCards` | Numbers & Dots card SVG data (built-in key) |
| `customDrawnCards_Numbers and Dots` | Numbers & Dots card SVG data (custom set key — used when set was deleted & recreated) |
| `customDrawnCards_abc` | ABC card SVG data |
| `customDrawnCards_<SetName>` | Custom card set SVG data |
| `savedCardSets` | Array of custom card set names |
| `deletedBuiltinSets` | Array of deleted built-in set names (e.g. `["numbers"]`) |
| `deletedCards_abc` | Deleted ABC cards tracking |
| `cardArrangement` | Card row/order persistence (Numbers) |
| `cardArrangement_abc` | Card row/order persistence (ABC) |
| `cardMakerVariations` | Card variation definitions |
| `abcCardSnapshot` | ABC card set snapshot for Library preview |
| `savedCombinedGames` | Combined game stage configurations |
| `savedCatchGames` | "Catch the double" cloned game definitions |
| `_singlePlayerWins` | Tutorial progression counter |
| `__sync_userId` | Firebase sync user ID |
| `__sync_userRole` | Firebase sync role (superuser/player) |
| `migration_builtins_converted` | Migration flag (`'v2'`) |

**CRITICAL**: `getNumbersStorageKey()` returns `customDrawnCards` normally, but returns `customDrawnCards_Numbers and Dots` if `deletedBuiltinSets` contains `"numbers"` and `savedCardSets` contains a matching name. Always use this function to get the correct key.

## Debugging Lessons
- **Always validate JS syntax first** when user reports "nothing works" / "frozen". Use: `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"`
- A SyntaxError in a `<script src="...">` file prevents the ENTIRE file from executing
- `const` redeclaration in the same scope is a SyntaxError
- **Card corruption**: Be careful with localStorage persistence of drag/order data — scope to active card set, use unified `cardArrangement` key
- **ABC vs Numbers mixing**: Always check active card set before saving/loading custom cards
- **findCardByLabel must be scoped by cardSet**: Both ABC and Numbers sets share the same label format (A1, B1, etc.) — searching the whole DOM returns the wrong card if the wrong set appears first
- **Card set DOM may not be built**: The ABC card set DOM (`#card-set-abc`) starts empty and is only populated when the user opens it in the card maker. Game loading must fall back to stored `svgMarkup` when DOM lookup fails — don't skip cards just because they're not in the DOM
- **Auto-creation functions defeat deletion**: `ensureAbcGameExists()` recreated the ABC game on every page load, making deletion impossible. Replaced with a one-time migration that only backfills data on existing games

## Known Fixed Issues
- **Duplicate ID `draw-btn`**: Card Maker draw button and game's "Draw from Bank" shared ID. Fixed: game's button → `bank-draw-btn`
- **`hideCreateEdit()` display bug**: Was setting start-screen to `display: block` instead of `display: flex`
- **Duplicate `const key`** in handleKeyPress caused SyntaxError freezing everything
- **Domino disappearing** on second 2-player game
- **Xeno timer box overlapping** game board (fixed for both normal and iPad landscape)
- **Card corruption from drag/order**: Fixed with unified `cardArrangement` persistence scoped to active card set
- **ABC cards reappearing after deletion**: Fixed with separate `deletedCards_abc` key
- **Cards disappearing from Game View**: Fixed with `svgMarkup` fallback
- **ABC game showing wrong cards**: Fixed card set mixing in Card Maker
- **Text editing hanging**: Fixed multiple Enter press issue
- **Deleted cards appearing in gameplay**: Game data stored stale card SVGs. Fixed: cards included only if they have stored `svgMarkup` OR exist in the DOM (March 4)
- **Wrong card set shown in games**: `findCardByLabel()` now accepts optional `cardSet` param to search only the correct container (`#card-set-numbers` or `#card-set-abc`) (March 4)
- **Hardcoded "Dots and Numbers" intro button**: Removed — intro screen now only shows user-created games dynamically (March 4)
- **ABC game not rendering (plain letters)**: ABC card set DOM not built at game start time. Fixed: SVG pool building uses stored `svgMarkup` fallback (March 4)
- **ABC game re-created after deletion**: `ensureAbcGameExists()` removed; replaced with one-time migration (March 4)
- **Custom ABC cards beyond row E disappearing on reload**: `buildAbcCardSet` only created rows A-E; now creates rows on demand for any letter (March 7)
- **Symbol toggle swapping operators**: `applySymbolToggle` rotated ALL elements including +, -, ×, ÷, =; now filters out operators and only swaps numerals (March 7)
- **Variations disappearing on reload for ABC/custom sets**: `saveVariations()` now stores card set; `loadVariations()` defers ABC/custom set variations until those sets are lazily built (March 7)
- **Custom card set data wiped when previewing in Library**: `beforeunload` handler called `saveCustomCards()` with empty `#card-set-custom` div; now guards save to only run when Card Maker is visible (March 8)
- **Card data wiped by beforeunload/iframe saves**: `saveVariations()`→`saveCustomCards()` read from Card Maker DOM which is empty if never opened; `beforeunload` and Play iframe triggered this. Fixed with `_cardMakerBuilt` guard + `safeSaveCards()` (March 25)
- **Cloud sync wiping local card data**: `syncLogin()` replaced ALL localStorage with cloud data including empty card arrays. Fixed with sync guard that preserves ALL `customDrawnCards*` keys when cloud version is empty (March 25)
- **Play button showing empty page**: Play mode iframe ran `startCustomGame()` before `populateStartScreenGames()` populated game data. Fixed by moving play mode init after initialization. Also fixed `VALUE_RANK` not defined error (March 25)
- **Numbers and Dots cards lost and recovered**: Cards were extracted from git history (commit `561692f^`) and restored via `recover-cards.html` page. Root cause was chain of: empty DOM save → sync to cloud → cloud overwrites local on reload (March 25)

## March 7 Session Notes
- **Variation toolbar**: Reorganized from single row into 2×4 grid (2 rows of 4 buttons). Removed separator divs. All SVG icons changed from hardcoded `#2255aa` to `currentColor`. Key: `index.html` ~line 343, `css/style.css` ~line 623.
- **Non-double domino styling**: Added copper outline (`#CD7F32`) to non-double dominos in Game View, matching the gold outline (`#FFD700`) on doubles. Both now look like proper joined domino pairs. Key: `css/style.css` ~line 1832, selector `.game-view-domino:not(.double-domino) .game-view-domino-half`.
- **Symbol toggle implemented**: The toggle button (bottom-right in V toolbar) now swaps positions of placed elements on a card. Removed disabled state, implemented `applySymbolToggle()` with position rotation logic. Works for cards with 2+ elements (text, circles, stamps, groups). Filters out math operators (+, -, ×, ÷, =) so they stay in place. Key: `index.html` — `createVariationSVG` and helpers.

## March 7-8 Session Notes (continued)
- **Variation cards editable in loupe**: Double-click a variation card to open it in the loupe editor. Implemented inverse transform matrix for coordinate conversion, so drawing/selection works correctly inside transformed variation `<g>` elements.
- **Built-in Numbers and Dots cards restored**: 45 built-in cards (rows A-I) were accidentally removed and then restored. Empty cards A3, A4, A5, H4, H5 filled with new designs (hollow oval, cursive "0", dashed box, 7-dot pattern, 8-dot pattern).
- **Variations persistence fix**: `saveVariations()` now includes `cardSet` field. `loadVariations()` defers restoration of ABC/custom set variations until those sets are built (lazy initialization).
- **Custom card set data preservation**: Fixed Library preview wiping custom card set data by guarding `saveCustomCards()` to only run when Card Maker screen is visible.
- **Built-in set deletion attempted then reverted**: Briefly prevented deletion of built-in card sets, but reverted to keep deletion available.

## March 10-11 Session Notes
- **Insert SVG from file**: Added "Insert SVG from file" button to Card Maker draw tools. Allows importing external SVG files as stamps that can be placed on cards.
- **Over-scale slider (×1–×10)**: Added a scaling slider for imported SVGs, allowing them to be scaled up to 10× their default size (which fits within the card). This lets large/detailed SVGs fill the card.
- **Crop/Pan tool for imported SVGs**: When an imported stamp is oversized (scaled beyond card boundaries), a crop/pan button appears allowing the user to drag/reposition the SVG within the card area. Includes a "done" button to finalize placement.
- **Status: NOT FULLY WORKING** — The crop/pan and overscale features still have issues. Competing drag handlers were partially fixed but behavior is still not right. Needs further debugging in next session.
- **Planned fix approach (clipPath model)**: Rewrite crop/pan to use the Word/image-editor pattern — the card is the crop frame (fixed), the imported SVG sits inside a `<clipPath>`-clipped group, pan changes `translate()` on the inner group, scale changes `scale()` on the inner group. This cleanly separates pan/scale from the existing element drag system (no competing handlers). The card boundary is the clip rect; the SVG moves freely behind it.
- Key commits: `f0efe4f`, `f49ad32`, `c744ef2`, `6a7ff72`, `fcc139b`

## March 23 Session Notes
- **Player/Admin role selection on intro screen**: Replaced the old intro screen (which showed game list + Play + Create and Edit all at once) with a two-step flow:
  1. Initial load shows only **Player** and **Admin** buttons
  2. **Player** → shows game list + Play button (same as before)
  3. **Admin** → shows sync login overlay with superuser ID input; after successful login, navigates directly to card library
- **Files changed**: `index.html` (intro screen HTML + `selectRole()`/`resetIntroScreen()` JS functions), `css/style.css` (`.intro-role-panel` and `.intro-role-btn` styles), `js/game.js` (back navigation calls `resetIntroScreen()`), `js/sync.js` (removed `create-edit-btn` from superuser elements, added Firestore ID validation)
- **Removed `create-edit-btn`** from intro panel — Admin role button on intro screen replaces it; clicking Admin triggers the sync login overlay directly at the admin ID input step
- **`_adminLoginPending` flag**: When Admin is clicked from intro screen, sets this flag so `doAdminLogin()` navigates to card library instead of reloading the page
- **Fixed Firestore reserved ID error**: `"__player__"` was stored in localStorage from a legacy version, causing `[Sync] Error: invalid-argument Resource id "__player__" is invalid because it is reserved`. Fix: sanitize userIds starting with `__` in `syncLogin()` and auto-login, guard `_pullFromServer`/`_pushToServer` with `_isValidFirestoreId()` check
- **Back navigation reset**: All back buttons (from start screen, card library, create-edit screen) now call `resetIntroScreen()` to show the Player/Admin choice again
- **Separate admin page (`pm-studio-DrV.html`)**: Admin/superuser site now has its own standalone HTML file, deployed at `/pm-studio-DrV`
- **Fixed admin login overlay showing empty dialog**: `showSyncLoginOverlay()` was calling `showRoleChoice()` which hid the admin login form and showed an empty role-choice div. Fixed to call `showAdminLogin()` directly so the superuser ID input and Login button appear immediately.
- Key commits on branch `claude/review-project-docs-QNagl`: `a24919c`, `8d11310`, `ffe0d9d`, `1fa33a9`, `56b7823`
- Key commits on branch `claude/review-project-docs-JOOeh`: `8c85ad4` (admin login overlay fix)

### March 24 Session — Built-in Card Migration Fix
- **Problem**: Built-in cards (45 Numbers & Dots cards, ABC cards) were not appearing in Card Maker after migration
- **Root cause 1**: The built-in "numbers" set had been deleted (`deletedBuiltinSets: ["numbers"]`) and recreated as a custom set called "Numbers and Dots". Migration wrote to `customDrawnCards` (built-in key) but the custom set reads from `customDrawnCards_Numbers and Dots`
- **Root cause 2**: Migration ran synchronously on page load, but Firestore `syncLogin()` completes asynchronously and **wipes all localStorage** replacing it with cloud data — destroying migration results
- **Fix (migration v2)**:
  1. Detects `deletedBuiltinSets` and `savedCardSets` to find the correct storage key
  2. Changed from IIFE to named function `runBuiltinMigration()`
  3. Called inside every `syncLogin().then()` callback (runs AFTER Firestore restore)
  4. Uses flag `'v2'` (not `'true'`) so it re-runs over old v1 migration
  5. Merges cards from old keys, cleans up legacy keys
- **Key lesson**: Any localStorage migration must run AFTER async Firestore sync completes, not before
- Key commits: `56d966d` (v2 migration with key detection), `d3888a7` (fix timing — run after sync)

## Development Workflow Rules
- **ALWAYS validate JS syntax before committing**: Run `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"` for JS files. For inline scripts in HTML, extract and validate each `<script>` block. Broken syntax (e.g., unescaped quotes in innerHTML strings) causes silent failures that are hard to debug.
- **Test data flow end-to-end**: When saving data to localStorage, verify the key matches what the reading code expects. This project has multiple storage key patterns (`customDrawnCards` vs `customDrawnCards_<SetName>`) depending on whether a set is built-in or custom.
- **Never save empty arrays over non-empty card data**: Use `safeSaveCards()` wrapper which blocks saving `[]` when existing data has cards. This prevents accidental wipe from DOM-based saves when Card Maker isn't open.
- **Card Maker DOM is lazy**: The card set containers (`#card-set-numbers`, `#card-set-abc`, `#card-set-custom`) are only populated when the user opens them in Card Maker. Any save function that reads from DOM must check `_cardMakerBuilt` flag first.

## Current State (March 31)
- **Branch**: `claude/review-project-docs-JOOeh` (active development)
- **Backup tag**: `backup-before-catch-game-20260331` (created before Catch the Double gameplay implementation)
- **Player page** (`index.html`): Working — Player/Admin role selection on intro screen
- **Admin page** (`pm-studio-DrV.html`): Working — shows superuser ID login directly, no empty dialog
- **Card migration**: Working — 45 Numbers & Dots built-in cards + ABC cards now appear in Card Maker and sync to Firebase
- **Sync status**: Working — migration runs after Firestore restore, `migration_builtins_converted = 'v2'`
- **Card data protection**: 3 layers of safeguards against card data loss
- **Auto card backup**: Every 20 minutes to Firebase `card_backups` subcollection (last 3 kept)
- **Crop/Pan tool**: Removed (was not functional, just an alternate drag mode)
- **× slider**: Redesigned with dynamic range, clickable max selector popup (2-column), bottom-left anchor scaling
- **SVG import**: Large SVGs (>200KB) auto-rasterized to 600×600 PNG (~50-450KB instead of 3MB)
- **Game Creator**: New "+" button to add cards from any card set; card deletion updates game data; dominos auto-refresh
- **Card Maker back button**: Fixed (was missing onclick handler)

## March 28 Session Notes — Card Maker Scaling, Game Creator, SVG Import

### Card Maker Improvements
- **× slider always visible**: Works with all element types (text, stamps, circles, imported SVGs)
- **× slider redesigned**: Dynamic range with clickable max selector popup (0.5, 1, 1.5, 2, 3...10); 2-column dropdown layout; 0.02 step increments for fine control
- **Bottom-left anchor scaling**: When resizing with × slider, bottom-left corner stays fixed
- **Imported SVG hit-area**: Transparent rect added so drag works on transparent gaps
- **Drag bounds widened**: Any element with data-over-scale > 1 gets wider drag bounds (not just imported stamps)
- **Card save fix**: `_cardMakerBuilt` was not set for custom card sets; fixed so edits persist
- **Auto-generate card names**: New cards get auto-generated names (e.g., "E3") instead of prompting
- **drawSave try/catch**: Wrapped save logic so closeLoupe() always runs even if save errors

### SVG Import Improvements
- **compressSVG()**: Strips XML declarations, comments, metadata, editor attributes, reduces numeric precision, collapses whitespace
- **Auto-rasterization**: SVGs >200KB are rasterized to 600×600 PNG via canvas (3MB → ~50-450KB)
- **Auto-size sliders**: Aa=90, r=10 set on import so image fills card at ×1
- **Rasterized images**: Use 100×100 internal coords matching stamp coordinate system; `<image>` with both `href` and `xlink:href`

### Game Creator Improvements
- **Add Card button (+)**: Green "+" in Game View toolbar opens overlay to add cards from any card set
- **Card set picker**: Shows all sets (Numbers & Dots, ABC, custom sets) with renamed display names from localStorage
- **Multi-card selection**: Click cards to select (green highlight), click "Add Selected"
- **Cross-set adding**: Cards from any set can be added to any game with SVG markup stored inline
- **Cards in "Added" row**: Newly added cards appear at bottom with green border; sort into proper letter rows when game is reopened
- **Card deletion in Game View**: Now updates `savedCustomGames` localStorage (not just DOM)
- **Dominos auto-refresh**: Show Dominos rebuilds from fresh data; auto-refreshes after card add/delete
- **Large SVG guard**: Cards >500KB skipped with warning; QuotaExceededError handled with revert
- **Crop feature removed**: Was non-functional; all crop-related code deleted (~98 lines)

## March 31 Session Notes — UI Improvements & Catch the Double Infrastructure

### Card Maker UI Improvements
- **Google Fonts integration**: Replaced system fonts with Google Fonts for cross-device consistency; added `<link>` tag in `<head>`
- **Two-level font picker**: Categories panel (Sans-serif, Serif, Display, Handwriting, Monospace) → font list panel with live preview; replaces old `<select>` dropdown
- **Recent fonts**: Up to 2 recently used fonts shown above category list (excludes current font)
- **Font migration**: `migrateFontFallbacks()` IIFE updates existing localStorage card data to use Google Fonts equivalents
- **Custom color palette**: `loadCustomColors()`/`saveCustomColors()` with color picker panel using native `<input type="color">`; colors persist in localStorage

### Card Fixes
- **Empty cards selectable**: Removed 9 empty-SVG filters across selection, saving, loading, display, and gameplay code so empty cards (representing zero) can be used in Game Maker
- **Card copy in Game View**: `copyCardInRow` now updates `savedCustomGames` and regenerates domino pairs when in Game View context
- **Row assignment at game creation**: `completeGame` assigns `_gameRow` to each card based on its position

### Library Games Section
- **Subtitles**: "Find the Doubles" and "Catch the double" subtitles under Games heading
- **Indentation**: Games title 15px right, game rows 10px right
- **Game type prefixes**: All game names display with type prefix — "Find the doubles: Name" / "Catch the double: Name" — in Library, Game View, Card Maker, Start Screen, Intro Screen

### Catch the Double — Clone Infrastructure (gameplay not yet implemented)
- **New localStorage key**: `savedCatchGames` — stores cloned game definitions independently from source
- **Clone button (⤵)**: On each "Find the Doubles" game row; creates a copy under "Catch the double" section
- **Data model**: Each clone stores `name`, `sourceName` (for update tracking), independent `cards` copy, `published` flag
- **Update from source (⟳)**: Pulls latest cards from original "Find the Doubles" game, overwrites clone's cards
- **Publish/Unpublish**: Same Pub/Unpub toggle as original games; unpublished clones hidden from player-facing screens
- **Delete (✕)**: Removes clone with confirmation
- **Duplicate prevention**: Cannot clone same source game twice
- **openCatchGameView()**: Displays catch game cards in Game View (read-only for now)

### Catch the Double — Gameplay Design (next to implement)
- Static enlarged card on left side; falling cards on right side
- Start with 2 falling cards, gradually increase to max 4
- Cards fall with slight horizontal drift + ±10° tilt animation
- Speed increases as player progresses through rounds
- Scoring: points per correct catch; wrong tap → sound + "wrong" flash; after 10 points, deduct for wrong taps
- 3 misses (double falls off screen) = game over
- Same card/domino data as "Find the Doubles" game
- Key commits: `5e1654f`, `5c81f4a`, `c43aece`
