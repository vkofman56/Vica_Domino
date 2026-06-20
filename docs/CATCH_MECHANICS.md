# "Catch the double" — game mechanics (as-built)

Reference for re-creating the Catch behavior as designable mini-games. All numbers
read directly from the live code (`_catch*` in `index.html`) on June 19, 2026.

## Core loop
- A static **"FIND THIS CARD"** target sits top-left and **never falls** — it's the
  reference value to match.
- Each **round**, a set of cards falls down the right-hand "falling area." Exactly
  **one** is the *match* (shares the target's value); the rest are *distractors*.
- **Catch the match** (click it before it leaves the bottom) → **+1 coin**, advance
  to the next round (next round starts ~0.8 s later).
- **Miss the match** (it falls off-screen un-clicked) → **−1 life** + "Missed!"
  (next round ~1.2 s later). **0 lives → Game Over.**
- **Click a wrong bubble** → "Wrong!", **−1 coin** (or, if no coins, −1 gem and
  +9 coins back); the bubble keeps falling; **no life lost**.
- **10 coins → auto-convert to 1 gem.** Gems are the currency a **Big Game** uses
  to advance to the next stage.
- Start of game: **3 lives**, 0 coins/gems, round 1.

## Number of falling bubbles
- Starts at **2** (1 match + 1 distractor).
- **+1 bubble** after completing every **3rd** round (`round % 3 == 0`), **capped at 4**.
  - **3rd bubble** first appears in **round 4** (added when you catch round 3).
  - **4th bubble** first appears in **round 7** (added when you catch round 6).
  - Stays at 4 from then on.

## Fall time (how long a bubble takes to cross the visible area)
**This is the SAME on every device** — the pixel speed is scaled to the area height
so the *crossing time* is constant. Difficulty ramps by shrinking this time.
- Starts at **6.0 s**.
- **−0.3 s** after completing every **2nd** round (`round % 2 == 0`); effective floor **2.4 s**.

| Rounds | Fall time |
|---|---|
| 1–2  | 6.0 s |
| 3–4  | 5.7 s |
| 5–6  | 5.4 s |
| 7–8  | 5.1 s |
| 9–10 | 4.8 s |
| 11–12 | 4.5 s |
| 13–14 | 4.2 s |
| 15–16 | 3.9 s |
| 17–18 | 3.6 s |
| 19–20 | 3.3 s |
| 21–22 | 3.0 s |
| 23–24 | 2.7 s |
| 25+  | 2.4 s (floor) |

## Speed and motion
- **Within a round: constant speed** — a plain linear fall, **no gravity / no
  acceleration**. `speed = fallHeight / fallTime` (px per second).
- **Across rounds: stepped faster** — every 2 rounds the fall time drops 0.3 s, so
  the speed goes up (same height, less time).
- **Stagger:** all bubbles for a round are created at once but start *above* the
  top at `y = −100 − index×80`, so they enter the screen one after another
  (~80 px apart), not simultaneously.
- **Horizontal drift:** each bubble drifts **±15 px/s**, bounces off the side walls;
  gentle **±10° wobble**.
- **Falling-card size: 90 px.** A bubble is "gone" once its top passes ~90 px below
  the area bottom.

## Fall height + initial speed, per device
The catch HUD header is a fixed **78 px**, so **fall height = device height − 78**,
and **initial speed = fall height ÷ 6 s**. (✓ = measured live; others computed from
the exact 78 px rule.)

| Device | Screen W×H | Fall height (px) | Initial speed (px/s, at 6 s) |
|---|---|---|---|
| iPhone (portrait) | 390 × 844 | **766** ✓ | 128 |
| iPhone (landscape) | 844 × 390 | 312 | 52 |
| iPhone 17 Pro (portrait) | 402 × 874 | 796 | 133 |
| iPad (portrait) | 820 × 1180 | **1102** ✓ | 184 |
| iPad (landscape) | 1180 × 820 | 742 | 124 |
| iPad Pro 12.9″ (portrait) | 1024 × 1366 | **1288** ✓ | 215 |
| iPad Pro 12.9″ (landscape) | 1366 × 1024 | **946** ✓ | 158 |
| Chromebook | 1366 × 768 | **690** ✓ | 115 |

> The initial speed differs per device only because the *height* differs — every
> device still gives the player the same **6 s** to react. As rounds progress the
> per-device speed scales up by `height ÷ (current fall time)`; e.g. on iPhone the
> match bubble goes from 128 px/s (round 1) to 319 px/s once the floor (2.4 s) is hit.

## The two difficulty knobs (for mini-game design)
1. **Bubble count:** 2 → 3 (round 4) → 4 (round 7), cap 4. (+1 every 3rd round.)
2. **Fall time:** 6.0 s → 2.4 s, −0.3 s every 2nd round.

Everything else (no acceleration, device-independent timing, the coin/gem/life
rules above) stays fixed. Card content/values come from the assigned Catch game's
value groups; per-card `_freezeState` controls static-only vs falling-only roles.
