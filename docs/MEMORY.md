# Vica Domino Project Memory

## Project Overview
- **Name**: Pinky-Math Domino (originally "Vica Domino")
- **Subtitle**: "Game: Find the Double!"
- **Type**: Educational math domino game, single-page web app
- **Purpose**: Children's game where players find matching doubles among domino cards
- **Development**: 199 commits over Feb 1-14, 2026 (most active: Feb 7 with 68 commits)
- **Detailed notes**: See [project-details.md](project-details.md)

## Project Structure
- `index.html` (3435 lines): Main UI, HTML screens, inline `<script>` for Card Maker/Library/Game Maker
- `js/game.js` (3211 lines): `VicaDominoGame` class - all gameplay logic
- `js/domino.js` (~200 lines): Card definitions, utility functions (isDouble, canPlayOn, etc.)
- `css/style.css` (3772 lines): All styling, animations, responsive layouts
- Inline script in index.html runs BEFORE game.js loads
- `game.js` uses `DOMContentLoaded` to instantiate `VicaDominoGame`

## Game Modes
1. **Sun Level (Find the Double)**: Primary mode - each player gets N dominos, must find the double
   - Circle/Sun = 2 cards, Triangle/Alien = 3 cards, Star/Sunflower = 4 cards
2. **Classic Domino**: Traditional domino gameplay with board placement (left/right)
3. **Combined Games**: Multi-stage progression with coin/gem economy

## Key Features
- **1-2 player** support + optional **Xeno** computer opponent (pink alien AI)
- **Adaptive Xeno Timer**: Starts at 20s, decreases on wins, increases on losses
- **Keyboard controls**: Number keys 1-4 (player 1) and 7-0 (player 2) for card selection
- **W/P shortcuts** for Play Again in end-game state
- **Tie detection** (within 500ms for 2-player)
- **Card Maker**: Create/edit custom card designs with draw tools, font selector, SVG-based
- **Game Maker**: Create custom games, select cards, manage domino pairs
- **Card Library**: Browse card sets with zoom, loupe mode, grid overlay
- **Card Variations**: Multiple visual representations per card value, with duplicate detection
- **Combined Games**: Chain multiple games into stages with coin (5 coins = 1 gem) progression
- **LocalStorage persistence** for custom games, variations, card data

## Debugging Lessons
- **Always validate JS syntax first** when user reports "nothing works" / "frozen". Use: `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"`
- A SyntaxError in a `<script src="...">` file prevents the ENTIRE file from executing
- `const` redeclaration in the same scope is a SyntaxError

## Known Fixed Issues
- **Duplicate ID `draw-btn`**: Card Maker draw button and game's "Draw from Bank" shared ID. Fixed: game's button → `bank-draw-btn`
- **`hideCreateEdit()` display bug**: Was setting start-screen to `display: block` instead of `display: flex`
- **Duplicate `const key`** in handleKeyPress caused SyntaxError freezing everything
- **Domino disappearing** on second 2-player game
- **Xeno timer box overlapping** game board (fixed for both normal and iPad landscape)
