# Vica Domino Project Memory
**Last Updated**: March 7, 2026

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
- `index.html` (~6,946 lines): Main UI, HTML screens, inline `<script>` for Card Maker/Library/Game Maker
- `js/game.js` (3,614 lines): `VicaDominoGame` class - all gameplay logic
- `js/domino.js` (185 lines): Card definitions, utility functions (isDouble, canPlayOn, etc.)
- `css/style.css` (~4,731 lines): All styling, animations, responsive layouts
- `audio/select-double.mp3`: Voice instruction for tutorial
- Inline script in index.html runs BEFORE game.js loads
- `game.js` uses `DOMContentLoaded` to instantiate `VicaDominoGame`
- **Total**: ~15,476 lines of code

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
- **Card Variations**: Multiple visual representations per card value, with pixel-based duplicate detection
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
| `customCards` / `customCards_abc` | Custom card SVG data per set |
| `deletedCards_abc` | Deleted ABC cards tracking |
| `cardArrangement` | Card row/order persistence |
| `cardVariations` | Card variation definitions |
| `combinedGameConfig` | Combined game stages |
| `_singlePlayerWins` | Tutorial progression counter |

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

## March 7 Session Notes
- **Variation toolbar**: Reorganized from single row into 2×4 grid (2 rows of 4 buttons). Removed separator divs. All SVG icons changed from hardcoded `#2255aa` to `currentColor`. Key: `index.html` ~line 343, `css/style.css` ~line 623.
- **Non-double domino styling**: Added copper outline (`#CD7F32`) to non-double dominos in Game View, matching the gold outline (`#FFD700`) on doubles. Both now look like proper joined domino pairs. Key: `css/style.css` ~line 1832, selector `.game-view-domino:not(.double-domino) .game-view-domino-half`.
- **Symbol toggle implemented**: The toggle button (bottom-right in V toolbar) now swaps positions of placed elements on a card. Removed disabled state, implemented `applySymbolToggle()` with position rotation logic. Works for cards with 2+ elements (text, circles, stamps, groups). Key: `index.html` — `createVariationSVG` and helpers.
