# Vica Domino — Manual Test Protocol

Pre-release checklist for manually verifying all features. Test on **iPad Safari (landscape + portrait)**, **Chrome desktop**, and **mobile Safari/Chrome**.

---

## 1. App Launch & Navigation

- [ ] `index.html` loads without console errors
- [ ] Intro screen displays with "Pinky-Math Domino" title
- [ ] "Choose the game" panel lists available games
- [ ] "Play" button navigates to Start Screen
- [ ] "Create and Edit" button navigates to Create/Edit screen
- [ ] Back arrow on Start Screen returns to Intro Screen

## 2. Player Setup

- [ ] Player count buttons (1P, 2P) respond to clicks
- [ ] Selecting 1P shows one name input + icon selector
- [ ] Selecting 2P shows two name inputs + icon selectors
- [ ] Each icon selector shows 5 character icons (Star, Cat, Robot, Dino, Unicorn)
- [ ] Selecting an icon highlights it and moves it to first position
- [ ] Icons taken by another player show as disabled/dimmed
- [ ] Cannot select an icon already taken by the other player
- [ ] Player 2 icon order is swapped (Cat first, Star second)
- [ ] Back arrow returns to game type selection

## 3. Level Selection

- [ ] Three level buttons visible: Circle (2), Triangle (3), Star (4)
- [ ] Selected level is highlighted
- [ ] Level selection persists in localStorage (`vicaSelectedLevel`)
- [ ] Domino SVG previews render correctly in each button

## 4. Find the Double — Core Gameplay

### 4.1 Single Player (No Xeno)
- [ ] Start game → player receives correct number of cards (2/3/4 per level)
- [ ] Exactly 1 card in hand is a double
- [ ] Clicking the double → card animates up, others animate down
- [ ] After animation → win state shown, "Play Again" buttons appear
- [ ] Clicking a non-double → shake animation plays, buzzer sound plays
- [ ] Wrong card deducts 1 coin (if in combined game)
- [ ] Win awards 2 coins (first winner)

### 4.2 Two Players (No Xeno)
- [ ] Both players receive correct card count
- [ ] Each player has exactly 1 double in hand
- [ ] Both players can click/tap independently
- [ ] First to find double wins; second can still complete
- [ ] If both find within 500ms → tie detected, both shown as tied
- [ ] Dimming effect starts after both players finish

### 4.3 With Xeno (Timer)
- [ ] Xeno character + circular SVG timer displayed
- [ ] Timer starts at 20s (or adaptive value)
- [ ] Timer color transitions as time decreases
- [ ] Timer reaching 0 → loss sound plays, game ends
- [ ] Timer stops when all players find their double
- [ ] Next round timer shown after win

### 4.4 Adaptive Timer
- [ ] Timer decreases after all players win: ≥10→T-5, ≥7→5, else→4
- [ ] At T=4: after 2 consecutive wins → T=3
- [ ] At T=3: after 3 consecutive wins → T=2
- [ ] Timer increases on loss: 2→3, 3→5, 4→5, 5→10, else→T+5

## 5. Keyboard Controls

- [ ] **Single player**: Keys 1-4 select cards left-to-right
- [ ] **Player 1 (2P)**: Keys 1-4 select cards
- [ ] **Player 2 (2P)**: Keys 7-0 select cards (dynamic offset based on card count)
  - 2 cards: 9, 0
  - 3 cards: 8, 9, 0
  - 4 cards: 7, 8, 9, 0
- [ ] **W** or **P** key restarts game when in won state
- [ ] Keyboard popup hint appears on first game (single player)
- [ ] Keyboard popup shows correct highlighted keys

## 6. Tutorial / Progressive Disclosure

- [ ] First game: finger animation points to rightmost card (the double)
- [ ] First game: "Double" label blinks on the double card
- [ ] First game: "Select a double" voice instruction plays
- [ ] After first win: finger hint disappears
- [ ] After several wins: tutorial elements progressively hidden

## 7. Anti-Repetition Systems

- [ ] Same double does NOT appear in 2 consecutive rounds
- [ ] Same non-double cards avoided in consecutive rounds
- [ ] Double does NOT land on same position 3 times in a row for same player
- [ ] Multi-press (≤150ms) treated as wrong (all pressed cards marked wrong)

## 8. Sound Effects

- [ ] Wrong card → buzzer sound (sawtooth oscillator, 150→100Hz, 0.3s)
- [ ] Timer expired (loss) → descending wah-wah sound (2s duration)
- [ ] Coins → gem conversion → glin-glin sound (triangle wave)
- [ ] Tutorial → "Select a double" voice audio plays
- [ ] Sounds work on first interaction (no AudioContext blocked warning)

## 9. Coin / Gem Economy (Combined Games)

- [ ] Correct answer: +2 coins (1st winner), +1 coin (2nd winner)
- [ ] Wrong answer: -1 coin
- [ ] Coins display as stacked golden circles (columns of 5)
- [ ] 10 coins auto-convert to 1 gem with animation:
  - Coins fall animation (0.8s)
  - Glin-glin sound plays
  - Gem pop-in animation
- [ ] Gems display as 💎 icons
- [ ] Stage progression triggers at correct gem threshold

## 10. Animations & Visual Effects

- [ ] Winning domino: 360° rotation over 1.5s
- [ ] Wrong card: shake animation (0.6s)
- [ ] Card selection: translate up 20px, others translate down 20px (0.5s)
- [ ] Keyboard popup: fade in/out (0.3s)
- [ ] Celebration sparkle particles on win
- [ ] Coin stacking pop-in animation
- [ ] Timer color transitions (green → yellow → red)

## 11. Classic Domino Mode

- [ ] Each player dealt 3 cards, remainder in bank
- [ ] Highest double holder goes first
- [ ] Cards can be played on matching left or right end
- [ ] Doubles placed perpendicular (vertical)
- [ ] "Draw from bank" works when no playable cards
- [ ] "Pass turn" available after drawing
- [ ] First to empty hand wins
- [ ] Blocked game detection (no player can play, bank empty)
- [ ] Winner display with correct ranking

## 12. Create & Edit Screen

- [ ] "Create and Edit" opens the create/edit screen
- [ ] Card Maker tool available with drawing tools (pencil, eraser, shapes, text, stamps)
- [ ] SVG-based drawing works (pencil strokes, shape placement)
- [ ] Custom cards save to localStorage
- [ ] Back button returns to previous screen

## 13. Card Library

- [ ] Library button opens card library screen
- [ ] Standard deck (15 cards, A-E values) displayed
- [ ] ABC card set (25 letter cards) accessible
- [ ] Custom card sets visible
- [ ] Card variations displayed correctly
- [ ] Card arrangement persists across sessions

## 14. Game Maker

- [ ] Game Maker screen accessible
- [ ] Custom game configurations can be created
- [ ] Combined (multi-stage) games configurable
- [ ] Custom games saved to localStorage (`savedCustomGames`)
- [ ] Custom games appear in intro screen game list
- [ ] Custom games launch correctly with saved settings

## 15. localStorage Persistence

- [ ] Reload page → selected level preserved
- [ ] Reload page → custom games preserved
- [ ] Reload page → custom card designs preserved
- [ ] Reload page → card variations preserved
- [ ] Reload page → card arrangements preserved
- [ ] Clear localStorage → app loads cleanly with defaults

## 16. Responsive Layout

### iPad Landscape
- [ ] Game container fills screen appropriately
- [ ] Player hands positioned correctly (P1 left, P2 right)
- [ ] Cards sized for easy tapping
- [ ] Timer/Xeno positioned correctly
- [ ] All text readable, no overflow

### iPad Portrait
- [ ] Layout adjusts for narrower width
- [ ] Cards remain tappable
- [ ] No horizontal scroll
- [ ] Overlapping elements check

### Mobile Portrait
- [ ] Layout functional on small screens
- [ ] Touch targets ≥44px
- [ ] Text legible at default zoom
- [ ] No content cut off

## 17. Edge Cases & Error Handling

- [ ] Rapid clicking during animations doesn't break state
- [ ] Starting new game mid-game works cleanly
- [ ] "Play Again" after timer expiry works
- [ ] Switching between 1P and 2P mid-setup doesn't leave stale state
- [ ] Context menu disabled (right-click blocked)
- [ ] Page works without audio support (try catch handles AudioContext failures)

## 18. Browser Compatibility

- [ ] Safari (iPad/iPhone) — primary target
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)
- [ ] SVG rendering consistent across browsers
- [ ] Web Audio API works across browsers

---

## Sign-Off

| Tester | Date | Platform | Result | Notes |
|--------|------|----------|--------|-------|
|        |      |          |        |       |

**Pass criteria**: All checkboxes marked, no critical/high-severity bugs found.
