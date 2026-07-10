# Handover — July 7, 2026 (evening): MATH PROBLEMS SAVED GAMES (Interactive Worksheets)

All in `pm-studio-DrV.html` (plus 2 lines in `js/sync.js`), on `work/cardmaker-rowcopy`.
Work tip **`ca56f53`**, deployed via merge **`4aa1a33`** → `claude/review-project-docs-JOOeh`
(+ both mirrors at the same tip). Everything below was verified live on :8012 with seeded
data before shipping. This session ran in PARALLEL with the Par-rules session (see
`HANDOVER_2026-07-07_PAR-RULES.md`) — the two swept each other's working tree into commits
several times (`f38378e`, `b0a6748`, `ca56f53`); use `git log -S <symbol>` to find where a
change actually landed, and NEVER `git add -A`.

## What it is

"Math Problems" is now a REAL saved game type, not just the ad-hoc worksheet generator:
GM → + New Game → Math Problems goes through the normal name + card-selection flow, saves
a game, and opens a Math-specific SETUP screen (no Freeze/neutral/moving columns). ▶ plays
the interactive worksheet built FROM the saved game. The old single-card generator path
(`wsOpenGenerator`) still works unchanged for ad-hoc pages.

## The notes model (user-corrected twice — get this right)

- NOTES are authoring aids, in two forms: (1) the **white note-box ON the card face** —
  the label box `g.card-label` inside the card's SVG, one per card, dropped by the label-box
  tool and locked/unlocked with the anchor ⚓ / crossed anchor (`data-frozen`); (2) the
  **white note-CARDS** (`data-info="true"`: ＋Info / ＋Examples / label cards).
- **The player NEVER sees any of it** — the worksheet shows plain generated text problems
  only (never a card face, box, or note card). `_wsGenerateFromGame` skips `info.isNote`
  cards explicitly.
- In the setup screen the notes are FOR the author: each problem card's note cards render
  right beside it, at Card-Set look and size — that's the information used to set the
  probabilities. No captions/labels over them (the gold "NOTES — ONLY YOU SEE THESE" text
  and the internal card names were removed on user request; both live on as hover tooltips).

## Storage + sync

- `savedMathGames` (localStorage): `loadMathGames()` / `saveMathGames()` next to the catch
  pair (~`_resolveGameNameCollision`, which now also handles `'math'`).
- Game object: `{ name, description, cards:[info…], ws:{count, perCol, attempts, repeats},
  hiddenOverrides:{cardKey:[sym…]}, roles:{cardKey:name},
  probOptions:[{id, name, weights:{cardKey:n}}], activeProbOptionId }`.
  Card keys via `_probCardKey` (`u:uid` → `s:stableId` → `l:label`). `_mgMigrate` fills all
  defaults idempotently.
- Card info entries gain `isNote:true` when selected from a `data-info` card
  (`_gmSelectCard`); older entries fall back to "no params ⇒ note".
- `js/sync.js`: `savedMathGames` added to `_localWinsKeys` AND the card-backup key list;
  cache-buster bumped to `sync.js?v=local-wins-16` in pm-studio-DrV.html ONLY (index.html
  belongs to the other stream; the sync change is backward-compatible).

## Game Maker flow

- `_showGameTypeChoice` 'math' no longer jumps to the generator — the generic path runs
  (`gameMakerType='math'`, title/bar in green `#7eff7e`, label "Math Problems").
- Selection bar gains `#gm-copy-mode` (math games only): **Card only / Card + its notes /
  Just the notes** — a click on a parametric card also grabs (or grabs only) the
  consecutive `data-info` cards right after it in its row. Shared capture helper
  `_gmSelectCard(card)`.
- `completeGame()` math branch saves and then opens the setup screen directly (no alert).
- GM popup: a "Math Problems" `_gmAppendDirectory` (open → `openMathGameView`, edit →
  selection). Library: `GAME_TYPES` id **`mathpages`** maps to `loadMathGames` in
  `_gtLoadGames`; `_gtBuildMathRow` (▶ `wsOpenGeneratorForGame`, name `openMathGameView`,
  ✕ `deleteMathGame`); `_gtOpenRecent` + folder move/delete have math branches;
  `recordGameActivation('mathpages', …)` on open/play.

## The setup screen (`#mg-overlay`)

`openMathGameView(i)` / `closeMathGameView` / `_mgRender` / `_mgEnsureDom` (~search "MATH
PROBLEMS GAME — saved-game SETUP screen").

- **Bar**: name + ✎ rename (collision-checked), Problems/page, **Per column**, Attempts,
  Repeats (all persist onchange to `game.ws`), ▶ Play worksheet, ✕ Close.
- **Mix presets** (`probOptions`): chips (click = activate), ＋ Prob (copies the active
  preset's weights), ✎ rename, 🗑 delete (≥1 kept). Beside them the SCALE note:
  "· weights total 200 — weight 1 ≈ 0.5% of the page".
- **Weights are RELATIVE, not out of 100** (user-specified): share = w ÷ total. `_mgPct`
  is honest at the edges — 99.5 never shows as 100, a tiny share shows as `<0.01`, one
  decimal below 10%, two below 1%.
- **Card rows** (one per problem card, built by `_mgUnits`-equivalent walk in `_mgRender`):
  - **Pictures are literal Card-Set copies** (`_mgPreviewEl`): live `.library-card` clone
    (root class swapped to `mg-card-copy` so global sweeps/handlers ignore it; `data-uid`
    stripped; buttons removed) → else REBUILT from stored data (`_mgCardDataFor`: stableId
    lookup via `_findCardDataByStableId` → uid scan over `_getAllCardStorageKeys` → the
    game's own `svgMarkup`) → else a labeled chip. `zoom:1.6` for readability. Internal
    card name hidden (compact-view parity) — hover tooltip instead. Note copies keep
    `data-info` so the white graph-paper rule applies (replicated for `.mg-card-copy`).
  - **"Player sees"**: a REAL sample problem (via `_wsGenerate(stub,1,hidden,true)`) with
    each blank's VALUE half-transparent + gold underline (`.mg-hid-val`), ↻ resamples.
    NOT the formula — the formula/box is note content. Warnings when no formula / no blank.
  - **"Show a problem"** eye chips: per-GAME override `hiddenOverrides[key]` (card's own
    eye config is only the default; ↺ card default forgets the override).
  - **Role** (`game.roles[key]`) + **Weight** (active preset; editing a card with a role
    fans the weight to the whole role) + live "≈ X% of the page".
  - The line's note cards beside it; loose notes (no problem card before them) in a
    section at the bottom.
- **Line management — direct manipulation, no buttons** (user: "why do we need a special
  button for that?"):
  - Click toggles a line; click a note picture to select just that note; **marquee** drag
    from the background selects lines (Shift adds); Esc clears (second Esc closes).
  - **Drag a line to move it** (`_mgStartRowDrag`): gold drop bar `#mg-dropline` shows the
    target; dragging a selected line moves the whole selection in order; grabbing an
    unselected line picks it alone. Notes travel with their line. `_mgReorderByKeys`
    rebuilds `game.cards` from the visual order (`_mgUnits`/`_mgFlattenUnits` keep a
    problem card + its trailing notes as one unit).
  - **Delete/Backspace** removes the selection (confirm; cards stay in the Card Set;
    roles/overrides/ALL presets' weights cleaned). **↑/↓** nudges. The keydown listener is
    CAPTURE-phase + stopPropagation so the Card Maker under the overlay never sees these
    keys.
  - `#mg-selbar` holds only what has no gesture: count, common **Weight → Set for
    selected**, a hint line, ✕ Clear.

## The worksheet player

- `wsOpenGeneratorForGame(i)`: ws overlay in GAME mode (`_wsGameIdx`; source select locked
  to "Game — name"); bar edits persist back to `game.ws`; `wsOpenGenerator()` resets to
  single-card mode.
- `_wsGenerateFromGame`: each problem SLOT draws its card INDEPENDENTLY by weight —
  deterministic largest-remainder was deliberately replaced because it rounds a 0.5% card
  to zero on EVERY page ("never" instead of "rare"); verified ≈4 appearances per 100 pages
  at 0.5% × 8. Problems merge + Fisher-Yates shuffle; per-card errors are prefixed with the
  card's label; `repeatWarn` carries through.
- **Detached stubs work**: `_mgCardStub(info)` returns the live library card OR a bare div
  with `dataset.uid` — the whole generation pipeline (params/formula stores, batch memory)
  is uid-keyed, so cards do NOT need to be in the DOM.
- **Page layout** (user-specified): list numbers are the SAME SIZE as the problems
  (lighter `#b9bfd0`, own period, `min-width:44px + 22px` gap so "2." never reads as part
  of the math); **Per column** (`ws.perCol`, default 5) sets how many problems stack per
  column — `grid-auto-flow:column`, `grid-template-rows:repeat(perCol)`, columns =
  ceil(n/perCol), and NUMBERING RUNS DOWN each column.

## Gotchas / lessons

- The Card Maker hides `.library-label`/`.library-desc` via `.compact-view` — copies
  rendered elsewhere must hide them too or internal names leak (the
  "E1_A+B=C7+2=999+2=10190" incident).
- Note-card styling keys on `.library-card[data-info]` — any copy that swaps the root
  class must replicate the rule or notes lose their graph-paper look.
- Setup opened from the LIBRARY has no Card Maker DOM — pictures MUST resolve from stored
  card data, not just `querySelector` (the "labeled chips instead of cards" incident).
- `_getAllCardStorageKeys` only lists REGISTERED sets (savedCardSets) — a uid scan misses
  unregistered stores.
- Prompt-driven flows (`prompt()`) can't be automated headlessly; everything else was
  verified with synthetic events on :8012 (localStorage is per-port; test data was
  seeded and cleaned each time).

## July 8 addendum — worksheet INPUT MODES (touch keypad + draggable digits)

Commit **`10b1d93`**, deployed via merge **`dfe5153`** (+ mirrors). Banner 12:01 AM PDT.

- **Two input modes**, chosen by the author (Input select in the ws bar AND the game
  setup's options row; `ws.input` `'mouse'|'touch'`, default mouse; the switch applies to
  the CURRENT page without regenerating — `_wsApplyInputMode`).
- **Mouse** = no keyboard on the screen at all; answers type normally.
- **Touch** = a fixed on-screen keypad `#ws-pad`, **TWO lines** (user spec — was 4):
  `1 2 3 4 5 | ⌫ delete` / `6 7 8 9 0 | ◀ back · ⏎ enter`. Answers become `readOnly`
  (a tablet never pops its own keyboard); the ACTIVE answer highlights gold
  (`.ws-active`); tapping any answer selects it. **⏎ enter** jumps to the next EMPTY
  problem, wrapping; all filled → focuses Check. **◀ back** = previous problem.
  **⌫** deletes the last digit. Plumbing: `_wsActiveInput`/`_wsInputsList`/
  `_wsSetActive`/`_wsPadKey`.
- **Digits DRAG off the keypad onto ANY problem, in any order** (pointer events;
  `touch-action:none` on the keys): >8px movement lifts a gold chip (`.ws-drag-digit`,
  `pointer-events:none`) that follows the finger; the hovered row's answer highlights
  green (`.ws-drop`); release types the digit there and makes that box active; a miss is
  a no-op; a second drop APPENDS. Three details that made it work:
  1. **The whole `.ws-prob` row is the drop target** — the bare input is a tiny touch
     target; near-misses made drops feel "in order only".
  2. **The keypad sets `pointer-events:none` while a drag is live**, so rows behind it
     stay reachable — and the drop target is resolved in `pointerup` BEFORE restoring it
     (restoring first swallowed every drop over the pad region — real bug, fixed).
  3. A `_wsPadDragDone` flag swallows the click that Chrome fires at the capturing
     button after a drag (otherwise the digit typed twice).
- **Status bar**: a fresh page shows ONLY the "Attempt N of M" pill — the "Fill in the
  answers, then press Check." instruction is gone (user request), including its copy at
  the end of the repeat warning. Wrong-answer feedback is unchanged.
- Testing gotcha: on the logged-out preview port, `.sync-login-overlay` (plus the Admin
  Login dialog) covers the page and breaks `elementFromPoint`-based drop tests — hide
  both before simulating drags; the user's logged-in :8000 doesn't have them.

## PARAMETRIC CATCH — the agreed plan + phase 1 (July 9)

**The concept (user's design):** the math problem freezes on the left, answers
fall — one is correct. A line pairs the EQUATION card (answer symbol invisible)
with a separate ANSWER card showing that symbol; in play the pair always shares
ONE instance (A+B= 7+2 freezes ⇒ 9 falls). Line WEIGHTS (the Math presets model)
set how often each kind/range of problem appears; falling answers are DISTINCT.

**The plan:** (1) explicit problem↔answer link (not inferred from line position);
(2) phase 1 = PRE-BAKED instance pairs — static faces the existing Catch player
can use as ordinary paired cards, zero game.js changes; (3) ~~phase 2 (later) =
live in-game generation~~ **SUPERSEDED July 10 — see the SECRECY PRINCIPLE
below: phase 2 must be a bake-REFRESH (new pool baked in the Studio), never a
live engine in the player.** Recommended maker = the Math setup + Catch options.

### 🔒 SECRECY PRINCIPLE (July 10 — binds every parametric-play decision)
The user's explicit concern: a player may be a hacker trying to crack the game
and recreate it. **The player side must NEVER receive a game's generating
program** — only BAKED outputs (concrete instances / frozen faces). The
`_mp*`/`_pm*` engine and the authored math stores (`cardMathParams_v1`,
`cardMathFormula_v1`, `cardMathRel_v1`) stay in the Studio; they must never
ship to `index.html`/`js/game.js` nor join the sync payload for player devices.
Rationale + the agreed FIND-board spec (bake-at-save pool, per-page distinct
answers, 2–3-game no-repeat history, author-side "Repeats OK" override) are in
`docs/MEMORY.md` §July 10.

**Phase 1 SHIPPED pieces:**
- **＋ Answer card** (i-panel, next to ＋ Info card): drops the linked answer
  card on the line — a REAL playable card (not data-info) showing the formula's
  answer symbol in its color; params/formula/relations copied
  (`_pmCopyCardMathData`) with the answer VISIBLE on it (invisible flags/hidden
  cleared). Link stored in **`cardAnswerLinks_v1`** (`{answerUid: problemUid}` —
  its own uid-keyed store, like params; no card-serializer changes).
- **Setup screen**: an answer card rides its problem card's LINE (never a line
  of its own) — `_mgUnits` + the render walk attach by the link; it renders in
  the card zone with a green outline + "answer" tag. Generation
  (`_wsGenerateFromGame`, `_pcBakePairs`) skips answer views.
- **Bake engine `_pcBakePairs(game, n)`**: draws each pair's LINE by the active
  preset's weights (per-slot), generates ONE env per pair
  (`_pmGenEnvForCard` on a uid stub), and bakes two static faces with
  `_pcBakeFace` (text[data-param] → env values; hidden syms blank on the
  problem face). **Distinct answers**: retries WITHIN the drawn line first —
  re-drawing the line on a collision starved small ranges and inverted the
  weights (fixed; verified ~70% vs 75% target with a 3:1 preset, capped by the
  small line's 9-answer pool). Answer face = the linked card's art, else a
  plain number. Returns `{pairs:[{lineKey, env, answer, problemSvg, answerSvg}]}`.

**Phase 1 REMAINING:** the "Play as Catch" button — wrap baked pairs into a
transient Catch game (problem = frozen half, answer = falling half; distractors
are the other pairs' answers, Catch's native behavior) and launch the existing
player. Needs a check of game.js's pairing semantics (how top/bottom halves
match) before wiring. Then: N-pairs option, repeats policy, and eventually
Game-Notes hooks ("80% misses in range X — raise its weight?").

## Open / next steps (agreed)

1. **📝 recording hooks for Math games** — `_gnScopedGame`/`_gnSaveScopedGame` support
   'find' only; math worksheet sessions don't record Game Notes yet (no 📝 button on math
   rows on purpose).
2. Math games in the **Game Preview / new-tab play** flow (currently the ws overlay lives
   in the Studio tab).
3. Roles → notes integration (the user already writes "ROLE: …" in the on-card note-box;
   pre-filling the setup's Role field from it was floated and welcomed, not built).
4. A real user-data pass on :8000.
