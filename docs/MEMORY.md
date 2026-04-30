# Vica Domino Project Memory
**Last Updated**: April 26, 2026

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
| `loupeZoom_v1` | Loupe zoom factor (L4) — syncs across devices via Firebase |
| `drawToolsPanelPos_v1` | Draw-tools panel drag position (L3) |
| `variationToolbarPos_v1` | Variation toolbar drag position (L3) |
| `groupEditToolbarPos_v1` | Group Edit toolbar drag position (L3 extension) |

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
- **ALWAYS update trial timestamps with EVERY deploy/push**: This is the #1 rule. Update `TRIAL HH:MM AM/PM PDT` in ALL locations across BOTH files (`index.html` and `pm-studio-DrV.html`) with every single push. Use `TZ='America/Los_Angeles' date '+%I:%M %p PDT'` to get the time. The user verifies deployments by checking the timestamp — if it's stale, they can't tell if the new code loaded. **Never skip this step.**
- **Push to 3 branches**: Every push must go to all 3 branches: `git push origin master && git push origin master:claude/general-session-yVBQq && git push origin master:claude/review-project-docs-JOOeh`
- **Dual-file architecture**: `index.html` (player) and `pm-studio-DrV.html` (admin) have SEPARATE code. Timestamp changes must be applied to BOTH. Feature changes typically only go to `pm-studio-DrV.html` unless they affect gameplay.
- **ALWAYS validate JS syntax before committing**: Run `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"` for JS files. For inline scripts in HTML, extract and validate each `<script>` block. Broken syntax (e.g., unescaped quotes in innerHTML strings) causes silent failures that are hard to debug.
- **Test data flow end-to-end**: When saving data to localStorage, verify the key matches what the reading code expects. This project has multiple storage key patterns (`customDrawnCards` vs `customDrawnCards_<SetName>`) depending on whether a set is built-in or custom.
- **Never save empty arrays over non-empty card data**: Use `safeSaveCards()` wrapper which blocks saving `[]` when existing data has cards. This prevents accidental wipe from DOM-based saves when Card Maker isn't open.
- **Card Maker DOM is lazy**: The card set containers (`#card-set-numbers`, `#card-set-abc`, `#card-set-custom`) are only populated when the user opens them in Card Maker. Any save function that reads from DOM must check `_cardMakerBuilt` flag first. When looking up card data, always fall back to localStorage if DOM is empty.

## Current State (April 16)
- **Branch**: `claude/review-project-docs-JOOeh` (active development, also `claude/general-session-yVBQq`)
- **Backup tags**: `backup-before-catch-game-20260331`, `backup-before-math-editor-20260402` (local only — remote tag push blocked by 403)
- **Player page** (`index.html`): Working — Full navigation flow GP 0 → GP F Setup/C Setup → GP Fnm Start → GP Fnm Board
- **Admin page** (`pm-studio-DrV.html`): Working — All 8+ screens have page name labels with unique IDs
- **Page name labels**: Temporary dev aid — editable, persistent via localStorage (`pageNameLabels_gp2` / `pageNameLabels_admin`)
- **Navigation**: Back-arrow returns to previous page, home button goes to GP 0. Works for both Find and Catch games.
- **Catch the Double gameplay**: Fully working — falling cards, scoring, coin/gem economy matching Find the Double
- **Catch mouse mode**: Single-player setup (no "How many players?"), heading "The Level of Difficulty:", bubble icons instead of domino icons, labels "2/3/4 bubbles"
- **Coin/gem system**: Both Find and Catch games have gold disk coins, gem conversion at 10 coins, glin-glin sound, fall animations
- **Google Fonts**: Full font list loaded in both files for cross-device card rendering (page UI fonts unchanged)
- **Card migration**: Working — 45 Numbers & Dots built-in cards + ABC cards now appear in Card Maker and sync to Firebase
- **Sync status**: Working — migration runs after Firestore restore, `migration_builtins_converted = 'v2'`
- **Card data protection**: 3 layers of safeguards against card data loss
- **Auto card backup**: Every 20 minutes to Firebase `card_backups` subcollection (last 3 kept)
- **MPP for Catch games**: Bubble-based MPP editor with circle-clipped card images; loads/saves from `savedCatchGames`
- **Rotation auto-fix**: `_stripRotationWrapper()` removes top-level `<g rotate(...)>` wrappers from card SVGs during game loading
- **Loupe rotate undoable**: `loupeTransformInPlace()` now adds to `drawHistory`; `drawUndo()` properly unwraps `<g>` wrappers
- **Next planned feature**: Math equation editor for cards (WYSIWYG toolbar approach)

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

### Catch the Double — Gameplay (implemented)
- Static enlarged card on left side; falling cards on right side
- Start with 2 falling cards, gradually increase to max 4
- Cards fall with slight horizontal drift + ±10° tilt animation
- Speed increases as player progresses through rounds
- Scoring: correct catch = 1 coin, wrong tap = lose 1 coin, 10 coins = 1 gem with glin-glin sound
- 3 misses (double falls off screen) = game over
- Same card/domino data as "Find the Doubles" game
- Key commits: `5e1654f`, `5c81f4a`, `c43aece`

## April 2 Session Notes — Navigation, Coins, Fonts

### Page Name Labels (temporary dev aid)
- **All screens labeled**: Both `index.html` (GP prefix) and `pm-studio-DrV.html` (A prefix) have editable page name labels
- **Label IDs**: Each label has a stable HTML `id` for localStorage persistence (e.g., `welcome-page-label`, `a-card-maker-label`)
- **localStorage keys**: `pageNameLabels_gp2` (game player), `pageNameLabels_admin` (admin) — separate from each other
- **Dynamic naming**: Board pages auto-generate names like "GP F21 Board" or "GP C32 Board" based on game type, domino count, player count
- **Admin dynamic labels**: Game View shows "A GC Find" or "A GC Catch" depending on game type

### Navigation Flow
- **GP 0** → **GP F Setup / GP C Setup** → **GP Fnm Start** (player names) → **GP Fnm Board** (gameplay)
- **Back button**: Returns to previous page (e.g., Board → Start, Start → Setup, Setup → GP 0)
- **Home button**: Goes directly to GP 0 from any page
- **Catch overlay navigation**: Back button saves `_pendingCatchGameIndex`, calls `_catchCleanup()`, restores pending index, shows Start screen
- **Context-aware back on game-screen**: Capture-phase listener checks if player-names visible → go to setup or intro
- **`_resetSetupPanel()`**: Restores hidden setup elements (`.setup-columns`, `.game-level-select`, `.player-select`) after back navigation

### Coin/Gem System in Catch the Double
- **Same visual system as Find the Double**: Gold disk coins (`.gold-disk`), two columns of 5, gem conversion at 10 coins
- **`_catchAddCoins(n)`**: Adds coins, triggers gem exchange at 10 coins; uses `game.active` check (not round number) for timeout staleness
- **`_catchRenderCoins()`**: Renders gold disks and gems in HUD with pop-in/fall/gem animations
- **`_catchRemoveCoin()`**: Removes 1 coin on wrong click; gem-to-coins conversion when no coins left
- **`_catchPlayGlinGlin()`**: Sound effect for gem conversion
- **`_catchGameOver()`**: Shows gems and coins visually instead of text score

### Google Fonts for Cards
- **Full font list loaded**: All Google Fonts from Card Maker's font picker loaded in both `index.html` and `pm-studio-DrV.html` via `<link>` tag
- **Purpose**: Ensures cards render correctly on all devices (iPad, etc.) regardless of installed fonts
- **Page UI unchanged**: All page elements keep Segoe UI / system fonts; Google Fonts only used by card SVG rendering
- **Lazy loading**: Google Fonts only downloads actual font files when text uses them, so minimal performance impact

### Key Technical Details
- **Catch overlay is dynamic**: Created in `openCatchPlayModal()` (~line 1057 of index.html), not a static screen
- **`_pendingCatchGameIndex` lifecycle**: Set when catch game selected, consumed (reset to -1) on launch; must be saved/restored for back navigation
- **Capture-phase event listeners**: Used for back-arrow-btn on game-screen and Start Game button intercept for catch games
- **Catch overlay z-index**: 10000 for overlay, 10001 for buttons/labels (position: fixed)

### Backup
- **Local tag**: `backup-before-math-editor-20260402` — marks state before math equation editor work
- **Restore command**: `git checkout backup-before-math-editor-20260402`
- **Remote push blocked**: Tag push returns 403 error; tag exists locally only

### Pending
- **Math equation editor**: Cards need words, math equations (+−×÷), fractions, parentheses, braces. Proposed WYSIWYG math toolbar approach. Not yet implemented.
- **Childish UI for Catch the Double**: Background/fonts for young children (mentioned but not yet addressed)
- **Remove trial timestamps**: Still present as temporary dev aids
- **Remove page name labels**: Temporary dev aids, to be removed eventually
- **Cleaning drag changes**: Fix stuck drag-over class, fix multiple cards appearing selected during drag
- **Remove diagnostic console.logs**: `[addVariation]`, `[saveCustomCards]`, `[AddCard]` lines

## April 12 Session Notes — Catch Mouse Mode, MPP Catch, Rotation Fix

### Catch Game Fixes
- **Square card flash fix**: Pre-apply circle/custom shape immediately in `openCatchPlayModal()` before the 600ms timeout, so the card never briefly shows as square
- **Page label prefixes**: Catch game labels now use GPt (touch) / GPm (mouse) prefixes instead of generic GP
- **Title**: "MathGrain Domino" → "MathGrain Games" on setup page
- **Page name label position**: Moved next to home button (`top: 20px; left: 100px`)

### Catch Mouse Mode (GP Cm Setup)
- **Single-player setup**: In mouse mode, skips "How many players?" — shows single-player icon+name+Start directly
- **No GPC21 intermediate page**: Start button goes directly to game
- **Heading**: "The Level of Difficulty:" instead of "Choose your game"
- **Bubble icons**: Level selector buttons show bubble SVGs instead of domino SVGs (2/3/4 bubbles)
- **Labels**: "2 bubbles", "3 bubbles", "4 bubbles" instead of "dominos"
- **Game options row preserved**: Only the "How many players?" h3 is hidden, not the entire options row
- **`_resetSetupPanel()`**: Restores original labels ("dominos") and original domino SVGs when leaving mouse mode
- **`_bubbleSVGs`**: Inline SVG objects with circle/triangle/star keys for each level

### MPP for Catch Games
- **`openMppForCurrentView()`**: Wrapper that detects Find vs Catch using `_getCurrentViewGame()`, sets `mppGameType`
- **`mppGameType`**: Module-level variable — 'find' or 'catch'
- **Bubble-based editor**: One large bubble + 2/3/4 smaller bubbles per level, with circle-clipped card images
- **`_bubblePos`**: Module-level object with circle/triangle/star keys defining bubble positions and radii
- **`applyMppConfigToClone()`**: Catch branch renders card images inside circles with white background, clip-path, and border
- **Storage**: Catch MPP config loads/saves from `savedCatchGames[].mppConfig` instead of `savedCustomGames`
- **Hint text**: "Click a bubble, then click a card" for catch mode

### AGC Scroll Fix
- **`#game-view-content`**: `display: flex; flex-direction: column; overflow: hidden;` — titles stay fixed
- **`#game-view-cards`**: `flex: 1; overflow-y: auto; min-height: 0;` — only cards scroll
- **CSS cache busting**: Version bumped to `style.css?v=agc-scroll-cards-1`

### Rotation Bug Fix ("28" rotated 90°)
- **Root cause**: Card SVG data can contain top-level `<g transform="rotate(...)">` wrappers from the variation toolbar or loupe rotate tool. These rotations get baked into `svgMarkup` and cannot be undone.
- **Auto-strip**: Added `_stripRotationWrapper(svg)` helper to both files — detects single top-level `<g>` with pure rotation transform and unwraps it. Applied in `getGameCardSVG()` and `getGameCardSVGWithFallback()`. Only strips rotations, not reflections or other transforms.
- **Undoable loupe rotate**: `loupeTransformInPlace()` now adds `<g>` wrapper to `drawHistory` with `data-loupeTransform` marker. `drawUndo()` detects these markers and unwraps children instead of just deleting.
- **Removed stale variation loading**: Player page `startCustomGame()` no longer loads `cardMakerVariations` from localStorage (admin page migrated away from this system; stale data could add unwanted rotated versions to SVG pools).

### Key Technical Details
- **Dual-file architecture**: `index.html` (player) and `pm-studio-DrV.html` (admin) have SEPARATE copies of Catch game code; changes must be applied to BOTH
- **`_getCurrentViewGame()`**: Returns `{game, games, type, index}` abstracting Find vs Catch game access
- **`_catchGame` state**: Runtime game state including `inputMode`, `gameCardShape`, `gameCardCornerR`, `gameCardScale`
- **`_catchInputMode`**: Global variable 'touch' or 'mouse'
- **`_showSetupLabel()`** in game.js: Now checks `_pendingCatchGameIndex` and `_catchInputMode` to set correct GPt/GPm label
- **`createVariationSVG()`**: Wraps SVG children in `<g transform="..." data-variation-transform="1">` — the `data-variation-transform` attribute marks variation-created wrappers

## April 15 Session Notes — Card Identity Architecture (stableId)

### Card Data Architecture Redesign
- **Goal**: Move from fragile label+uid system to stable IDs with bidirectional game references
- **stableId format**: `timestamp_setName_label_randomSuffix` (e.g., `1776225831421_Multiplyby4_I8_zsw5`)
- **Migration strategy**: Additive — new fields added alongside old ones, nothing removed, rollback possible at any time

### Step 1: stableId Generation for New Cards (DONE)
- `generateStableId(label, cardSet)` and `getCurrentCardSetName()` added (~line 2258)
- Applied to all card creation paths: `addCopyCard()`, `addNewDrawnCard()`, `addVariation()`, `copyCardInRow()`
- All 4 serialization blocks in `saveCustomCards()` include stableId/origin fields
- `dataset.origin` tracks creation method: 'copy', 'draw', 'var'

### Step 2: Migrate Existing Cards (DONE)
- Migration code in `buildNumbersCardSet()`, `buildCustomCardSet()`, `buildAbcCardSet()`
- Generates stableId on first load, saves migrated data back to localStorage
- Only runs when Card Maker editor is opened (build functions trigger on "Edit" click)

### Step 3: Link Game Cards to stableId Source (DONE)
- `buildGameViewCard()` copies stableId from Card Maker DOM or localStorage to game card data
- `_findStableIdFromStorage()` 3-pass matching: (1) UID across ALL sets, (2) SVG content match, (3) label match with cardSet preference
- `_migrateAllGameStableIds()` runs after each build function via debounced `_scheduleGameStableIdMigration()`
- Game Maker card selection and `confirmAddCards()` now include stableId

### Firebase Backup Fix
- Card backup was exceeding Firestore's 1MB document limit (all SVG data in one doc)
- Fixed: `_pushCardBackup()` now splits JSON into ~800KB chunks (same as main sync)
- `syncRestoreCardBackup()` handles both old single-doc and new chunked formats
- Old backup cleanup properly deletes chunk subcollections

### Step 4: Reverse Lookup — stableId to Games (DONE)
- `findGamesUsingCard(stableId, label, svgMarkup)` — scans Find and Catch games
- Returns `[{name, type, index}]` with matching priority: stableId > SVG content > label

### Step 5: Delete-with-Games-Check Dialog (DONE)
- `confirmDeleteCard()` checks `findGamesUsingCard()` before deleting
- `_showDeleteCardDialog()` shows overlay with game list and action buttons
- `_removeCardFromAllGames(stableId)` filters out cards from all Find and Catch games

### Step 6: Safe Haven Card Set (DONE)
- `_ensureSafeHavenExists()` — auto-creates "Safe Haven" set in savedCardSets if missing
- `_moveCardToSafeHaven(card)` — serializes card DOM data, adds to `customDrawnCards_Safe Haven`, removes from current set
- `_isInSafeHaven()` — checks if active card set is Safe Haven
- Delete dialog changes:
  - Card NOT in games, NOT in Safe Haven → "Move to Safe Haven" (green) / "Delete permanently" (red) / "Cancel"
  - Card IN games, NOT in Safe Haven → "Move to Safe Haven" (green) / "Delete from Card Maker and all games" (red) / "Cancel"
  - Card IN games, IN Safe Haven → "Delete from Safe Haven and all games" (red) / "Cancel"
  - Card NOT in games, IN Safe Haven → simple confirm to permanently delete
- Safe Haven in Library: shield icon, green text, no delete/move/rename buttons, rendered first in unfiled list
- `deleteCardSet()` and `renameCardSet()` block Safe Haven from being deleted or renamed
- Cards keep their stableId when moved to Safe Haven, so game references remain valid
- `movedFrom` field tracks original card set name
- **Move button** (green ↷, bottom-right): Replaces "Restore" button — lets user move card from Safe Haven to any card set
- `_showRestoreCardDialog(card)` — dialog lists all card sets; original set highlighted in green with "(original)" label
- `_restoreCardToSet(card, targetSetName)` — direct localStorage writes (bypasses DOM save chain to prevent data overwrites)
- `_nextBottomRowLabel(storageKey)` — assigns unused bottom-row label to avoid collisions when moving cards
- **Bugfix**: `_moveCardToSafeHaven` no longer calls `deleteCard()` (which removed card from games); uses direct DOM removal instead
- **Bugfix**: `_restoreCardToSet` bypasses `saveVariations()` → `saveCustomCards()` chain which was overwriting the target set's localStorage

### Step 7: stableId-First Lookup (DONE)
- `_findCardDataByStableId(stableId)` — searches ALL card storage keys for matching stableId
- `buildGameViewCard()` rewritten with 3-tier pipeline:
  1. PRIMARY: `_findCardDataByStableId(cardInfo.stableId)` → build from `storedCard.svgContent`
  2. MIGRATION: DOM lookup by label/uid → get stableId → retry; or `_findStableIdFromStorage()` → retry
  3. LAST RESORT: `buildCardFromMarkup(cardInfo)` using stored svgMarkup snapshot
- `getGameCardSVGWithFallback()` updated similarly: stableId lookup → DOM → svgMarkup

### Step 8: Stop Storing svgMarkup Snapshots (DONE)
- **WRITE side** — 3 locations conditionally skip svgMarkup when stableId present:
  - Game Maker card selection (~line 4647): `if (!info.stableId && cardSvgEl) info.svgMarkup = ...`
  - Game Maker re-selection (~line 7031): same conditional
  - `confirmAddCards()` (~line 7674): `if (!hasStableId) cardEntry.svgMarkup = markup`
- **READ side** — all rendering paths updated for stableId-first:
  - SVG pools builder: uses `getGameCardSVGWithFallback()` (stableId → DOM → svgMarkup)
  - `_catchBuildCardSVG()`: stableId lookup added before svgMarkup/DOM fallback
  - `syncAllCardsToGames()`: skips svgMarkup writes for stableId cards (regular + catch games)
  - `syncABCCardsToGame()`: skips svgMarkup writes for stableId cards
  - `migrateAllGameSvgMarkup()`: proactively deletes old svgMarkup from stableId cards on page load (regular + catch)
- **Result**: Game data is significantly smaller in localStorage; games always show latest card artwork via live stableId lookup

### Key Functions Added
- `generateStableId(label, cardSet)` — creates stable ID for new cards
- `getCurrentCardSetName()` — returns proper set name for active card set
- `_findStableIdFromStorage(label, uid, cardSet, svgMarkup)` — 3-pass lookup from localStorage
- `_getAllCardStorageKeys()` — collects all card storage keys
- `_migrateAllGameStableIds()` — migration for all game cards (called after build functions)
- `_scheduleGameStableIdMigration()` — debounced 3s wrapper to avoid Firebase rate limiting
- `findGamesUsingCard(stableId, label, svgMarkup)` — reverse lookup: card → games
- `_removeCardFromAllGames(stableId)` — remove card from all games by stableId
- `_ensureSafeHavenExists()` — auto-create Safe Haven card set
- `_moveCardToSafeHaven(card)` — move card from current set to Safe Haven
- `_isInSafeHaven()` — check if current set is Safe Haven
- `_showSimpleDeleteDialog(card, labelText)` — delete dialog for cards not in games
- `_showDeleteCardDialog(card, labelText, stableId, gamesUsing)` — delete dialog for cards in games
- `_findCardDataByStableId(stableId)` — searches ALL card storage keys for matching stableId (Step 7)
- `_showRestoreCardDialog(card)` — dialog to move card from Safe Haven to any card set
- `_restoreCardToSet(card, targetSetName)` — move card between sets via direct localStorage writes
- `_nextBottomRowLabel(storageKey)` — find unused bottom-row label for moved cards

## April 17 Session Notes — Text-Marker Labels, Word Import, Row Letters

### Text-Marker Auto-Relabeling (DONE)
- Cards auto-relabeled on Card Maker exit based on actual DOM position + text content
- Format: `A2_5+3` (row letter + position number + underscore + text from SVG `<text>` elements)
- `_extractTextMarker(card)` — extracts text from SVG, replaces ÷→/, ×→x, √→sqrt, truncates at 20 chars
- `_relabelAllCards()` — batch relabels all cards, runs in `leaveCardMaker()` and `saveAndLeaveCardMaker()`
- `_isAutoLabel(label)` — detects auto-generated labels (pattern `^[A-Z]\d+(_.*)?$`) vs user-named
- `_updateGameLabelsAfterRelabel(relabelPlan)` — updates game card labels via stableId match (Find + Catch games)
- User-named cards prompt before auto-renaming
- Row naming plan: A-Z, then a-z (52 rows max; more than enough)

### Import from Word (.docx) — Stage 1 (DONE)
- Blue "W" button in Card Maker toolbar opens file picker for .docx upload
- Uses JSZip CDN to unzip .docx, parses `word/document.xml` for table data
- `_handleDocxImport(input)` — reads .docx, extracts XML, triggers preview
- `_parseDocxTableXml(xmlStr)` — parses Word XML, extracts table rows/cells as plain text
- `_extractCellText(cell)` — extracts text from `<w:r>` / `<w:t>` elements
- `_showImportPreview(tableData)` — preview dialog: shows rows found, card count, card texts
- `_buildImportCardSVG(text)` — creates SVG with auto-sized centered text (font size adjusts by text length)
- `_createCardsFromImport(rowSummaries)` — batch-creates cards via `addNewDrawnCard()`
- **Table format**: First column = row letter (A, B, C...), other columns = card text. Empty cells skipped.
- Cards append to end of existing rows; new rows created as needed

### Import from Word — Remaining Stages (planned)
- **Stage 2**: Parse Word equation editor (OMML) for fractions — render as SVG with numerator, bar, denominator
- **Stage 3**: Extended math — square roots (`<m:rad>`), parentheses (`<m:d>`), superscripts/subscripts (`<m:sup>`, `<m:sub>`)

### Persistent Row Letter Labels (DONE)
- Row letters (A, B, C...) now always visible in Card Maker as small gold text at left edge of each row
- CSS `::before` pseudo-element on `[data-row-letter]`, no JS needed
- Empty rows retain larger letter styling
- Visible in both normal and compact view

## April 18 Session Notes — Group Edit Mode

### Group Edit Mode (DONE)
- Purple "GE" button in Card Maker toolbar enters Group Edit mode
- Click cards to select (blue highlight), right-click (desktop) or long-press (mobile) to set reference card (gold highlight + star)
- Floating toolbar at bottom with 5 independent actions:
  1. **Center** — centers text horizontally (`x=30`, `text-anchor=middle`), no reference needed
  2. **Aa Size** — copies `font-size` from reference card's text to all selected
  3. **Bottom** — aligns text baseline (`y` attribute) to match reference card
  4. **F Font** — copies `font-family`, `font-weight`, `font-size`, `font-style` from reference
  5. **Color** — copies `fill` attribute from reference card's text to all selected
- Select Row and Select All convenience buttons
- Actions are independent: apply any combination in any order
- Green flash toast confirms each action
- Mode blocks other modes (Game Maker, Shape Mode) and vice versa
- Auto-exits when leaving Card Maker
- Help popup updated with GE description
- **Erase Group**: Deletes selected cards; cards used in games are protected with warning listing game names
- **Reference card interaction**: Right-click (desktop) or double-tap (mobile) sets reference card
- Button label: "Gr" (changed from "GE")

### Desktop-First Studio Proposals (APPROVED — implementation status below)
User selected these items from the organized checklist. All items below are approved.

**COMPLETED:**
- **U1**: Global undo/redo system — snapshot-based, captures all card-related localStorage keys before each save. Ctrl+Z / Ctrl+Shift+Z wired globally. Loupe draw redo via `drawRedoStack`. Swap-in-place entries work for both undo and redo.
- **K1**: Esc exits mode — priority: context menu → overlay → loupe → Group Edit → Shape Mode → passive selection.
- **K2**: Delete/Backspace deletes selected cards — works with both Group Edit and passive (shift-click) selection. Game-usage protection preserved.
- **K3**: Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo — global + loupe draw level. Redo stacks cleared on new mutations.
- **K4**: Cmd/Ctrl+C/V copy/paste — in-memory `_cardClipboard` array. Paste is batch-undoable (single Ctrl+Z undoes entire paste).
- **K5**: Cmd/Ctrl+A select all — enters Group Edit if not active, then selects all visible cards.
- **K6**: Arrow key nudging in loupe — 1 grid cell per press, Shift+arrow = 10 grid cells. Coalesced undo (500ms pause = new undo step). Guarded against text-input focus and open inline text editor.
- **S1**: Shift+click multi-select — passive selection outside Group Edit. Reuses `groupEditSelected[]` and `.ge-selected` CSS class. K2/K4/K5 work on passive selection.
- **S2**: Right-click context menu — Normal mode: Edit in Loupe, Copy, Delete, Move to… (row submenu), Set as Reference, Properties dialog. Group Edit mode: Set as Reference, Select All, Copy/Delete Selected, Exit Group Edit. Esc/click-away/scroll closes.
- **S3**: Drag-and-drop files from OS — drop SVG or raster image files onto Card Maker. SVGs compressed + parsed; rasters embedded as data-URL `<image>` in 60x60 SVG wrapper. Drop zone overlay during dragover. Multi-file batch-undoable.
- **L1**: Denser toolbars for desktop — `@media (min-width:1025px)` block in `css/style.css` reduces padding/gap/button-size for `.zoom-btn`, `.draw-tool-btn`, `.var-tool-btn`, `.zoom-panel`, `.variation-toolbar`, etc. Mobile/tablet untouched.
- **L4 (Option B)**: Resizable loupe — right edge / bottom edge / SE-corner drag handles resize `#loupe-card-container`. Min 200px, max fills viewport (minus 60px toolbar). Double-click any handle snaps back to default size + zoom=1 via `_loupeResetSize()`. Drawing coords already use `getBoundingClientRect()`, so no `loupeCoords()` update needed. Handles live in `#loupe-overlay` (NOT inside the container — container has `overflow:hidden`+`border-radius:50%` for circle cards which would clip them); positions tracked via `ResizeObserver` and repositioned on window resize. Faint gold tint (`rgba(196,164,90,0.18)`) makes them discoverable; brightens to `0.55` on hover. Hidden on coarse-pointer devices via `@media (hover:none) and (pointer:coarse)`.
  - **Handle semantics** (H=1 unit always per user spec):
    - **Bottom edge / SE corner** = proportional **zoom**. Container w and h scale together via single `_loupeZoom` factor. Persisted via `localStorage.loupeZoom_v1`. Double-click clears.
    - **Right edge** = **shape change** (modifies the card's W:H aspect ratio). Live updates `currentCardWidth`; converts `currentCardShape` to `'rect'` if it wasn't already. NOT persisted via localStorage — commits via existing `drawSave()` → `_saveCardShapeToCard()` flow on Save. Closing without save discards (next open reads stored shape via `_loadCardShapeFromCard`).
  - Key helpers: `_ensureLoupeResizeHandles()`, `_attachLoupeResizeHandles()`, `_positionLoupeResizeHandles()`, `_computeLoupeDefaultSize()`, `_loupeResetSize()`, `_wireLoupeResizeHandle()`, `_applyLoupeZoom()`, `_load/_save/_clearLoupeZoom()`.
- **Loupe `++` button removed**: Double-click on any card is the sole way to open the Card Editor (loupe + draw mode). Removed `#loupe-mode-btn` HTML; `toggleLoupeMode()` reduced to an inert shim; `loupeMode` var kept as `false` stub so any stale `if (loupeMode)` branches never fire. Replaced button in `#zoom-panel` with a placeholder `zoom-panel-btn`. Known issue: if you drag to a non-square aspect ratio on square/circle cards, the card SVG letterboxes (grid only covers the SVG, not the beige bands). Fix deferred pending decision on aspect-ratio lock.

**NOT YET STARTED:**
- **L2**: Multi-column card display in Card Maker (toggle between row view and grid view)
- **L3**: Dockable/collapsible panels (loupe, tools — floating panels with drag handles)
- **C1**: Remove mobile-only touch handlers from Studio page

### Implementation Phases (final plan)
**Phase 1 — Foundation ✅ DONE**
- **U1**: ✅ Global undo/redo system — snapshot-based with swap-in-place entries.
- **C1**: Not yet started (lower priority cleanup).

**Phase 2 — Keyboard Shortcuts ✅ DONE**
- **K1–K5**: ✅ All implemented. Batch undo for Group Edit delete + paste.
- **K6**: ✅ Arrow key nudging in loupe — 1 grid cell / Shift = 10 grid cells. Coalesced undo. Guarded against text-input focus.

**Phase 3 — Selection & Input ✅ DONE**
- **S1**: ✅ Shift+click multi-select (passive selection outside Group Edit).
- **S2**: ✅ Right-click context menus with Properties dialog.
- **S3**: ✅ Drag-and-drop files from OS (SVGs + rasters).

**Phase 4 — Layout (L1 + L3 + L4 done; L2 deferred)**
- **L1**: ✅ Desktop-denser toolbars via `@media (min-width:1025px)` in `css/style.css`.
- **L4**: ✅ Resizable loupe (right edge, bottom edge, SE corner). Double-click a handle resets to default size.
- **L2**: Deferred — toggle was implemented then reverted (commit `395f7ed`) because with typical per-letter card counts (3-5 cards) row view and grid view looked identical. Revisit if card sets grow large enough to need wrapping.
- **L3**: ✅ Draggable floating panels (draw-tools panel + variation toolbar). 3-dot grip handles at the top of each panel; click-drag to move; double-click to reset to CSS default. Positions persist in `localStorage.drawToolsPanelPos_v1` and `localStorage.variationToolbarPos_v1`. `_syncLoupeOverlayPadding` only reserves right-side padding when the draw-tools panel is docked in the right 40% of the viewport, so dragging it left expands the loupe card. Generic helper `_wirePanelDrag(panel, handle, key)` shared by both panels. Light-theme CSS variant `.panel-drag-handle-light` for the cream-colored variation toolbar.

**C1 (cleanup): ✅ done.** Audit showed no `touchstart/touchmove/touchend` handlers exist in the Studio page — all input is handled via Pointer Events. The actual scope turned out to be desktop-ifying mobile-oriented UX language: 4 UI strings ("tap" → "click", "double-tap" → "right-click") in the Group Edit tooltip, title bar, selection counter, and help popup, plus one code comment. Double-click-to-set-reference handler in Group Edit kept intentionally as a redundant fallback (S2 right-click context menu is the primary gesture). `touch-action: none`, `@media (hover:none) and (pointer:coarse)`, and responsive `@media (max-width: …)` CSS blocks all kept for graceful degradation on touch-capable screens.

## April 19–20 Session — Post-Phase-4 UX Polish

Phase 4 shipped; this session focused on Group Edit refinements, removing
the now-redundant Shape Mode, clickable row letters, duplicate-name
handling for games, and assorted visual cleanup. Current HEAD: `1fbb84c`.

### Group Edit: new 'Shape' action (commit `7f8d59c`)
New 7th button `▢ Shape` between Color and Erase. Copies the reference
card's `cardShape` + `cardShapeW` + `cardShapeH` + `cardCornerR` to every
other selected card. Uses existing `_applyShapeToPreview` +
`saveVariations` pipeline, so thumbnails, Library preview, and game
renders all update through the normal flow. Undo supplied by
`saveVariations()`'s snapshot. Key func: `geActionShape()`.

### Group Edit toolbar redesign (commits `2d96288`, `e8da3d9`, `3cf6000`)
- Reshaped from ~450-px wide bottom-centered bar → 144-px wide, left-docked
  floating box. Default position is computed to sit directly **below the
  Gr button** in the left tool strip (via `_positionGEToolbarBelowGrButton`)
  but respects a user-saved drag position if one exists.
- Action buttons are **icon-only** (`↔ Aa ▂ F ● ▢`) with native tooltip
  labels on hover. CSS grid 2×3 layout; Erase gets its own full-width row;
  nav row (All, Exit) at the bottom.
- Draggable via shared L3 helper: 3-dot grip at the top, position stored
  in `localStorage.groupEditToolbarPos_v1`. Double-click the grip resets
  to the default (under-Gr-button) position.
- Visual polish: action buttons + nav buttons switched to **white**
  borders and text; Erase kept red; Gr button text in the left strip
  changed from purple to white for consistency.

### Clickable row letters + GM Select All/Clear (commit `83a3318`)
- Row letters (A, B, C…) were CSS `::before` pseudo-elements, which can't
  receive mouse events. Replaced with real `<span class="library-row-letter">`
  elements via new helper `_addRowLetterSpan(row)`, called at all four
  `row.dataset.rowLetter = letter` sites (Numbers, ABC, custom, drag-
  and-drop row creation). Legacy `::before` neutralised to
  `content: ''; display: none` so stale rows don't double-render.
- Body classes `.game-maker-active` / `.group-edit-active` toggled via
  new `_syncModeBodyClasses()` helper on every GM/GE transition. CSS
  shows hover affordance (gold tint + pointer cursor) for row letters
  only when one of these modes is active.
- Click a row letter: toggles selection of every card in that row. If any
  card unselected → select all; if all selected → deselect all.
- New shared selection helpers: `_gmAddCard`, `_gmRemoveCard`,
  `_gmSelectAllVisible`, `_gmClearAllVisible`, `_geAddCard`,
  `_geRemoveCard`.
- Game Maker bar gains two buttons: **Select All** (every visible card
  in the active set) and **Clear**.
- Group Edit toolbar's `Row…` prompt button removed — row-letter click is
  the faster replacement.

### Shape Mode removed (commit `62115c5`)
The ⬡ Shape Mode button (left A-CM tool strip) and its `#shape-mode-popup`
are gone — Group Edit's Shape action covers the workflow. Inert stubs
(`enterShapeMode`, `cancelShapeMode`, `shapeModeSelectAll`,
`applyBatchShape`, `applyBatchRectWidth`, `applyBatchCornerRadius`) remain
so existing guards like `if (shapeModeActive) return;` and escape-key
handlers keep compiling. `shapeModeActive` stays `false` forever. Help
popup entry removed.

### Duplicate game-name handling — Option 3 (commit `c121de4`)
When creating a new game or renaming one, if the name collides with
another game in the **same list** (Find and Catch are independent
namespaces), a re-prompt appears with an auto-suffixed suggestion
pre-filled:

> "A game named "Match 0-4" already exists.  
> Save as: `Match 0-4 (2)`"

User can hit OK (accept), edit the name and OK (re-validated), or Cancel.
- Comparison is **case-insensitive** and whitespace-trimmed.
- Suffix starts at `(2)` because the original is implicitly `(1)`.
- Names already ending `" (N)"` have the root extracted so
  `Match (2) (2)` doesn't happen.
- Renaming a game to its own current name is a no-op (self excluded via
  `currentIndex`).
- Wired at three sites: `+ New Game` prompt, Find rename, Catch rename.
- Helpers: `_resolveGameNameCollision`, `_autoSuffixGameName`.

### Misc visual tweaks
- Slider labels in Card Editor: **Aa → Size, r → fine, × → Scale**.
  Also made the three `.draw-size-row` sliders dim to ~28 % opacity and
  non-interactive whenever no element on the card is selected, via new
  `_updateDrawSizeActivation()` helper called at every selection change
  (commit in earlier session, re-noted here for continuity).
- Help "?" button moved to `right: 94px` and switched to `position: fixed`
  so it lines up horizontally with the "Saved" pill and "Vica" user badge
  (earlier commits `1aff11e`, `2e6cbbf`).
- Corner-radius button icon swapped from an ellipse to an L-shaped
  bracket (earlier commit `175a3fb`).
- **W** (Word import) button recoloured from blue (`#64B5F6`) to green
  (`#7eff7e`) so it visually groups with the `+` New Card button (commit
  `1fbb84c`).

### New localStorage keys this session
| Key | Purpose |
|-----|---------|
| `groupEditToolbarPos_v1` | Saved drag position for the Group Edit toolbar |

(`drawToolsPanelPos_v1`, `variationToolbarPos_v1`, `loupeZoom_v1` were
already documented in Phase 4.)

### Recommended next steps
With Phase 4 done and this polish round complete, candidates to scope next:
- **L2 revisit** if card sets grow enough to benefit from grid wrapping.
- **Math equation editor** — mentioned in April 2 pending list; biggest
  remaining feature idea.
- **Retire Shape Mode stubs** — safe to delete once we've verified nothing
  calls them for a while.
- Any new UX tweaks the user surfaces.

### Key technical details for continuity
- **Trial timestamps**: Must update ALL 5 locations (2 in index.html lines ~32/58, 3 in pm-studio-DrV.html lines ~116/134/368) with every push. Use `TZ='America/Los_Angeles' date '+%I:%M %p PDT'`.
- **3-branch push**: Every push goes to `claude/general-session-yVBQq`, `master`, and `claude/review-project-docs-JOOeh`.
- **Undo system**: Snapshot-based (`_undoPushSnapshot()` before mutations). Batch operations use `_undoSuspended = true` to collapse multiple mutations into one undo step.
- **S2 context menu**: Functions `_ctxShow()`, `_ctxClose()`, `_ctxItem()` at ~line 5010 of pm-studio-DrV.html.
- **S3 drag-drop**: IIFE at ~line 5210 of pm-studio-DrV.html. Async file reads with completion counter for batch undo.
- **L1 desktop density**: `@media (min-width:1025px)` block at end of css/style.css (~line 5812+).
- **Loupe functions**: `openLoupe()` at line ~1404, `_isLoupeOpen()` at line ~7121, `drawKeyHandler` at ~line 4000.
- **Card creation**: `addNewDrawnCard(svgEl, cardName)` at ~line 4707. Always uses viewBox `0 0 60 60`.

## April 22–23 Session — Game Settings (Phase A.1 + A.2)

The admin gets a per-game configuration matrix that drives what the
player sees on the setup screens. Cogwheel ⚙ in Game View opens the
modal. Touch / Mouse tabs are independent.

### Phase A.1 — admin-side modal (commits `37e4fae` → `5ec898d`)
- Cogwheel button on Find / Catch Game View.
- Modal with **Touch** and **Mouse** tabs, each holding three axes:
  **Player Options** (1P+timer / 2P / 2P+timer), **Level** (Find only —
  Catch hides this), **Type of Game** (Type 1 / 2 / 3 placeholder).
- Per axis: editable axis label + per-option checkbox + editable label.
- **Timer** field at the top (Find default 20s, Catch default 6s).
- **⎘ Touch → Mouse** button: deep-copies the touch matrix into mouse.
- **⎘ From another game…** picker: clones settings from another
  same-type game.
- **Save** persists `game.setup = { timer, touch, mouse }` onto the game
  record (Find: `findGames`, Catch: `catchGames`).
- **Bug fixed mid-session (`5ec98d`)**: cogwheel click ran but modal was
  invisible — modal was inside a clipped/hidden parent. Fix: relocate the
  overlay to `<body>` level on first show.
- Key functions in `pm-studio-DrV.html` ~line 9250+:
  `_defaultGameSetup`, `_getGameSetup`, `_saveGameSetupToCurrent`,
  `openGameSettingsModal`, `_gsRenderTab`, `_gsCaptureForm`,
  `_gsCopyTouchToMouse`, `_gsOpenCopyFromGame`, `saveGameSettings`.

### Phase A.2 — player-side runtime consumer (commit `3858b5c`)
The player setup screens (GP F Setup / GPt Ct Setup / GPm Cm Setup) now
read `game.setup[currentInputMode]` on game launch and:
- hide deactivated `.player-btn` rows (`display:none`).
- hide deactivated `.level-btn-wrapper` rows (Find only).
- substitute admin-custom labels on player buttons + `.level-label` spans.
- replace the h3 headers ("How many players?", "Choose your game:") with
  the admin's axis labels (defaults match the original strings).
- stash timer on `window._currentGameSetupTimer` for gameplay code (Phase
  A.3 to consume).

Input-mode detection:
- **Catch** → `_catchInputMode` (`'touch'` or `'mouse'`, set by the popup
  on GP 0).
- **Find** → `_hasTouchScreen` (true on iPad, false on Mac/desktop).

Hook sites in `index.html`:
- `// Phase A.2: apply admin's matrix for this catch game` (~line 990)
- `// Phase A.2: apply admin's matrix for this find game` (~line 1152)
- `_resetSetupPanel` (~line 869) — restores original labels + show-all
  on game switch so customizations don't leak between games.

## April 25 Session — Game Settings: lockedOff removed (commit `6303149`)

Yesterday's Phase A.1/A.2 had a hard-coded restriction: in Mouse mode the
2-player rows were locked off (gray, disabled, "(N/A in mouse mode)"
note). User feedback: **the admin decides what's possible, not the
system.** A 2-player turn-taking game can work fine with a mouse. If a
specific game-set genuinely can't support 2P, that should surface as a
creation-time warning (separate, future task).

Changes in `pm-studio-DrV.html`:
- `_defaultGameSetup`: `mouse.players` now uses the same `mkAxis()`
  helper as `touch.players`. All three options on by default.
- Option-row builder (`_gsRenderTab`): dropped the `.locked-off` class,
  the `cb.disabled` flip, and the "(N/A in mouse mode)" note. Every
  option is now editable.
- `_gsCopyTouchToMouse`: plain deep-copy of touch → mouse (no
  flag-preservation pass).
- `_getGameSetup`: strips any legacy `lockedOff:true` from stored saves
  on load — games saved between Apr 23 and Apr 25 self-heal on next open.

CSS: dropped the dead `.gs-option-row.locked-off` and `.gs-locked-note`
rules from `css/style.css`.

## April 25 Session (cont.) — Uniform 3-axis console + UC badges + dynamic options (commit `4e1ab3d`)

The Game Settings modal is now identical for Find and Catch: three axes
(**Player Options**, **Level**, **Type of Game**) plus the timer.

### `_defaultGameSetup` changes (`pm-studio-DrV.html` ~line 9250)
- `mkAxis(labels, axisName, defaultOn)` — new third param. Default `true`.
- **Level axis always present for both game types.** Catch defaults all
  Level options to `on: false` so visible player behavior is identical to
  before (Phase A.2 hides any axis with all-unchecked options).
- **Type of Game axis defaults all-off** for both game types (no player
  picker exists yet; nothing would happen if they were on).
- Touch and Mouse blocks are now symmetric — same three axes each.

### Dynamic option count
- Per-axis **+ Add option** button appended to `.gs-options` container.
  Adds a new option `{ id: 'opt<n+1>', label: 'Option <n+1>', on: false }`
  and re-renders.
- Per-row **✕** remove button. Disabled when only one option remains
  (min-1 enforced). Form values are captured first so in-progress edits
  on other rows aren't lost on re-render.
- Helpers: `_gsAddOption(axis)`, `_gsRemoveOption(axis, idx)`.

### "🚧 Under construction" badges
- Helper `_gsIsAxisUC(gameType, axis)` returns true when:
  - `axis === 'types'` (both game types — no player picker)
  - `axis === 'levels' && gameType === 'catch'` (no Catch level UI)
- Timer field gets a permanent UC badge until Phase A.3 wires it to
  gameplay. Static HTML span `#gs-timer-uc-badge` is always shown by
  `_gsRenderForm`.
- CSS: `.gs-uc-badge` — small orange pill with tooltip "Admin can edit
  this, but no runtime/player code uses it yet."

### Player-side constraint (important to remember)
- `index.html` hardcodes **3 `.level-btn-wrapper` rows** (line 79, 104,
  138) for Find, each tied to a specific `data-level` enum
  (`circle` / `triangle` / `star`) consumed by gameplay code. Adding a
  4th Level option in the admin matrix **saves fine** (localStorage has
  no row count limit) but **does not render a 4th button** on the player
  side. The UC badge on "Level (Catch)" and "Type (both)" covers
  axis-wide cosmetic behaviour; per-option "beyond-N" warnings on the
  Find-Level axis are a future refinement if the discrepancy becomes
  confusing.

### Modal template HTML changes
- `gs-timer-row` gained `<span class="gs-uc-badge" id="gs-timer-uc-badge">`.
- Axis section templates unchanged — `.gs-options` container gets the
  add-button appended dynamically by `_gsRenderForm`.

### CSS additions (`css/style.css` ~line 2593)
- `.gs-axis-label-row` became flex so the badge sits next to the axis
  label input.
- New: `.gs-uc-badge`, `.gs-add-option-btn`, `.gs-remove-option-btn`
  (with `:disabled` and `:hover:not(:disabled)` states).

### Phase A.3 — NOT YET DONE (DEFERRED, UC badge stays)
Per April 26 user direction: "timer is a very long and hard issue.
Put the symbol 'under construction' on timer and lets move to the next
item." — A.3 is parked. Timer field permanently shows the 🚧 badge until
revisited.
- When eventually picked back up: wire `window._currentGameSetupTimer`
  into actual gameplay:
  - **Find / Xeno timer**: hardcoded 20s in `js/game.js` should read the
    admin override (3 sites: lines 135, 1260, 3419).
  - **Catch fall-duration**: hardcoded 6s should read the admin override.
- Decide what to do when admin's timer is 0 / blank (treat as "use
  hardcoded default"?).

## April 26 Session — Apply to… (commit `3224e4a`)

A new **"Apply to…"** button in the Game Settings modal footer opens a
picker overlay that propagates the current matrix to other games.

### Two independent selectors
**What to apply** (4 checkboxes, all-checked by default — Granularity A
per user choice):
- ☑ Timer value
- ☑ Player Options axis (Touch + Mouse together)
- ☑ Level axis (Touch + Mouse together)
- ☑ Type of Game axis (Touch + Mouse together)

**Where to apply** (5 radios):
- ⦿ This game only (default — same effect as Save)
- ◯ All Find games
- ◯ All Catch games
- ◯ All games (Find + Catch)
- ◯ Pick specific games… → reveals a scrollable
  `[Find] / [Catch]`-prefixed checklist of every game

### Implementation (`pm-studio-DrV.html`)
- New helpers: `_gsOpenApplyTo`, `_gsCloseApplyTo`,
  `_gsApplyScopeChanged`, `_gsResolveTargets`, `_gsApplyToConfirm`.
- `_gsCaptureForm()` runs on Open and again on Confirm so any
  in-progress edits in the main modal are included.
- Apply button label updates live: "Apply" for ≤1 target,
  "Apply to N games" otherwise. Bulk applies (≥2 targets) get a
  `confirm()` dialog before write.
- Per-target write only touches checked sections; unchecked sections
  stay untouched in target games.
- Find writes go through `localStorage.setItem('savedCustomGames', …)`;
  Catch writes go through `saveCatchGames(…)`. Loads buffer once, write
  once per type.
- New overlay HTML `#gs-apply-overlay` with `z-index: 20100` so it
  stacks above the main `#game-settings-overlay`.
- New CSS: `.gs-btn-apply-to`, `.gs-apply-overlay`, `.gs-apply-section`,
  `.gs-apply-h`, `.gs-apply-check`, `.gs-apply-radio`,
  `.gs-apply-game-list`, `.gs-apply-game-row`.

## April 26 Session (cont.) — Prefix labels + current-game marker (commit `d7a895d`)

### Prefix labels for Levels and Type
Levels and Type-of-Game rows now render a **non-editable "Level N" /
"Type N" prefix** to the LEFT of the editable text box. Prefix is
computed live from row index — auto-renumbers when rows are
added/removed. Player Options stays free-form (no prefix).

Visual: `☑  [Level N]   [editable suffix]   ✕`

### Storage = suffix only
Stored labels are SUFFIX-ONLY for prefix-bearing axes. Migration regex in
`_getGameSetup`:
```
/^(Level|Type)\s+\d+\s*[—–-]\s*(.+)$/i
```
Strips prefix iff there's a separator + content after.
- `"Level 1 — 2 dominos"` → `"2 dominos"` ✓
- `"Type 1"` → no match, stays `"Type 1"` ✓
- `"Easy"` → no match, stays `"Easy"` ✓ (legacy Catch labels preserved)

Helper `_gsStripStoredPrefix(label)` does the strip; called inside the
schema-repair loop (alongside the lockedOff strip).

### Default suffix for fresh games
- Find-Level: `"2 dominos"`, `"3 dominos"`, `"4 dominos"`
- **Catch-Level: empty `""`** (per user spec — "I prefer start from
  numerical levels since there can be more than 3 levels of difficulty.
  but I can change to the words at any moment"). Old `"Easy/Medium/Hard"`
  hardcoded defaults dropped.
- Type: `"Type 1"`, `"Type 2"`, `"Type 3"` (matches prefix per user spec
  — visual reads `Type 1 [Type 1]` until renamed).

### Default suffix for "+ Add option" rows
- Find-Level / Catch-Level: empty
- Type: `"Type N"` matching prefix
- Player Options: `"Option N"` (legacy free-form)
Logic in `_gsAddOption(axis)`.

### Render helper
`_gsOptionPrefix(axis, idx)`:
- `'levels'` → `"Level " + (idx + 1)`
- `'types'`  → `"Type "  + (idx + 1)`
- else        → `""` (no prefix span rendered)

### Apply-to picker: current-game marker
The current game now appears in the "Pick specific games…" list with:
- `(current)` suffix on the name
- Faint gold tint (`.gs-apply-game-row-current`)
- Pre-checked checkbox

Admin can uncheck to "apply to others, leave this one alone" — but the
default scope still includes the current game, matching the other
"Where to apply" scopes.

### No player-side change needed
`index.html` `.level-label` spans already display the suffix only
(`"2 dominos"`, etc.). Phase A.2's label-substitution code in
`index.html` reads `axisData.options[i].label` directly, which is now
the suffix — exactly what the player should see.

### Future / deferred (open spec questions)
Each of these, when shipped, removes a UC badge from the Game Settings
modal:
- **Phase A.3 — timer wiring** → removes Timer UC badge. See above.
- **Dynamic player-side level rendering** (Find) — generate
  `.level-btn-wrapper` rows from the matrix instead of hardcoding 3 →
  admin's 4th+ Level option actually renders. Gameplay needs to define
  card counts for whatever levels are added.
- **Catch-Level player UI** — build a level picker into the Catch setup
  flow → removes Catch-Level UC badge.
- **Type of Game player picker** — build a picker into player setup that
  reads `game.setup[mode].types.options` → removes Type-of-Game UC badge
  for both game types. Need a spec on what "Type 1" / "Type 2" actually
  change in gameplay.
- **Creation-time warning** when a new game-set genuinely can't support
  2P, so the admin sees the constraint at creation rather than running
  into it after editing the matrix.

## April 26 Session (cont.) — Game-view edits: delete + copy + Cmd+Z (commits `384f106` … `a29e089`)

Parallel session in a different chat. Started on a fresh
`claude/fix-card-deletion-bug-ElUcy` branch (now deleted) before
switching to the standard 3-branch flow. **Lesson**: read
`docs/MEMORY.md` *first thing* on every session — this session burned
hours pushing fixes only to `claude/review-project-docs-JOOeh` because
the 3-branch rule wasn't read until the user pointed it out.

### Bugs fixed

- **Card deletion in game view didn't persist visually**.
  `_removeCardFromThisGame` (the × button handler in game view) called
  `openCustomGameView(...)` — a function that doesn't exist. The
  `ReferenceError` aborted the post-save re-render after
  `savedCustomGames` had already been written, so the card stayed on
  screen even though it was gone in storage. **Fix**: rename the call
  to `openGameView` (the actual function — the catch branch right
  above already used the correct `openCatchGameView` name).

- **Copy in Catch view created a square tile and was not persisted**.
  `copyCardInRow`'s "in Game View" persistence block was gated on
  `currentGameViewIndex >= 0`, which is only set for Find games. In
  Catch view (`currentCatchGameViewIndex >= 0`,
  `currentGameViewIndex === -1`) the entire block was skipped — the
  copy lived in DOM only and didn't get the game-level shape. Worse,
  any later × delete in the Catch view re-rendered from
  `savedCatchGames`, which still had only the original, so all unsaved
  copies vanished and looked like deletion bugs. **Fix**: replace the
  Find-only check with parallel Find/Catch handling that loads the
  right store, splices the new `cardInfo` (carrying `stableId`,
  `uid`, and shape attributes), and saves through
  `localStorage.setItem('savedCustomGames', …)` or `saveCatchGames(…)`
  as appropriate.

- **Deleting one of two same-labeled copies removed both**. The ×
  handler's filter fell back to `c.label === labelText` matching when
  `cardEl.dataset.stableId` was empty. The clicked tile had no
  `stableId` because `buildCardFromMarkup` wasn't writing
  `cardInfo.stableId` / `cardInfo.uid` onto the rendered tile's
  dataset, and `_buildGameViewCardInner` wasn't passing `stableId`
  into `freshInfo`. **Fix**: persist `stableId` / `uid` to dataset in
  `buildCardFromMarkup`; carry `stableId` through all three
  `_buildGameViewCardInner` lookup paths.

- **New copy looked square inside a row of round/rect tiles**. Game
  shape is applied per-render via a container sweep in
  `applyGameShapeOverride` — a freshly-inserted DOM tile is missed
  until the next view rebuild. Calling the sweep right after copy was
  associated with destructive-side-effect reports earlier in the
  session, so we apply the same shape math (border-radius, preview
  width/height, SVG viewBox/transform) to **just the new tile** rather
  than sweeping every card. Wrapped in try/catch so a styling error
  never blocks the copy.

### Cmd+Z (Mac) / Ctrl+Z scope expanded into game-view

The desktop-only undo/redo system (`_undoStack`, `_undoPushSnapshot`,
`globalUndo`) already snapshotted `savedCustomGames` and
`savedCatchGames` in its key list, but no Find/Catch game-view
mutation pushed a snapshot before saving — so undo covered Card Maker
work but did nothing for game-view edits.

- `_undoPushSnapshot(force)`: added a `force` flag that bypasses the
  `_cardMakerBuilt` guard. Card Maker callers keep `force=undefined`
  (existing behaviour); game-view callers pass `force=true` since they
  may run before Card Maker is ever built.
- `_saveCurrentViewGames(info)`: pushes a snapshot at the top, so
  `deleteCard`'s game-view branch, `saveMCardGroups`, and
  `applyGameShape` all get an undo entry for free.
- `_removeCardFromThisGame`: pushes a snapshot inside the on-confirm
  callback (this helper writes to localStorage directly — bypassing
  `_saveCurrentViewGames`).
- `copyCardInRow` game-view block: pushes a snapshot before splicing
  the new card.
- `_undoApplySnapshot`: now calls `_reopenCurrentView()` if
  `#game-view-screen` is visible so a restored snapshot becomes
  visible immediately (was rebuilding Card Maker DOM only — undo
  silently restored data but the view never re-rendered).

Result: in game view, deleting a card → Cmd+Z brings it back; copying
a card → Cmd+Z removes the copy. Find and Catch both supported.

### GP (player) fixes

- **GP showed math-expression dominos for "Match 0-4"**. Root cause:
  GP rendered cards from `cardInfo.svgMarkup` (the snapshot baked into
  `game.cards` at add-time), while Studio re-resolves SVG content from
  card-set storage by `stableId` on every render. Editing a card in
  Card Maker after it's been added to a game updated card-set storage
  but not the `game.cards` snapshot, so Studio showed the new content
  and GP showed the stale math expressions.
  **Fix**: ported the `stableId` resolver into GP. New helpers
  `_gpAllCardStorageKeys()`, `_gpResolveBySid(stableId)`,
  `_gpInvalidateCardCache()`. `getGameCardSVG` prefers the freshest
  `svgContent` by stableId before falling back to `cardInfo.svgMarkup`.
  Cache is invalidated at the top of each `startCustomGame`.

- **GP domino count and pairings differed from Studio**. Studio's
  `rebuildGameViewDominos` runs cards through `buildEffectiveCards`
  which collapses `mGroups` (Match-style groups) into one effective
  slot per group. GP's `startCustomGame` paired every distinct card
  label, generating many more dominos with the wrong pairings.
  **Fix**: mirror Studio's grouping in GP — build effective groups via
  `mGroups`, iterate pairs of groups, pool every group member's SVG
  so `randomPick` rotates variants per render. Pass group
  representatives (not raw `origCards`) into `updateLevelDominoIcons`.

- **GP intro buttons could load the wrong game** if Studio mutated the
  list while GP stayed open (closures captured a stale array index).
  **Fix**: `populateIntroGames()` is now re-run when the home button
  is clicked, so the next click resolves the right game.

### Process (the `docs/MEMORY.md` rules I missed early)

- **3-branch push**: every push must hit `master`,
  `claude/general-session-yVBQq`, and `claude/review-project-docs-JOOeh`.
  Pages deploys from JOOeh. Caught the violation mid-session and
  merged the parallel session's `4c92a63` (MEMORY.md April 26 update)
  before pushing all three to a common tip.
- **Trial timestamp** in **both** `index.html` and `pm-studio-DrV.html`
  must be bumped on every push. The user verifies which build is
  loaded by reading the stamp.

### Recovery / undo gaps still open

- `_undoStack` is in-memory only — page refresh wipes history. User
  affected during an unrelated bad-state earlier in the session;
  cloud-backup restore was offered, only 4 backups available, all
  post-corruption. Deferred items (user said "discuss later"):
  - **(c)** Persist `_undoStack` to localStorage so Cmd+Z survives a
    refresh.
  - **(d)** Extend the cloud backup writer (`_pushCardBackup`) to
    include `savedCustomGames` and `savedCatchGames` so a future
    catch-game corruption is recoverable from cloud (today's
    "Restore Cards from Cloud" only covers `customDrawnCards_*`).

### Known game-view mutations still NOT undoable

These older code paths bypass both `_saveCurrentViewGames` and
`_removeCardFromThisGame`, so they don't snapshot:
- `confirmAddCards` (the + overlay that adds cards from a card set)
- Game rename / description edit
- Drag-reorder via `saveGameViewOrder`
- Combine games / clone-to-catch / delete entire game / copy game
- Direct `localStorage.setItem('savedCustomGames', …)` callers (~22)
- Direct `saveCatchGames(…)` callers (~10)

Audit-and-wire pass deferred. Easiest path is probably to add the
snapshot push to `saveCatchGames` itself and to a wrapper around
`localStorage.setItem('savedCustomGames', …)`, then delete it from the
two places I already added it (`_saveCurrentViewGames`,
`_removeCardFromThisGame`).

## April 26 Session (cont.) — Non-stop type-of-game

Wires the Type axis into the player runtime for Find games. Slow-pace
(current behaviour) keeps the manual Play Again click. Non-stop plays
the existing celebration / lost feedback, then the Play Again button
counts down 3 → 2 → 1 in place and auto-triggers `playAgain()`.
Tapping the button at any point during the countdown (including over
the celebration) skips ahead immediately; idle for 60 s leaves the
user on the end-game screen so the game doesn't run unattended.

### Per-Type `behavior` field (admin)
- `_defaultGameSetup` now seeds every Type option with
  `behavior: 'manual'` via a new `mkTypesAxis` helper.
- `_getGameSetup` schema-repairs older saves: any Type option whose
  `behavior` isn't exactly `'nonstop'` is forced back to `'manual'`.
- `_gsRenderForm` adds a small `<select class="gs-option-behavior">`
  ("manual" / "non-stop") next to each Type row's text input. New CSS
  in `.gs-option-row select.gs-option-behavior` keeps it inline.
- `_gsCaptureForm` reads the dropdown back into the option.
- `_gsAddOption` seeds new Type rows with `behavior: 'manual'`.

### Player-side picker (Find only)
- New `#setup-types-row` block in `index.html`'s start-screen, hidden
  until the active game has 2+ enabled Type options. Header label
  comes from `axisData.axisLabel`.
- `_renderTypesPicker(gameType, conf)` (called by
  `_applyGameSetupToPlayerScreen`) builds one `<button.setup-type-btn>`
  per enabled option, label = `"Type N — " + suffix`. Default
  selection: first enabled option.
- The selected option's behavior is stashed on
  `window._currentTypeBehavior` ('manual' or 'nonstop') and the label
  on `window._currentTypeLabel`. game.js reads the behavior on
  end-of-round; the label is reserved for future Type-specific
  gameplay variants.
- Catch is excluded — no Type axis runtime support there yet.

### Non-stop end-of-round in `js/game.js`
- `showEndGameButtons` keeps the Play Again button as before, but
  when `window._currentTypeBehavior === 'nonstop'` (and we're not in
  a combined-game stage transition or final celebration) it calls
  `_startNonstopCountdown(playAgainBtn)`.
- `_startNonstopCountdown(btn)` replaces the button text with `⏵ N`
  and ticks down once per second from 3 to 0. Adds capture-phase
  pointer/key/touch listeners to track activity, plus a
  `visibilitychange` listener that pauses the timer when the tab is
  hidden and resumes (with a fresh idle stamp) when shown again.
- After the count reaches 0, `playAgain()` fires. Idle for 60 s
  cancels the countdown and leaves the screen as in manual mode.
- Tapping the button is a deliberate skip-ahead: the click handler
  calls `_stopNonstopCountdown()` then `playAgain()`. This means a
  tap during the celebration / lost sound does start the next round
  early, by design (engaged players want pace).
- `_stopNonstopCountdown()` is called from `playAgain` and
  `resetToSetup` so the countdown can never outlive its context.
- New CSS `.end-game-btn.nonstop-countdown` adds a 1 s `nonstop-tick`
  pulse animation so the count visibly ticks.

### Identifier choice — explicit `behavior` field, not label substring
We considered matching `/non[-\s]?stop/i` against the editable suffix.
Rejected — admin spelling and translation can break it. The dropdown
makes the choice explicit and survives renames.

### Catch end-of-round wiring (added later same session)
The Type picker is also rendered for Catch, but in a different slot
than for Find. On the Catch setup screen (GP Cm / Ct Setup), the
existing right-column "Choose domino style" panel is hidden when the
active Catch game has 1+ Type options, replaced with
"Choose the game type:" plus a vertical list of `.setup-type-line`
radio rows. The user clicks a row to flip
`window._currentTypeBehavior` (and `_currentTypeLabel`).

`_renderTypesPicker` initially branched by `gameType` (Find = top-of-
panel button picker; Catch = right-column radio list). Per a later
user request, it was unified — **both Find and Catch now use the
right-column radio list.** The legacy `#setup-types-row` at the top
of the panel is left in the DOM but always hidden (harmless; kept so
nothing referencing it breaks). The right-column header reads
"Choose the game type:" and the four domino-style SVGs are hidden
whenever the active game has 1+ enabled Type options. Games with
zero Type options keep the original "Choose domino style" SVG panel.

`_catchGameOver` (in BOTH `index.html` and `pm-studio-DrV.html`,
since admin can also test Catch from Studio) now hijacks the Play
Again button into the same 3-second countdown when
`_currentTypeBehavior === 'nonstop'`. Helpers
`_startCatchNonstopCountdown` / `_stopCatchNonstopCountdown` mirror
game.js's pattern: capture-phase activity listeners,
`visibilitychange` pause/resume, 60 s idle cancel, tap-to-skip-ahead.
Cleanup also fires from the Exit button.

New CSS `.catch-gameover-btn.nonstop-countdown` reuses the
`nonstop-tick` keyframes defined for the Find button.

### Type axis is mode-agnostic — `_gsCaptureForm` mirrors edits
Game Settings keeps separate per-mode (`touch` / `mouse`)
configurations of the Players, Levels, and Types axes. That made
sense for Players ("1 player + timer" might apply only to one input
mode) and Levels (Catch has no levels), but **Type of Game is
device-independent** ("Slow Pace" reads the same on touch and
mouse). The original implementation captured form values into the
visible tab only — an admin who edited the touch tab and tested in
a desktop browser saved enabled Types into `setup.touch` while the
player read `setup.mouse` (still default-all-off), so the player-side
Type picker silently showed nothing.

`_gsCaptureForm` now mirrors the captured types axis to the OTHER
mode immediately after capture (`JSON.parse(JSON.stringify(conf.types))`).
Players and Levels keep per-mode edits.

### `_gsIsAxisUC` no longer reports types as UC
Now that the player picker exists for Find + Catch and the runtime
honors the behavior choice, the "🚧 Under construction" badge for
the Type axis section is removed. `_gsIsAxisUC` only flags
`levels` for `catch` (Catch has no level UI) and nothing else.

### Temporary on-screen probe (still live)
A small yellow box pinned to the top-left of GP Setup prints
`gameType / mode / types.options / enabled` so the user can verify
which mode the player reads and how many enabled Types reached the
picker. Tap to dismiss. To remove once the picker is verified
working in the user's environment.

### Open follow-ups
- Type label (`window._currentTypeLabel`) currently has no gameplay
  consequence. Once the runtime defines what "Type 2" actually
  changes (e.g., "Voiced Answer"), swap the manual/nonstop dropdown
  for a richer behavior config or a separate per-Type ruleset.
- The countdown shows the Play Again button doing the counting. If
  the celebration overlay covers the button, tapping the overlay
  doesn't currently skip ahead — only tapping the button does. If
  this is a problem in practice, hoist the click to the overlay too.
- Remove the temporary yellow GP-Setup probe once the picker
  rendering is verified working.

## April 26 Session (cont.) — Voice input v1 (Find, 1-player, EN/ES/RU)

Wires Web Speech API recognition to "Find the Doubles" so a 1-player
round can be answered by voice ("the first" / "second" / "third" /
"fourth") in addition to clicks. Decoupled audio-source layer so
2-player can plug in later (separate mics, push-to-talk, or speaker
fingerprint) without touching the routing.

### Per-Type `voiceInput` + `voiceLang` (admin)
- `_defaultGameSetup`'s `mkTypesAxis` seeds each option with
  `voiceInput: false`, `voiceLang: 'en'` alongside the existing
  `behavior` field.
- `_getGameSetup` schema-repairs both fields (older saves get
  `voiceInput: false`, `voiceLang: 'en'`).
- Game Settings option-row UI gains a 🎤 checkbox + EN/ES/RU language
  dropdown next to the manual/non-stop dropdown. The lang select is
  disabled when the checkbox is off (visual quietness for the common
  case). New CSS `.gs-option-voice` and `.gs-option-voice-lang`.
- Voice is a separate dimension from behavior, per user direction —
  any combination is allowed (manual + voice, non-stop + voice).

### `js/voice.js` — stand-alone `VoiceInput` module
- Wraps `SpeechRecognition` / `webkitSpeechRecognition`.
- Continuous + interim results, with auto-restart on `onend` because
  Safari kills the recognizer after each utterance even with
  `continuous: true`.
- Phrase parser: normalize transcript (lowercase, strip articles
  the / el / la / los / las, strip punctuation), tokenize, match
  against per-language synonym tables. Includes common mishears
  (e.g., "forth" for "fourth").
- `LANG_CODES`: `en-US` / `es-ES` / `ru-RU`. Region is best-effort —
  Mac Safari speaking es-MX still hits the es-ES recognizer well.
- 700 ms cooldown per fired phrase so the recognizer's chain of
  partials doesn't double-fire.
- `onerror` handles `not-allowed` / `service-not-allowed` (permission
  denied) by clearing `_wantOn` so we don't retry-loop.
- API: `new VoiceInput({ language, maxPosition, onPhrase, onError,
  onListeningChange })`, `.start()`, `.stop()`, `.setLanguage()`,
  `.setMaxPosition()`, `VoiceInput.isSupported()`. Loaded by both
  `index.html` and `pm-studio-DrV.html` before `game.js`.

### Player picker stash + game.js round lifecycle
- `_renderTypesPicker` now stashes `window._currentVoiceInput` and
  `window._currentVoiceLang` alongside `_currentTypeBehavior` /
  `_currentTypeLabel`. Each setup-type-line shows a 🎤 suffix when
  the option has voice on.
- `Game.startSunLevelGame()` calls `_startVoiceForRound()` after
  layout is ready: skips if `!_currentVoiceInput`, skips for 2+
  player matches (1-player only for v1), shows the unsupported
  notice if `VoiceInput.isSupported()` returns false, otherwise
  creates / re-tunes the recognizer and starts.
- `_onVoicePhrase` ignores phrases unless `gamePhase === 'sunLevel'`
  (so celebrations and lost-sounds don't trigger fire), then routes
  the position into the same `handleSunLevelCardClick(card,
  playerIndex, cardIndex)` a click would call.
- `Game.startPlayAreaDim()` and `Game.resetToSetup()` both call
  `_stopVoice()` so the recognizer isn't running during the win/loss
  feedback or after a quit.

### UI
- `#voice-mic-indicator` corner badge (top-right): 🎤 plus the last
  heard transcript. CSS classes `idle` / `listening` / `error`. The
  `listening` state pulses red via `voice-mic-pulse` keyframes —
  echoes the browser's own tab-record indicator.
- `_showLastHeard(raw)` shows the transcript that fired the position
  for ~2 seconds, then clears.
- `.voice-notice` toast: shown once per session if the browser
  doesn't support Web Speech API, or if the user denies the mic
  permission. Tap to dismiss; auto-removes after 6 s.
- The Type-line in the right-column picker gets a 🎤 suffix so the
  player can tell which Type uses voice before they pick.

### Open follow-ups (voice)
- 2-player. Three viable paths documented in the explanation above
  this session (separate mics / push-to-talk per player / speaker
  fingerprint with a wasm model). v1 design keeps voice routing in
  `_onVoicePhrase` decoupled from speaker identity, so the audio
  source layer is the only thing that changes when 2P ships.
- Combined-game multi-stage: voice should keep working across stage
  transitions; not yet verified.
- Push-to-talk variant: not built. Always-listening per the user's
  direction.
- Browser caveats: Firefox doesn't support Web Speech API at all;
  Safari occasionally drops `continuous` (handled by auto-restart);
  Chrome/Edge are the smooth path.

### Voice v1.1 — per-Type editable synonym tables (commit pending)

Per-game-type editor on top of v1. Each voice-enabled Type option now
carries a `voiceSynonyms` field; admin sees a 3-column EN/ES/RU table
inline under the option row in Game Settings and can add or remove
phrases per position. The matcher honours single-word and multi-word
entries.

**Why per-Type, not per-game**: a single game can offer multiple
teaching modes — e.g., Type 3 = ordinals only ("first / the first"),
Type 4 = cardinals for younger kids ("one"), Type 5 = both. Per-game
would force cloning the whole game three times.

### voice.js extensions
- `_normalizeKeep(s)` added alongside `_normalize(s)`. Strip variant
  removes articles `the / el / la / los / las`; keep variant doesn't.
- `_matchPosition` now takes `(text, table, maxPosition)` — table is
  the active language's `{1:[...], 2:[...], 3:[...], 4:[...]}` lifted
  from `_activeTable()`.
- Per-position match: walks 1→maxPosition, first match wins. For each
  entry: if it contains a space, **substring match** against the
  article-keeping normalised transcript (so "the first" entry
  matches "the first one"). If single-word, **token match** against
  the article-stripped tokens (so "first" entry matches "the first
  one"). Empty entries are ignored.
- New `VoiceInput.prototype.setSynonyms(s)` — runtime override, no
  recognizer restart needed.
- Constructor now accepts `opts.synonyms`. Stored as `this.synonyms`,
  used by `_activeTable()`. Falls back to internal `SYNONYMS` if
  missing or empty for the active language.
- `VoiceInput.DEFAULT_SYNONYMS` exposed as a deep clone — the editor
  reads it for "Reset" and for the initial seed of fresh editor
  panels.

### Game Settings — inline per-Type editor (pm-studio-DrV.html)
- New `voiceSynonyms` field per Type option. Stored shape:
  `{ en: { 1:[…], 2:[…], 3:[…], 4:[…] }, es: {…}, ru: {…} }`.
- `null`/missing means "use defaults at runtime". Once admin opens
  the editor and saves, it becomes a concrete object (the editor
  seeds it with current defaults on first open). After that, defaults
  no longer apply — admin's authority is total. Empty position list
  = no voice trigger for that position (the user's pedagogical
  example: "the answer is never first; the kid must say second/
  third/fourth").
- Schema repair only normalises type: leaves `null` alone, coerces
  non-object values to `null`. Existing `voiceSynonyms` objects
  pass through untouched.
- `_gsAddOption` seeds new Type rows with `voiceSynonyms: null`.
- New `✎ words` button in the option row, next to the EN/ES/RU
  language select. Disabled when `voiceInput` is off (the
  checkbox-change handler now also closes any open editor).
- `_gsBuildVoiceEditor(idx, optionRef, defaults)` builds the inline
  panel: 3 flex columns (English / Español / Русский), each with a
  "↺" reset-to-defaults-for-this-language button and 4 rows (1st /
  2nd / 3rd / 4th) of comma-separated text inputs. Live `oninput`
  writes to the option's `voiceSynonyms`; `_gsCaptureForm` re-reads
  open editors on save as a defensive guard.
- New CSS in `css/style.css` for `.gs-voice-editor`, `.gs-voice-cols`,
  `.gs-voice-col`, `.gs-voice-row`, `.gs-voice-reset-lang-btn`,
  `.gs-voice-hint`, plus the `.gs-voice-edit-btn` row button.

### Player picker → game.js wiring
- `_renderTypesPicker` now stashes `window._currentVoiceSynonyms`
  alongside the existing language / behavior / label. Set to the
  active option's `voiceSynonyms` (object) or `null` (defaults).
- `Game._startVoiceForRound()` passes `synonyms:
  window._currentVoiceSynonyms` to `new VoiceInput(...)`. Re-tunes
  the existing `_voice` instance via `setSynonyms()` on subsequent
  rounds — no recognizer restart needed.

### Rollback recipe (revised)
v1 stable baseline is still commit `3f2d799`. The editor work is
strictly additive on top — same revert recipe applies:

```sh
git revert --no-commit 3f2d799..HEAD
git commit -m "Revert per-Type voice editor; restore v1 baseline"
git push origin master
git push origin master:claude/general-session-yVBQq
git push origin master:claude/review-project-docs-JOOeh
```

`option.voiceSynonyms` is unread by v1's matcher, so games saved
while the editor was active still load fine after a revert.

### Voice v1.1 + lifecycle-race fix — current stable point

**Stable target as of 07:55 PM PDT today**: commit `8bd44b8` (`Voice:
stale-recognizer guards so round 2+ doesn't go silent`). User
confirmed voice works across rounds in actual gameplay. Builds on
top of voice v1.1 (per-Type editor, `97ade1f`), v1 (`3f2d799`), and
the mic-check diagnostic panel (`a709fa3`, `97ade1f`).

Key reliability tricks now live in `js/voice.js`:
- Every event handler in `_make()` bails via `_isCurrent()` if it
  fires after the recognizer has been replaced. Without this,
  round-1's onend was overriding round-2's listening state and
  trying to auto-restart a dead recognizer alongside the new one.
- `start()` always recreates the recognizer (rather than reusing
  one across rounds). Predictable lifecycle regardless of which
  order Chrome fires onend/onstart in.
- `setLanguage` no-ops when language unchanged.

### Voice polish (commits `347dbaf`, `25deffd`)

- **Yellow setup probe removed** (`347dbaf`). The on-screen
  diagnostic that printed `Setup: gameType=… mode=… types.options=…
  enabled=…` in the corner of GP setup was no longer needed once
  the per-mode mirror-on-save was in place.
- **`continuous: false`** (`25deffd`). With `continuous: true`,
  Chrome occasionally batched two pause-separated utterances into
  one delayed transcript ("first first" instead of two "first"s),
  making the first attempt feel unresponsive. With `continuous:
  false`, each utterance is its own short session that ends ~0.5 s
  after the user stops; `onend`'s 80 ms auto-restart spins up a
  fresh session — de-facto continuous listening, no batching.
- **Mic indicator only during voice rounds** (`25deffd`).
  `_startVoiceForRound`'s early-return path now stops any prior
  voice instance and removes the indicator div before bailing, so
  non-voice rounds start with a clean screen. The unsupported-
  browser notice fires only when voice was wanted (1-player +
  voiceInput=true) but the browser doesn't support
  SpeechRecognition.
- **"Test mic" button visibility tracks the selected type**
  (`25deffd`). `_renderTypesPicker` builds one button per render
  and exposes a `_refreshTestMicVisibility()` helper that each
  setup-type-line click calls after `_stashTypeChoice`. Pick a
  voice type → button appears. Pick a non-voice type → button
  hides.

### Mishears workflow (no code, just process)

Chrome's English speech recognizer occasionally misheards "first"
or "one" in user-specific ways (heard as "fast", "thirst", "won",
"juan", etc.). The corner mic indicator's `hearing: <text>` line
shows what Chrome actually transcribed. Workflow when a user wants
to extend recognition:

1. Play a round, watch what `hearing: …` shows when a word fails
   to match (it'll have a `?` prefix and the heard transcript).
2. Open Studio → Game Settings → that voice Type → `✎ words`.
3. Add the mishear to the appropriate position's comma-separated
   list (e.g., position 1: `first, the first, fast, thirst`).
4. Save the game.

Defaults in `js/voice.js` are intentionally conservative — extending
them globally risks false positives across all voices. Per-Type
editor lets each game tune to its actual users.

### Mic-check panel: synonym table display (commit `16e59fc`)

Added a "Words this game listens for (Lang)" section to
`VoiceInput.openMicCheck()`. Reads `window._currentVoiceSynonyms` /
`_currentVoiceLang` and shows position 1-4 lists as little code
chips, with a "custom (from Game Settings)" / "default (no per-Type
override)" annotation. Diagnoses whether an admin's per-Type editor
edit actually reached the player runtime — when a user added
"whatever" to position 1 but voice didn't fire, this section
showed they hadn't clicked the parent Game Settings dialog's main
Save button (the inline editor's writes only persist when the
parent saves).

### Voice indicator leak fixes (commits `1ba4a45`, `50723e5`,
`aac8c73`, `ca08a4c`)

Series of fixes addressing "the listening indicator stays visible
after returning from a voice round". Issue ran through several
layers:

- **`1ba4a45`** — added `Game._cleanupVoiceUI()` helper and wired it
  into `_goHome` and the `back-to-intro-btn` click handler. Also
  added it to the catch-overlay home button in `index.html`. Stops
  any active recognizer, removes the indicator div, closes any
  open mic-check panel.
- **`50723e5`** — belt-and-suspenders: `_renderTypesPicker` now
  calls `_cleanupVoiceUI()` at the top so any path that lands on
  the setup screen gets a clean slate, regardless of how the
  navigation happened.
- **`aac8c73`** — CSS-level safety net. The indicator's visibility
  is now gated on `body.voice-round-active`. Default
  `display: none`; `body.voice-round-active .voice-mic-indicator`
  flips to `display: grid`. `_ensureMicIndicator` adds the class,
  `_stopVoice` and `_cleanupVoiceUI` remove it. So even if some
  path leaves the indicator div in the DOM, CSS keeps it invisible
  until a real voice round explicitly turns the class back on.
  `_cleanupVoiceUI` also switched to a `querySelectorAll` sweep
  in case orphaned elements lost their id.
- **`ca08a4c`** — final fix: each `.setup-type-line` click handler
  now calls a new free helper `_killVoiceUI()` (defined in the
  same inline script as `_renderTypesPicker`, doesn't depend on
  `window.game` being instantiated). Removes body class, sweeps
  indicator divs, closes diagnostic panel, calls game-side
  cleanup if available. So tapping any type immediately wipes the
  indicator — the user-visible "I picked Type 1, indicator should
  go away" expectation works.

**Current voice-stable point: commit `ca08a4c`** (user verified
"yes, it works now"). Builds on top of `8bd44b8` (lifecycle race),
`97ade1f` (mic-check panel), `3f2d799` (voice v1 baseline).

## Pause / Resume v1 — kid-friendly mid-round freeze

**Use case**: kids 6-8 playing Find the Doubles need to suddenly step
away (bathroom, distraction) without losing their place or progress.
The kid taps Pause → game freezes mid-round → kid comes back → taps
the overlay → game resumes from exactly where it was.

**Available for ALL game types** (slow-pace, non-stop, voiced) —
not gated on the non-stop type. The kid-safety rationale applies to
every type since every type runs the Xeno timer.

### What "freeze everything" means

- **Xeno timer**: stopped at pause, remaining seconds saved, restarted
  from the saved value on resume. (`Game._pauseGame` reads the visible
  timer-display value as the freshest source of truth.)
- **Voice recognizer**: stopped at pause; restarted on resume if it
  was on. `_pausedVoiceWasOn` remembers the prior state.
- **CSS animations under #game-screen**: paused via
  `body.game-paused { animation-play-state: paused }`.
- **Click / touch handlers**: `handleSunLevelCardClick` and
  `_onVoicePhrase` both early-return when `this._isPaused`. So sibling
  pokes at the screen do nothing while paused.
- **Input is strictly blocked** (per user direction): the overlay
  sits at `z-index: 13500` and consumes taps; the only thing that
  resumes is a tap on the overlay itself.

### What we don't pause (v1 simplifications)

- **Web Audio fire-and-forget oscillator sounds** (the lost wah-wah
  ~0.3 s, the celebration jingle ~1 s). Each is created with its own
  `AudioContext` and started/stopped at known offsets — pausing them
  mid-flight would mean tracking every active context. They're short
  enough to play out before the kid is back.
- **The 10 s sun-level dim animation** between win and end-game-buttons.
  Already a brief locked-in cinematic; pause is unavailable during
  this window (`_canPause()` returns false unless `gamePhase === 'sunLevel'`).
- **Persistence across page reloads** — paused state is in-memory only.
  Future: when player names + scores are persisted, save paused-state
  to localStorage and offer a "Resume your paused game?" prompt on
  page load. Tracked as a deferred upgrade.

### UI

- **Pause button** (top-right corner, 40 × 40 round button with white
  ⏸ icon). Visible only when `body.game-round-running` is set —
  toggled on by `startSunLevelTimer`, off by `stopSunLevelTimer` /
  `startPlayAreaDim` / `resetToSetup` / `_cleanupVoiceUI` /
  `_pauseGame`. Defined in both `index.html` and `pm-studio-DrV.html`
  (admin can also test rounds in Studio).
- **Pause overlay** (full-screen translucent dark, blurred backdrop,
  centered card with ▶ icon, "Game paused", "Tap anywhere to
  continue"). Tap anywhere on the overlay calls `_resumeGame()`.

### Lifecycle notes

- **Tab hidden mid-round** auto-pauses (visibilitychange listener in
  the Game constructor). On return, **stays paused** — kid must
  explicitly tap to resume.
- **End of round** (correct answer or timer hits 0) — `startPlayAreaDim`
  clears pause state (round is over, pause is meaningless).
- **Home / back-to-intro** during a paused round — `_cleanupVoiceUI`
  also clears pause state. Pause is round-scoped and dies with the
  round.
- **Non-stop countdown** (between-round 3 → 2 → 1) is NOT pause-able
  in v1. The countdown has its own visibility-pause and idle-cancel
  built in. If you need to pause between rounds, just don't tap the
  countdown — it stops at idle for 60 s.

### Files touched

- `index.html` + `pm-studio-DrV.html`: pause button inside
  `#game-screen`, pause overlay before `</body>`.
- `css/style.css`: `.game-pause-btn` + `.game-pause-overlay` /
  `.game-pause-card` / `body.game-paused` / `body.game-round-running`
  rules.
- `js/game.js`: constructor wires the pause button click and
  visibilitychange listener; `Game._canPause()`, `_pauseGame()`,
  `_resumeGame()` methods near `_cleanupVoiceUI`; pause guard added
  to `handleSunLevelCardClick` and `_onVoicePhrase`;
  `body.game-round-running` toggled on in `startSunLevelTimer`, off
  in `stopSunLevelTimer` / `startPlayAreaDim` / `resetToSetup` /
  `_cleanupVoiceUI`.

### Voice v1 stable point — rollback marker

If you want to skip ALL the post-v1 voice work (per-Type editor,
mic-check panel, lifecycle guards, indicator leak fixes), **revert
to the v1 baseline at commit `3f2d799`** (`Voice input v1 — Find
game, 1-player, EN/ES/RU`). The synonym tables there are hardcoded
inside `js/voice.js` and admin has only the 🎤 checkbox + EN/ES/RU
language dropdown per Type — no editor.

To roll back:

```sh
git revert <new-editor-commit-hash>   # creates a clean revert
# or, if multiple new commits stacked on top:
git revert --no-commit 3f2d799..HEAD
git commit -m "Revert per-Type voice editor; restore v1 baseline"
git push origin master
git push origin master:claude/general-session-yVBQq
git push origin master:claude/review-project-docs-JOOeh
```

The data shape change is additive (`option.voiceSynonyms` is a new
optional field); games saved while the editor was active still load
under v1 because v1's matcher ignores the field. So no data migration
needed in either direction.

## Branch landscape (as of April 25)

**Three branches kept in sync** (every push goes to all three):
| Branch | Role |
|---|---|
| `master` | Primary work branch |
| `claude/general-session-yVBQq` | Push target #2 |
| `claude/review-project-docs-JOOeh` | **GitHub Pages deploy** — site lives here |

**Stale/abandoned branches** (per-session auto-named, never cleaned up):
`main` (305 behind, abandoned Mar 31), `claude/review-project-docs-QNagl`,
`claude/fix-image-upload-cnMr5`, `claude/clarify-task-1NM0X`,
`claude/read-todays-notes-zfR1g`, `claude/review-daily-progress-4qGJy`,
`claude/review-vica-domino-notes-vxyYf`, `find-the-double`,
`Resizing-for-different-hardware`. Safe to delete on GitHub when
convenient. **Note**: ignore the auto-generated branch name when a new
Claude session starts — switch to `master` first thing.

## Session-recovery lessons (April 25)
- **Claude has no cross-session memory.** Anything not committed before a
  session crash is gone. Treat this MEMORY.md (and STATUS_NOTES.md) as
  the only durable record between sessions.
- **Large image uploads can crash a session** with
  `cache_control cannot be set for empty text blocks`. Workaround:
  downscale screenshots to ~1024px wide before attaching, or describe
  what's on screen in text.
- **First thing in a new session**: check `git log --all --since=...` for
  recent commits + read MEMORY.md tail to see where the previous session
  left off. The branch the session opens on is auto-generated and rarely
  the right one.

### Mobile Player Proposals (DEFERRED — discuss later)
- **T1**: Touch-optimized card selection (larger tap targets, swipe gestures)
- **T2**: Pinch-to-zoom on game board
- **T3**: Haptic feedback on card selection (if device supports)
- **T4**: Swipe navigation between screens
- **M1**: Bottom navigation bar for mobile player
- **M2**: Full-screen game mode (hide browser chrome)
- **M3**: Landscape/portrait responsive layouts for gameplay
- **M4**: Card size auto-scaling based on screen dimensions
- **P1**: PWA manifest for home screen install
- **P2**: Offline play capability (service worker caching)
- **P3**: Push notifications for multiplayer turns
- **P4**: App-like splash screen
- **F1**: Visual feedback on all touch interactions (ripple effects)
- **F2**: Loading skeletons instead of blank screens
- **F3**: Animated transitions between screens
- **R1**: Reduce initial load time (lazy load card sets)
- **R2**: Optimize SVG rendering for mobile GPUs
- **R3**: Minimize localStorage reads during gameplay
- **X1**: Shared component library between Studio and Player
- **X2**: Feature flag system for gradual rollout
- **X3**: Analytics/telemetry for usage patterns
