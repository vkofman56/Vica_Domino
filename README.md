# Vica Domino - Complete Development Notes

## Repository Info
- **Repo:** `vkofman56/Vica_Domino`
- **Branch:** `find-the-double`
- **Game name:** "Vica Doubles - Math Domino for Kids"

## File Structure
```
Vica_Domino/
  index.html          - Main HTML (cache busters: style.css?v=clickable-keys-1, game.js?v=clickable-keys-1)
  css/style.css       - All styling (~1919 lines)
  js/domino.js        - Domino card definitions, helpers (15 cards, values A-E)
  js/game.js          - Main game logic, VicaDominoGame class (~2103 lines)
```

---

## Game Overview

"Vica Doubles" is an educational math domino game with two game modes:

### Mode 1: Standard Domino Game (not currently active in "Find the Double" levels)
- 15 cards with 5 values (A, B, C, D, E)
- Each player gets 3 cards, rest goes to bank
- Highest double starts, players take turns placing matching cards
- First to empty hand wins

### Mode 2: Find the Double (Sun Level) - MAIN ACTIVE MODE
- Players receive dominoes (1 double + non-doubles)
- Goal: Click the double domino as fast as possible
- Three difficulty levels based on number of dominoes per player

---

## Game Levels (Find the Double)

| Level | Icon | Data Attribute | Cards Per Player |
|-------|------|---------------|-----------------|
| Sun | Sun SVG with face | `data-level="circle"` | 2 (1 double + 1 non-double) |
| Alien | Green triangle alien | `data-level="triangle"` | 3 (1 double + 2 non-doubles) |
| Sunflower | Yellow flower | `data-level="star"` | 4 (1 double + 3 non-doubles) |

Level selection is persisted in `localStorage` under key `vicaSelectedLevel`.

---

## Player Modes

| Button | Players | Xeno | Timer | Winners | Key |
|--------|---------|------|-------|---------|-----|
| "1 Player + Xeno" | 1 human | Yes | 30sec countdown | 1 (beat timer) | `data-players="1" data-xeno="true"` |
| "2 Players" | 2 humans | No | No timer | 1 (first finder) | `data-players="2" data-xeno="false"` |
| "2 Players + Xeno" | 2 humans | Yes | 30sec countdown | Up to 2 | `data-players="2" data-xeno="true"` |

The `this.includeXeno` flag controls timer and multi-winner behavior throughout the code.

---

## Player Characters (5 icons)
- **Star** (gold) - `star`
- **Cat** (orange) - `cat`
- **Robot** (blue) - `robot`
- **Dino** (green) - `dino`
- **Unicorn** (purple) - `unicorn`

Each is an inline SVG in `CHARACTER_ICONS` object. Players choose icons during setup. Icons are exclusive (can't pick same icon as another player). For Player 2, Star and Cat positions are swapped in the selector so both players don't default to the same icon.

**Xeno** has its own pink SVG icon (`XENO_ICON_SVG`), displayed in the timer box when active.

---

## Three Ways to Select a Domino (Find the Double)

1. **Click the domino directly** - `dominoEl.addEventListener('click', ...)`
2. **Press keyboard key** - `handleKeyPress(e)` listens for keydown events
3. **Click the number label under the domino** - `keyLabel.addEventListener('click', ...)` shows keyboard popup + triggers selection

### Keyboard Mapping
- **Player 1:** Keys `1`, `2`, `3`, `4` map to card indices 0, 1, 2, 3
- **Player 2:** Keys `7`, `8`, `9`, `0` with dynamic offset:
  - 2 cards: keys `9`, `0` -> indices 0, 1 (offset = 2)
  - 3 cards: keys `8`, `9`, `0` -> indices 0, 1, 2 (offset = 1)
  - 4 cards: keys `7`, `8`, `9`, `0` -> indices 0, 1, 2, 3 (offset = 0)
  - Formula: `cardIndex = keyPosition - (4 - numCards)`

### Keyboard Popup (clickable-keys feature)
When a user clicks a number label under a domino:
- `showKeyboardPopup(keyValue)` renders an SVG showing the keyboard number row (1-0)
- The clicked key is highlighted in gold with a red circle
- Popup appears centered on screen for 1 second, then fades out (300ms)
- Simultaneously triggers `handleSunLevelCardClick()` for the corresponding domino
- CSS classes: `.clickable-key` (cursor pointer, hover glow), `.keyboard-popup` (fixed center, z-index 2000)

---

## Find the Double - Game Flow

### Initialization: `startSunLevelGame()`
1. Sets `gamePhase = 'sunLevel'`
2. Resets timer state (`sunLevelTimeLeft = 30`, `sunLevelWinners = []`)
3. Calls `dealSunLevelCards()` - deals based on level (circle=2, triangle=3, star=4)
4. Hides bank area, clears game board, hides pass/draw buttons
5. Calls `renderSunLevel()` to show player hands
6. If `this.includeXeno`: shows Xeno timer box, sets up tick marks, starts 30-second countdown
7. If no Xeno: hides timer box entirely

### Card Dealing: `dealSunLevelCards()`
- Gets all doubles and non-doubles from shuffled deck
- Each player gets: 1 random double + (numCards - 1) random non-doubles
- Hand is shuffled so double position is random

### Rendering: `renderSunLevel()`
For each player, renders one of two states:

**If player has WON:**
```
sun-level-winner-section
  -> winner-domino-wrapper (winning domino with rotation animation)
  -> sun-level-winner-box (icon + name + "You Won!" or "Second Winner!")
```
- Winner boxes have fixed `width: 350px` so both are same size
- `player.animationShown` flag prevents the winning domino from re-animating when the view re-renders (e.g., when second player wins)

**If player has NOT won:**
```
sun-level-tiles-container (flexbox row)
  -> player-info-inline (icon + name)
  -> hint-press-left ("Press")
  -> dominoes-with-keys
       -> domino-key-wrapper (for each card)
            -> domino element (vertical, clickable)
            -> key label span (clickable, shows keyboard popup)
  -> hint-select-right ("to select")
```

### Correct Card (Double): `sunLevelWin(card, player, cardIndex)`
- Adds player to `sunLevelWinners` array
- Sets `player.isWinner = true`, `player.winningCard = card`
- Removes double from hand
- **Without Xeno:** Immediately ends game (`gamePhase = 'sunLevelWon'`), shows "Play Again" button
- **With Xeno:** Shows winner box, checks if all players have won. If all won, stops timer and shows buttons. Otherwise, other players can still play.

### Wrong Card: `sunLevelWrongCard(card, player, cardIndex)`
- Plays buzzer sound via `playWrongSound()` (Web Audio API, sawtooth oscillator, 150Hz->100Hz, 0.3s)
- Shows status: "Try again! Two sides of this domino are not equal."
- Applies `wrong-card-shake` CSS animation (jump up 30px, rotate left/right, return) for 0.6s
- Card stays in hand - NO removal, NO re-render

### Timer Expired: `sunLevelTimeUp()`
- Stops timer
- Sets `gamePhase = 'sunLevelEnded'`
- Disables all domino clicks (pointer-events: none, opacity: 0.5)
- Highlights the double card in each remaining hand (gold border + glow)
- Shows "Play Again" button

---

## End Game Buttons

### "Play Again" (`playAgain()`)
- Resets sun level state (stops timer, hides timer box)
- Resets all player properties: `hand=[], isWinner=false, winningCard=null, animationShown=false`
- Clears `sunLevelWinners` array and game board
- Calls `startSunLevelGame()` with same players and level

### "New Game" (`resetToSetup()`)
- Full reset back to the setup screen
- Restores all hidden elements (level buttons, player buttons, headings)
- Clears all game state

---

## Xeno Timer
- Circular SVG timer with 30 tick marks around the circumference
- Numbers 0-30 displayed as labels
- `stroke-dashoffset` animation on a circular progress ring
- Color changes: green -> orange (3s left) -> red (2s left)
- Timer runs at 100ms intervals for smooth animation
- Located in `#xeno-timer-box` with Xeno icon and "Xeno's Timer" label

---

## CSS Animations

| Class | Animation | Duration | Effect |
|-------|-----------|----------|--------|
| `.winning-domino` | `winningRotate` | 1.5s | Fly up from below + 360deg rotation + scale up |
| `.wrong-card-shake` | `wrongCardShake` | 0.6s | Jump up 30px, rotate left/right, return |
| `.keyboard-popup` | `popIn` | 0.2s | Scale from 0.8 to 1 + fade in |
| `.keyboard-popup-fade` | (transition) | 0.3s | Opacity fade to 0 |
| `.celebrate` | `celebrate` | 0.5s infinite | Scale + rotate emoji |
| `.sparkle` | `sparkle-fly` | 2s | Scale up, rotate, fade out |
| `.we-won-text.animate` | `weWonPop` | 1.2s | Scale pop in and out (x3) |

---

## Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.sun-level-tiles-container` | Flexbox row containing player info + dominoes |
| `.player-info-inline` | Icon + name displayed inline |
| `.dominoes-with-keys` | Flex container for domino-key wrappers |
| `.domino-key-wrapper` | Vertical stack: domino on top, key label below |
| `.key` | Styled keyboard key label (monospace, bordered) |
| `.clickable-key` | Makes key label clickable with hover glow effect |
| `.keyboard-popup` | Fixed center overlay for keyboard SVG image |
| `.sun-level-winner-section` | Vertical stack: winning domino above winner box |
| `.sun-level-winner-box` | Green gradient box (350px fixed width) with icon + name + win text |
| `.winner-domino-wrapper` | Centered container for winning domino above box |
| `.hint-press-left` | "Press" text on left side of dominoes |
| `.hint-select-right` | "to select" text on right side of dominoes |

---

## Sound Effects

### Wrong Card Buzzer (`playWrongSound()`)
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.frequency.setValueAtTime(150, audioContext.currentTime);      // Start at 150Hz
oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.1); // Drop to 100Hz
oscillator.type = 'sawtooth';
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);              // Start volume
gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Fade out
oscillator.start(audioContext.currentTime);
oscillator.stop(audioContext.currentTime + 0.3);                          // 300ms duration
```

---

## Bugs Fixed During Development

1. **First winner's domino re-animates when second player wins:** Fixed by adding `player.animationShown` flag. The `winning-domino` CSS class is only added on the first render after winning.

2. **Winner boxes not same size:** Changed from `min-width: 280px` to fixed `width: 350px` on `.sun-level-winner-box`.

3. **Floating card in doubles box at game start:** Fixed by clearing `document.getElementById('game-board').innerHTML = ''` at the start of `startSunLevelGame()`.

---

## Important Implementation Details

- **Vertical dominoes in Find the Double:** All dominoes in the Sun Level game are rendered vertically (`createDominoElement(card, true)`), unlike the standard game which uses horizontal.

- **Player 2 icon swap:** In `createIconSelector()`, for playerIndex === 1, Star and Cat positions are swapped so both players don't default-select the same icon.

- **Game phase states:** `'sunLevel'` (playing), `'sunLevelWon'` (all done), `'sunLevelEnded'` (timer expired)

- **Cache busters:** Update the `?v=` query strings in `index.html` whenever files change to avoid browser caching.

- **The game board div** (`#game-board`) is cleared when Sun Level starts and when a player wins (dominos move to winner sections instead).

---

## Current State of Code on `find-the-double` Branch

The `find-the-double` branch on GitHub has ALL features EXCEPT the clickable keyboard popup feature. The latest code with the keyboard popup is in:
- `vkofman56/Ardupilot_MARA` repo, branch `claude/domino-game-setup-A93L0`, under `Vica_Domino/` directory

### Files to copy to Vica_Domino repo:
1. `Vica_Domino/js/game.js` -> `js/game.js`
2. `Vica_Domino/css/style.css` -> `css/style.css`
3. `Vica_Domino/index.html` -> `index.html`

### What changed for clickable keyboard popup (vs what's on find-the-double branch):

**js/game.js:**
- New method `showKeyboardPopup(keyValue)` at line 931-979 - renders SVG keyboard with circled key
- Modified key label creation at line 1034-1044 - added `clickable-key` class and click event listener

**css/style.css:**
- New `.clickable-key` styles at line 282-292 (cursor pointer, hover glow)
- New `.keyboard-popup` styles at line 294-309 (fixed center overlay, fade transition)

**index.html:**
- Cache buster changed: `style.css?v=clickable-keys-1`, `game.js?v=clickable-keys-1`

---

## Full Feature List (Chronological Order of Implementation)

1. **Player icons** - 5 SVG character icons (Star, Cat, Robot, Dino, Unicorn) with exclusive selection
2. **Xeno timer** - 30-second circular SVG countdown timer with tick marks
3. **Game level selector** - Sun (2), Alien (3), Sunflower (4) dominos with localStorage persistence
4. **Keyboard controls** - Player 1: keys 1-4, Player 2: keys 7-0 with dynamic offset
5. **Vertical dominoes** - All Find the Double dominoes render vertically
6. **Inline player layout** - Icon + name + "Press" + dominoes + key labels + "to select" on one line
7. **Multi-level support** - `dealSunLevelCards()` handles 2, 3, or 4 cards per player
8. **Winner boxes** - "You Won!" / "Second Winner!" green gradient boxes replace card display
9. **Winning domino animation** - 360deg rotation + fly-up centered above winner box
10. **Animation replay fix** - `player.animationShown` flag prevents re-animation on re-render
11. **Play Again / New Game buttons** - `playAgain()` restarts same settings, New Game goes to setup
12. **Wrong card sound** - Web Audio API sawtooth buzzer (150Hz->100Hz, 0.3s)
13. **Wrong card animation** - Jump up + rotate + return (`wrong-card-shake` CSS, 0.6s)
14. **Equal-size winner boxes** - Fixed `width: 350px` instead of `min-width`
15. **2 Players without Xeno** - No timer, single winner, game ends after first double found
16. **Clickable key labels with keyboard popup** - Third selection method, SVG keyboard with circled key for 1 second
