# Pinky-Math Domino - Comprehensive Project Details

## Architecture

### File Structure
```
Vica_Domino/
├── index.html          (3435 lines) - HTML + inline script
├── js/
│   ├── game.js         (3211 lines) - VicaDominoGame class
│   └── domino.js       (~200 lines) - Card definitions + utilities
├── css/
│   └── style.css       (3772 lines) - All styles
├── images/             - Static assets
└── README.md           - Basic project description
```

### Load Order
1. `css/style.css` (with cache-bust query `?v=combined-games-1`)
2. `js/domino.js` (card definitions, utility functions)
3. Inline `<script>` in index.html (Card Maker, Library, Game Maker UI functions)
4. `js/game.js` (game logic, instantiated on DOMContentLoaded)

### Global State
- `window.game` = VicaDominoGame instance (created on DOMContentLoaded)
- `window.customGameFlipEnabled` - flag for UP/DOWN flip mode in custom games
- `window.combinedGameConfig` / `window.combinedGameStage` - combined game state
- `window._activeCombinedIndex` - active combined game index
- `window.loadGameDeckForStage(index)` - function to load custom game deck

---

## Domino Card System (js/domino.js)

### Value System
- 5 values: A, B, C, D, E (ranking: E > D > C > B > A)
- Each value has 6 representations (A1-A6, B1-B6, etc.)
- 15 total domino cards forming all unique pairs of the 5 values
- 5 doubles: AA, BB, CC, DD, EE

### Standard Deck (DOMINO_CARDS)
| ID | Left | Right | Type |
|----|------|-------|------|
| 1  | A1   | A2    | Double A |
| 2  | A3   | B1    | A-B |
| 3  | A4   | C1    | A-C |
| 4  | A5   | D1    | A-D |
| 5  | A6   | E1    | A-E |
| 6  | B2   | B3    | Double B |
| 7  | B4   | C2    | B-C |
| 8  | B5   | D2    | B-D |
| 9  | B6   | E2    | B-E |
| 10 | C3   | C4    | Double C |
| 11 | C5   | D3    | C-D |
| 12 | C6   | E3    | C-E |
| 13 | D4   | D5    | Double D |
| 14 | D6   | E4    | D-E |
| 15 | E5   | E6    | Double E |

### Custom Game Decks
- Games can define custom card sets stored in localStorage (`savedCustomGames`)
- Dominos are generated as all card-to-card pairs (cross-value + doubles)
- Individual dominos can be excluded from gameplay
- Cards can have variation exclusions per-game

### Key Utility Functions
- `isDouble(card)` - checks if both sides have same value
- `canPlayOn(card, endValue)` - checks if card matches a board end
- `findHighestDouble(cards)` - returns the highest-ranked double
- `getShuffledDeck()` / `shuffleArray()` - deck shuffling
- `createDominoElement(card, isVertical, isOnBoard)` - DOM element creation
- `CHARACTER_ICONS` - player avatar SVG icons (defined in inline script)

---

## Game Logic (js/game.js - VicaDominoGame class)

### Game Phases
1. `setup` - Start screen, level/player selection
2. `showDoubles` - Players reveal doubles, click highest to start (classic mode)
3. `drawForDouble` - No doubles found, draw from bank
4. `noDoubles` - Bank empty, no doubles, any card starts
5. `playing` - Normal turn-based gameplay (classic mode)
6. `sunLevel` - "Find the Double" timed game (primary mode)
7. `sunLevelWon` - All players found their doubles
8. `sunLevelEnded` - Timer expired (game over)
9. `ended` - Game completely over

### Sun Level Mode (Primary)
- Each player gets dealt: 1 double + (N-1) non-doubles
- Number of cards based on level: circle=2, triangle=3, star=4
- Goal: Click/tap the double card before timer runs out
- Anti-repetition: tracks recent doubles/non-doubles to avoid repeats
- Anti-position-repeat: prevents double from landing in same position 3x in a row
- Multi-press detection: buffered clicks per player (150ms window), multi-press = wrong
- Wrong answer: shake animation, coin deduction, "Try again" message
- Correct answer: domino slides up, others slide down, winner box appears
- Flip mode: random cards flipped (left/right swap) when `customGameFlipEnabled`

### Adaptive Timer System (Xeno mode)
- Initial duration: 20 seconds
- **On win (all players found doubles)**:
  - t >= 10 → t - 5
  - t >= 7 → 5
  - t >= 5 → 4
  - t = 4 → after 2 consecutive wins → 3
  - t = 3 → after 3 consecutive wins → 2
- **On loss (time expired)**:
  - t < 5 → t + 2
  - t > 15 → 20
  - else → t + 4
- Resets consecutive wins on loss

### Classic Domino Mode
- Standard domino rules: match values at board ends
- Players take turns placing cards left or right
- Draw from bank if no playable cards
- Must play if able (bank access blocked if playable card exists)
- Skip turn after drawing if still can't play
- Last player can't draw from bank
- Multiple winners tracked in order (Circle of Winners)
- "No more winners" when game is blocked

### Xeno AI (Computer Player)
- Simple strategy: prefers doubles, then plays first available card
- Prefers left side placement
- Draws from bank if no playable cards
- 3-second delay between actions for visibility
- Represented as pink alien character

### Player System
- 1-2 human players + optional Xeno (computer)
- Each player has: name, icon (from CHARACTER_ICONS), hand, isComputer flag
- Player icons are SVG-based character avatars
- Icon selection during setup with back button navigation

### Keyboard Controls
- Sun Level: keys 1-4 (player 1), 7-0 (player 2) select cards
- End game: W = Play Again, P = New Game (2-player)
- Keyboard popup shows miniature keyboard SVG with highlighted key on hover

### Coin/Gem Economy (2+ players)
- Win = +2 coins per player
- Wrong answer = -1 coin (minimum 4)
- 5 coins → 1 gem (automatic exchange with stacking animation)
- Gold coin visuals with paired stacking display
- Stage gems tracked separately for combined game progression

### Combined Games
- Chain multiple custom games into stages
- Each stage requires N gems to advance
- Stage transition overlay with "Level Up!" message
- Final celebration with confetti canvas animation
- Progression: coin → gem → stage advance → celebration

---

## UI Screens (index.html)

### Screen Navigation
1. **Start Screen** (`#start-screen`): Title, game level buttons, player count, custom game buttons
2. **Player Names** (`#player-names`): Name input, icon selection grid
3. **Game Screen** (`#game-screen`): Board, player hands, bank, timer, controls
4. **Create and Edit** (`#create-edit-screen`): Menu for Card Maker, Library, etc.
5. **Card Library** (`#card-library-screen`): Browse card sets
6. **Library Set** (`#library-set-screen`): Individual set view
7. **Domino Library** (`#domino-library-screen`): Domino designs with zoom/loupe

### Inline Script Features (index.html)
- Card Maker with draw tools (pencil, eraser, shapes)
- Loupe mode for card inspection with grid overlay
- Magnifier/zoom controls (+, -, ++)
- Font selector for card text
- New Card (+) creation
- Card variation system with V+/V- buttons
- Duplicate variation detection (pixel comparison)
- Game Maker (GM) popup for game management
- Game View with domino display, card editing
- Custom game button generation on start screen
- Combined game configuration and launch
- Library set browsing with value markers

### SVG-Based Design
- All game icons (Sun, Alien, Sunflower, Xeno) are inline SVG
- Domino cards rendered as SVG elements
- Keyboard popup hint is SVG-based miniature keyboard
- Timer is circular SVG with progress arc
- Card designs use SVG paths and shapes

---

## CSS Architecture (css/style.css)

### Major Sections
- Base styles and game container
- Start screen and setup panel (two-column layout)
- Create and Edit screen buttons
- Domino Library with zoom/loupe/grid
- Draw tools panel
- Variation toolbar with duplicate detection
- Card library set views
- Game Maker popup and game view
- Combined game buttons and celebration
- Game screen (board, player hands, bank, timer)
- Sun Level specific styles (winner boxes, key hints, animations)
- Classic game styles (placement zones, end arrows)
- Winner modal and celebrations
- Keyboard popup styles
- Responsive layouts (iPad landscape/portrait)
- Animations (shake, sparkle, fade, slide, coin-appear, gem-new)

### Key Animations
- `wrong-card-shake` - horizontal shake for wrong answers
- `winning-domino` - scale bounce for correct answer
- `sparkle` - sparkle particles for winner celebration
- `coin-appear` - pop-in for new coins
- `gem-new` - pop-in for new gems
- `fadeIn` - general screen transitions
- `we-won-pulse` - "We Won!" text animation

### Responsive Design
- iPad landscape: side-by-side player layout
- iPad portrait: stacked player layout
- Touch device adaptations (hide keyboard hints on touch)

---

## Development Timeline

### Phase 1: Core Game (Feb 1-3, ~26 commits)
- Basic domino game with Sun Level "Find the Double" mode
- Player setup, level selection, Xeno computer opponent
- Keyboard controls and popup hints

### Phase 2: Polish & Adaptive Timer (Feb 4-6, ~24 commits)
- Title changes (Vica Doubles → PINKY MATH Domino → Pinky-Math Domino)
- Two-column setup layout
- Adaptive Xeno timer with win/loss rules
- Back button navigation
- iPad layout support

### Phase 3: Card Library & Design (Feb 7-8, ~87 commits - most active)
- Domino library preview page
- Extensive card design adjustments (A2, A3, B3, D1, D2, D3, E3, F3, G4...)
- Number sizing, dot positioning, font weight tuning
- Library zoom/scale features

### Phase 4: Card Maker & Game Maker (Feb 9-11, ~36 commits)
- Create and Edit screen
- Card Library browsing with set views
- Card variation feature with localStorage persistence
- Game Maker for custom card games
- Copy game, edit game, delete game functionality
- Per-game variation exclusions
- Flip mode (UP/DOWN) per game

### Phase 5: Advanced Tooling (Feb 12-13, ~22 commits)
- Magnifier with zoom panel and loupe mode
- Draw tool for card creation
- Multi-press detection, double position tracking
- GM popup improvements
- Loupe overlay with grid, ruler, border
- Font selector, snap to grid
- Symbol select/move/edit/delete

### Phase 6: Economy & Combined Games (Feb 14, ~5 commits)
- Predefined library cards for numbers 7-10
- Combined games feature with coin/gem economy
- Gold coin visuals with stacking animation
- Stage progression and final celebration

---

## localStorage Keys
- `savedCustomGames` - array of custom game definitions
- Card variation data (per-card, per-game exclusions)
- Other game state persistence

## Important IDs to Remember
- `bank-draw-btn` (NOT `draw-btn`) - game's Draw from Bank button
- `draw-btn` - Card Maker's draw tool button
- `xeno-timer-box` - Xeno timer display
- `game-board` - domino board container
- `players-area` - player hands container
- `start-screen`, `game-screen`, `create-edit-screen` - main screen containers
