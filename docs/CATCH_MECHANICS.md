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
- **Vertical speed — identical for every bubble in a round, and constant** (a plain
  linear fall, **no gravity / no acceleration**): `speed = fallHeight / fallTime`
  (px/s). They keep their spacing as they fall.
- **Across rounds: stepped faster** — every 2 rounds the fall time drops 0.3 s, so
  the speed rises (same height, less time). No change *within* a round.
- **Horizontal — different per bubble.** Each gets a random **drift of ±15 px/s**
  (steady, not jittery) and **bounces off the side walls** (drift flips sign at the
  edge), so it zigzags side to side. There's also a cosmetic **±10° wobble**
  (rotation only, 2–5 °/s — does NOT move the bubble's position).
- **Start positions — stacked above the top, 80 px apart:** `startY = −100 − index×80`
  (→ −100, −180, −260, −340); each bubble also gets a random x.
- **All created at the same instant** (no spawn timer). Because they're 80 px apart
  and share the vertical speed, they *enter* the visible area staggered, with a gap
  of `80 ÷ speed = 80 × fallTime ÷ fallHeight`:

  | Device (fall height) | Entry gap at round 1 (6 s) |
  |---|---|
  | Chromebook (690) | ~0.70 s |
  | iPad landscape (742) | ~0.65 s |
  | iPhone (766) | ~0.63 s |
  | iPad Pro landscape (946) | ~0.51 s |
  | iPad portrait (1102) | ~0.44 s |
  | iPad Pro portrait (1288) | ~0.37 s |

  The gap **shrinks as the game speeds up** (faster rounds → smaller fall time →
  bigger speed → bubbles enter closer together; e.g. iPhone ~0.63 s → ~0.25 s at the
  2.4 s floor). So "about half a second apart" is a fair rough description.
- **Falling-card size: 90 px.** A bubble is "gone" once it passes ~90 px below the
  area bottom (that's when a missed *match* costs a life).

## Configurability today (important for the mini-game plan)
`numFalling` (bubbles) and `fallDuration` (the "timer") are **hardcoded** in the
catch init (`numFalling: 2, fallDuration: 6`) and **auto-ramp** (see the tables
above). They are **NOT** read from the saved Catch game or any Game-Creator option.
The only per-game config the catch runtime reads is the **card shape**
(shape / corner / scale) and the **cards / value groups + per-card `_freezeState`**
(static-only vs falling-only). The Catch **Type** picker exists but only carries a
manual/nonstop *behavior* flag — it does not touch bubble count or speed.

→ So **today there is no setting** for "start with N bubbles" or "fall time = T".
To build fixed, per-game mini-games (e.g. "2 bubbles · 6 s", "3 bubbles · 6 s",
"4 bubbles · 6 s") you'd add:
1. a **starting bubble count** setting — the **Level** picker already encodes 2/3/4
   for Find, so it's the natural control to reuse for Catch;
2. a **fall-time** setting — a number/slider (or reuse the Timer control);
3. an **auto-ramp on/off** flag — so a mini-game can stay *fixed* instead of ramping.

These are small, localized changes (catch runtime reads the values instead of the
hardcoded literals + the creator UI exposes them) — but they don't exist yet.

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
