# Plan — Creating & managing mini-games in Catch

> **STATUS (June 20 2026): RUNTIME HALF DONE.** `index.html` (`openCatchPlayModal`)
> now reads the per-game Catch settings and produces fixed-bubble mini-games.
> Implemented contract (live):
> - `setup.catchBubbles` — number, clamped **2–5**. When set, the bubble count is
>   FIXED for the whole game (no 2→3→4 climb). When ABSENT, the count is derived
>   from the selected **Level** button (circle/triangle/star/L4 = 2/3/4/5).
> - `setup.catchFallSeconds` — number > 0 (default **6**) → starting `fallDuration`.
> - `setup.catchAutoRamp` — boolean (default **true**); gates ONLY the per-round
>   fall-time speedup. Bubble count never auto-climbs once it's a chosen mini-game.
> The 4 existing games (no `catch*` fields) still play as before EXCEPT the bubble
> count now follows the selected Level (was a hardcoded 2→3→4 climb).
> **REMAINING: the Studio authoring UI** (`pm-studio-DrV.html`) to SET these on a
> Catch game's `setup` — see "Recommended order" below (steps 3–5).

Goal (Victor, June 19 2026): make Catch's **bubble count** and **fall timer**
**per-game settings** so you can author fixed mini-games — e.g. *"2 bubbles · 6 s"*,
*"3 bubbles · 6 s"*, *"4 bubbles · 6 s"* — and combine them into Big Games. Read
**docs/CATCH_MECHANICS.md** first; it has every current rule + the configurability
finding this plan builds on.

## Where things stand today
- **Mechanics fully documented** in `docs/CATCH_MECHANICS.md`.
- **Data backed up**: `backups/savedCatchGames-2026-06-19.json` (4 Catch games:
  0-4 A, Multiply by 4, x2 test, Test Dot). Restore steps in `backups/README.md`.
- **Today there is NO setting** for bubble count or fall time — they are hardcoded
  and auto-ramp (see "Current code" below).

## What needs to change (three new per-game settings)
1. **Starting bubble count** (2 / 3 / 4). The **Level** picker already encodes
   2/3/4 (circle/triangle/star) for Find — reuse it for Catch → starting `numFalling`.
2. **Fall time** in seconds (the "timer"; e.g. 2–8 s). A number/slider in Catch setup
   → starting `fallDuration`.
3. **Auto-ramp ON/OFF**. OFF = the game stays fixed (no per-round bubble/​speed
   increase) — essential for the mini-game idea. ON = today's escalating behavior.

Existing games (no new fields) must **default to today's behavior** (2 bubbles,
6 s, ramp ON) so nothing breaks.

## Current code (exact pointers — all in `index.html` unless noted)
- **Init (hardcoded literals):** `_catchGame = { … numFalling: 2, baseFallDuration: 6,
  fallDuration: 6 … }` near **line 6205**. ← read these from the game's setup instead.
- **Per-round ramp (1-player):** in `_catchCardClicked`, **~lines 6571–6573**:
  ```
  if (round % 3 === 0 && numFalling < 4) numFalling++;
  if (round % 2 === 0 && fallDuration > 2.5) fallDuration -= 0.3;
  round++;
  ```
  ← gate the two `if`s behind the auto-ramp flag.
- **Per-round ramp (2-player):** the same two lines in the 2P path, **~lines 7043–7044**.
- **Fall speed read:** `speed = areaHeight / fallDuration` (~line 6523, and the 2P
  copy ~6996) — no change needed; it already uses `fallDuration`.
- **Creator UI / setup:** the Catch setup page uses a **Type** picker
  (`_renderTypesPicker`, `#setup-right-types`) that only carries a manual/nonstop
  *behavior* — it does NOT touch bubbles/speed. The Catch game model + creator live
  in the **Studio** (`pm-studio-DrV.html`, separate `work/studio` worktree). The
  setup data (`savedCatchGames[i].setup`, plus `probOptions`, value groups, shape)
  is the contract between Studio (authoring) and index.html (runtime).

## Suggested data model (the Studio↔runtime contract)
Add to each Catch game's `setup` (names TBD, pick on day 1):
- `catchBubbles`   : 2 | 3 | 4   (or derive from the Level value)
- `catchFallSeconds`: number      (default 6)
- `catchAutoRamp`  : boolean       (default true)
Runtime reads them with the defaults above; absent → current behavior.

## ⚠ Two-session coordination
- **Runtime** (read the settings, gate the ramp): `index.html` → **Big Game/Previewer
  session** (main tree, `work/cardmaker-rowcopy`).
- **Authoring UI** (expose the controls, save the fields): `pm-studio-DrV.html` →
  **Studio session** (`../Domino-studio`, `work/studio` worktree).
- Agree the `setup.catch*` field names FIRST so both sides match.

## Recommended order for the new chat
1. Re-read `docs/CATCH_MECHANICS.md` + this plan; pick the `setup.catch*` field names.
2. **Runtime first** (index.html): read `numFalling`/`fallDuration`/`autoRamp` from
   `setup` with defaults; gate the two ramp `if`s. Verify the 4 backed-up games still
   play exactly as before (defaults).
3. **Authoring** (Studio): expose Level→bubbles, a fall-time input, and an auto-ramp
   toggle on the Catch setup; save into `setup`.
4. **Test:** author "3 bubbles · 6 s · ramp OFF" → confirm it stays 3 bubbles at 6 s
   across many rounds (no escalation); author "2 · 6 · ramp ON" → matches today.
5. Then build the three mini-games (2/3/4 bubbles @ 6 s) and compose a Big Game.

## Kick-off phrase for the new chat
> Read CLAUDE.md, docs/CATCH_MECHANICS.md and docs/CATCH_MINIGAMES_PLAN.md, and the
> latest docs/STATUS_NOTES.md. Confirm we're on the latest
> `claude/review-project-docs-JOOeh` (fetch first). We're adding per-game Catch
> settings — starting bubble count, fall time, and auto-ramp on/off — so I can
> author fixed Catch mini-games. Start with the runtime read in index.html, keeping
> the 4 existing games' behavior unchanged by default.
