# Vica Domino Project Memory
**Last Updated**: April 19, 2026

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

### Recommended next steps
Phase 4 is effectively complete (L1 ✅ K6 ✅ L3 ✅ L4 ✅ C1 ✅; L2 deferred). Candidates for next phase:
- **L2** revisit if card sets grow enough to benefit from grid wrapping.
- Math equation editor (mentioned in April 2 pending list).
- Any new features the user wants to scope.

### Key technical details for continuity
- **Trial timestamps**: Must update ALL 5 locations (2 in index.html lines ~32/58, 3 in pm-studio-DrV.html lines ~116/134/368) with every push. Use `TZ='America/Los_Angeles' date '+%I:%M %p PDT'`.
- **3-branch push**: Every push goes to `claude/general-session-yVBQq`, `master`, and `claude/review-project-docs-JOOeh`.
- **Undo system**: Snapshot-based (`_undoPushSnapshot()` before mutations). Batch operations use `_undoSuspended = true` to collapse multiple mutations into one undo step.
- **S2 context menu**: Functions `_ctxShow()`, `_ctxClose()`, `_ctxItem()` at ~line 5010 of pm-studio-DrV.html.
- **S3 drag-drop**: IIFE at ~line 5210 of pm-studio-DrV.html. Async file reads with completion counter for batch undo.
- **L1 desktop density**: `@media (min-width:1025px)` block at end of css/style.css (~line 5812+).
- **Loupe functions**: `openLoupe()` at line ~1404, `_isLoupeOpen()` at line ~7121, `drawKeyHandler` at ~line 4000.
- **Card creation**: `addNewDrawnCard(svgEl, cardName)` at ~line 4707. Always uses viewBox `0 0 60 60`.

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
