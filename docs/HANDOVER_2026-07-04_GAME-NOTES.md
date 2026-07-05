# Handover — July 3–4, 2026: Game Notes system + sampling + loupe UX

All in `pm-studio-DrV.html` unless noted. Commit **`c5389c3`** on `work/cardmaker-rowcopy`.

## 1. Game Notes system (the big one)

A recording/reporting pipeline: the author chooses WHAT to observe during a
minigame preview, plays, and gets a "notes document" report. The design intent
(user-confirmed): a game's note set is part of that game's **legend**, and one
game can exist in several **versions** named by signature — *"Multiply by 4
with Notes=A1+A2+C3"*.

### Layers
1. **Catalog** (`GAME_NOTES_CATALOG`): 16 notes in 4 groups (A Answers ·
   B Timing · C Patterns/streaks · D Summaries). Each rule: stable `id`
   (codes A1…D3 are display-only, derived from position), `applies` game-type
   list, optional `params` ({key,label,def}).
2. **Type templates**: per-game-type default plans in
   `activeGameNotes_v2` = `{find:{id:{params}}, catch:{}, math:{}}` (v1 migrated
   into `find`). Edited via the Library's 📝 Game Notes button → type chips
   (Find/Catch/Math). Inapplicable notes are greyed **in place** with an `n/a`
   tag (codes stay stable). "All on"/"All off" bulk controls (All-on = defaults,
   keeps existing param choices, applicable-only).
3. **Per-game legends**: each Find game object carries
   `gameNoteSets: [{notes:{id:{params}}}, …]` + `gameNoteSetSel` (in
   `savedCustomGames` — a LOCAL-WINS sync key, safe). The 📝 button on a game
   row opens the box scoped to that game: version chips named by signature
   (`_gnSetSignature` → "Notes=A1+C1+D3"), `+ version` (copies active), `🗑`
   (deletes active), click chip = select the recording set. First open inherits
   the type template as version 1. Header shows *"<game> with Notes=…"* next to
   the title (stays visible while the list scrolls; "What to record during a
   game." is the title's hover tip).

### Parameters
Parametric notes prompt on activation in a **movable** dialog (`z 21500`, above
the box's 21000; drag anywhere non-interactive). Values show as gold chips on
the row — click a chip to edit. Parametric notes: fast-correct `t`, long-gap
`t`, best-timing-streak `C`, clear-guess `K`+`N`. (D1 roles-chart is
deliberately param-free: it shows % success per role.)

### Recording (Find the Doubles wired; Catch/Math pending)
- Preview runs in an iframe (`pm-studio-DrV.html?play=N`); `checkPlayMode`
  calls `_gnSessionStart('find', name, notesOverride)` where notesOverride =
  the game's ACTIVE legend version (falls back to the type template when the
  game has no legend). No notes armed → no session, zero overhead.
- **`js/game.js` hook (the only game-code change, 2 lines):**
  `sunLevelWin` / `sunLevelWrongCard` call
  `window._gnRecord({correct, card, role, player, choices})`. Inert without a
  session. `card` = `label || leftValue|rightValue`; `role` empty until roles
  exist in gameplay data; `choices` = hand length (feeds C4).
  Cache-buster bumped: `game.js?v=game-notes-1`.
- Session = raw events only `{t(ms), correct, card, role, player, choices}`;
  every note is DERIVED. Flushed to `gameNoteSession_current` on every event
  (crash-safe; orphan recovery on next load); finalized on iframe `pagehide`
  into `gameNoteSessions_v1` (last 10). A "📝 recording n notes" tag shows
  bottom-left during the preview.

### Reports
`_gnEvaluate(session)` has an evaluator per note id (first-try detection,
repeated mistakes, per-role/per-card %, timing stats, best C-streak time,
clear-guess trigger detection with time, improvement trend halves, guessing:
success rate vs 1/N chance with verdict, totals with duration floor).
`_gnShowReport` renders the notes document (auto-opens when `closePlayModal`
finds a fresh session); `_gnShowReportsList` = 📄 Reports history. Both titled
*"<game> with Notes=…"*.

### Next steps (agreed plan)
- Catch recording: find its judge point (`_catchCardClicked` in pm-studio) and
  add the same one-line hook; Math Pages via `_wsCheck`.
- Step 5: tickets (transition rules) reference note ids (`usesNote`) and use
  incremental evaluators to switch minigames mid-session. Per-game legends +
  tickets together = the minigame's behavioral spec.
- Reports per game (from the game row), roles once gameplay data carries them.

## 2. Example/worksheet sampling (user request: "how do you randomize?")
- `_pmPickDiverse` is **digit-aware**: each digit position of each free param is
  its own 0-9 coordinate (plus sign), farthest-point sampling over digit space —
  batches spread across decades AND ones digits (measured: same-decade triples
  5.9%→~1%, ones-repeats 70%→54%). Preview panel, Examples card and the
  worksheet all use it.
- **No-repeat rule**: consecutive batches of the same card exclude the previous
  batch (`_pmFilterPrevBatch`/`_pmRememberBatch`, per-card key). Exemptions:
  the game maker's **Repeats** select ("Avoid previous page" default / "Allow
  repeats"), and too-small spaces → repeats allowed + author warning
  ("⚠ Only N distinct problems exist…"); the pv preview header gets a matching
  note. Huge (capped) spaces skip the rule (repeats astronomically unlikely).

## 3. Loupe / editor UX fixes (same session, earlier)
- **Marquee from the backdrop**: rubber-band can START on `#loupe-overlay`
  around the card (full-width lines can be circled from outside the edge).
- **Group arrow-nudge**: arrows move the whole multi-selection (post-clamp
  delta applied to the rest), single-selection unchanged.
- **Live typing (T tool)**: after a stamp, keystrokes append to the text;
  Backspace edits; Enter/Escape end (first Escape no longer closes the loupe);
  with T armed and NO click, typing auto-starts a text centered in the label
  box (else card center); empty leftovers removed (`_endLiveType`). T-tool
  clicks stamp even over existing figures (no silent switch to Select) and
  skip anchored (`data-frozen`) labels.
- **Label content individually selectable**: `getSelectableElement` returns the
  clicked element (its direct-child unit) inside `g.card-label`, not the whole
  label; the label's own box/grid still select the label.
- Tickets Box text edits (C4 "Guessing in Multi-Choice", A5, D1), Game Notes
  help "?" workflow text, subtitle → hover tip.

## Verification notes
Everything was verified live on a scratch server (:8013) with synthetic
cards/games and statistical tests (2000-batch sampler stats; full record→report
cycles). The param editor/loupe still doesn't render in headless screenshots —
measurements + DOM assertions were used instead.
