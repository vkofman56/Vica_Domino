# Handover — July 7, 2026: Par editor "rules" redesign + Game-Notes report fixes + Card Maker fixes

All in `pm-studio-DrV.html` (+ 12 lines in `js/game.js`) on `work/cardmaker-rowcopy`.
**DEPLOYED to mathgrain.com** as merge `1ac7ebb` (evening July 7). ~16 commits
(`47d54e5` … `263cd71`); read `git log --oneline` for the step-by-step story.

## 1. Par editor — per-RULE model (the big one)

A parameter's Values is a list of **RULES** (formerly "parts"): ranges and/or
sets. New this session: each rule owns its op, its construct, its constraints.

### Data model (all backward-compatible, gated)
- `part.op` — `'sub'` = **Subtract** rule (its values are REMOVED from the
  domain: union of Add rules minus union of Subtract rules). Absent = Add.
- `p.constructs = [{ target: 'all'|<ruleIdx>, def: '…' }]` — per-rule construct
  blocks. `p.def` still mirrors the `'all'` block for every legacy reader.
- `restriction.target` — `'all'`/absent = every rule, `<ruleIdx>` = that rule.
- **THE GATE:** `_mpUsesPerPart(p)` — false ⇒ generation is byte-identical to
  the old engine (verified). True when: >1 construct block, any per-rule
  target, any Subtract rule, or a shared construct over ≥2 rules.

### Engine (near `_mpGenerateConstructed`)
- `_mpGeneratePerPart(p,n)` — per rule: its construct (own, else shared 'all')
  generates, FILTERED by the rule's own range/set (user decision), under the
  constraints that apply to it; no construct ⇒ plain enumeration. Add-union
  minus Subtract-union. Constructed sub-calls use `opts.all:true` (full value
  list, not a spread — else counts/mix undercount).
- `_mpGenerateForRule(p,i,n)` — ONE rule's values (per-rule Sample + counts).
- `_mpGenerateAny(p,n)` — single dispatch: per-part → constructed → direct.
  `_mpGenerateConstructed(p,n,opts)` gained `{def, filter, restrict, all}`.
- 1→2 rules migration (in `_mpAddPart`): a construct AND constraints authored
  while single-rule move from 'all' onto **rule 1** — the new rule starts
  truly pass-through.

### Editor UI (the "extended/collapsed" model)
- Each rule renders in a bordered `.mp-rule-group`; the ONE movable editor
  block `#mp-rule-block` (Constraints + Construct + per-rule Check/Sample)
  re-homes INSIDE the targeted rule's box (`_mpPositionRuleBlock`; rescued
  before `_mpRenderParts` wipes rows). Green highlight = the open rule.
- **Everything opens COLLAPSED** (`_mpConstructTarget='all'`,
  `_mpBlockCollapsed=true`): a fresh parameter shows only header · Space-box ·
  rule line (✎) · Add-buttons · main Check/Sample · Save.
- ✎ opens a rule's tools (targets it), ▴ folds back; clicking the rule LINE or
  its summary box also opens it. Single-rule params fold via `_mpBlockCollapsed`
  (scope stays 'all' — legacy semantics untouched).
- Collapsed rules show `.mp-rule-summary`: construct lines + spelled-out
  constraints via `_mpRestrLabel` ("2: ÷{3,5,7}"); no word "transparent";
  no box at all when the rule has nothing.
- Constraints are PER-RULE: no applies-to dropdown; the box shows only the
  current rule's list (shared ones tagged "(all rules)"); "copy from…" next to
  CONSTRAINTS appears only when another rule has its own constraints.
  Construct "copy from…" select sits right after the Construct button (only on
  a not-yet-constructed rule ≥2). No "for rule" selector anymore.
- Check/Sample: per-rule pair = LAST row inside an extended box (2+ rules
  only); MAIN pair (whole parameter) sits BELOW + Add range/+ Add set.
- **Sample PAGES**: each click = next 6 values ("showing 7–12 of 88 — click
  Sample for the next ones"); wrap prints "All examples were shown — starting
  from the beginning."; pager (`_mpSamplePage`) resets on any definition/rule
  change; huge spaces page a 600-value spread. Sample also stamps per-rule
  count badges (`.mp-rule-count`, "−N" on Subtract rows); badges clear on edit.
- Place-value helper: `_pvEffRange` is TARGET-AWARE (decomposes the edited
  rule's own range); `_pvOnRangeChange` INTERSECT-preserves the user's manual
  digit restrictions (the old recompute silently reset b∈{1..9} → {0..9});
  active title row replaced by inline "Construct = place-value decomposition"
  on the A=10a+b line (2cm gap); the "range adds a filter" note is a 2-row
  dashed box RIGHT of the digit sentences.
- Terminology: **rules** = ranges/sets; **steps** = a construct's numbered
  lines ("Save step N").
- Layout: panel `#par-panel` 452px; header "Parameters [A] integer" (no
  "Symbol"); Space-box ONE line under the header ("reserve [n] digit space ☑ ·
  Off = free width", reserve aligned to the sym box, measured via setTimeout —
  rAF stalls in background tabs); empty output bars hidden (`.par-sample-out:empty`).
- Parameter LIST row: each rule in its own rectangle joined by its op sign
  (`+`/`−`) with its construct + constraints inside (`_mpSummaryHTML`);
  restricted micros render YELLOW with a "does not have: …" tooltip
  (`_mpFormulaLineHTML`); plain `_mpSummary` string remains for the i-panel.

### Known not-done
- ＋ Info card summary still reads only the shared formula (per-rule constructs
  not itemized there). Examples card / worksheets use the generator → correct.
- The editor panel does not render in headless screenshots (long-standing);
  everything was verified by DOM assertions + generator tests.

## 2. Game Notes / Reports (why the user's report was "wrong")

- **Legend now holds**: the play tab used to snapshot the game's legend at TAB
  LOAD; editing the legend after opening the tab recorded the old version.
  pm-studio's `_gnRecord` re-reads it at the FIRST judged answer + on refocus
  (`_gnRefreshSessionNotes`, `_gnPlayGameIndex`); the Previewer module in
  game.js reads it at Start Game. Buster: `game.js?v=game-notes-4` (index +
  studio).
- **Name-keyed legend backup** `gameNoteLegends_v1`: if a game entry loses
  `gameNoteSets` (unknown writer — root cause never reproduced), the Notes box
  AND all recorders restore from backup instead of re-inheriting the template.
  Backup writes on every `_gnSaveScopedGame`.
- **Roles**: A5/D1 resolve via `_getCardRole` (stableId across all stores —
  the badges' path; `game.cards` rarely carry `role`); variations inherit the
  original's role. **Role = the domino's LOWER card only** (`made` =
  "top+bottom"; deal/flip swaps keys with values) — footnote in both sections
  + catalog descriptions.
- **D2 per-card success** = visual domino rows, worst success first, colored %.
- `made` parsing tolerates labels CONTAINING '+' ("E7_20 + 8"): `madeParts`
  tries every '+' and keeps the split where both sides are known labels.
- **Dominoes always render**: glyph chain faces → value pips/text → label-text
  halves (auto-shrink) → "?"; and sessions FREEZE played faces into
  `session.faces` at end/orphan-fold — reports survive later library edits.
  (Pre-existing sessions have no snapshot; they use the live chain.)

## 3. Card Maker

- White label-cards (`data-info`) survive copy/move/import (deployed July 6).
- Oversized-card mystery: the loupe's resize handles are THREE tools — S edge
  = view zoom (safe), E edge = PERMANENT card width, SE corner = PERMANENT
  frame scale; both persist on save. Fixes: right-click **"Reset size →
  standard"** (only on non-standard cards, group-aware) + the blank-card loupe
  now resets shape/frame globals (leak).
- Group move-to-row: the emptied line's keeper placeholder used to land in the
  DESTINATION (addNewDrawnCard matched rows by stale card labels) — so moved-to
  lines grew a stray blank AND emptied lines vanished on reload. Fix: row
  lookup prefers `data-row-letter`. Users may still have old stray blanks —
  they're ordinary cards, ✕ them.
- Row-letter hover tip now mentions right-click to add lines above/below.

## 4. Two-session working-tree rules (IMPORTANT)

A parallel live session edits `pm-studio-DrV.html` itself (Math Games /
worksheets) + `js/sync.js`. Commit `f38378e` accidentally swept its
uncommitted Math-Games work in via `git add -A`. Rules now in auto-memory:
**stage only files you edited**; expect "File modified since read" Edit
collisions — re-read or patch via `python3` heredoc.
**FLAG:** its `js/sync.js` change (adds `savedMathGames` to local-wins) shipped
WITHOUT a cache-buster bump (`sync.js?v=local-wins-15` unchanged) — bump across
biggame/gallery/index/pm-studio if math games misbehave on other devices.

## 5. Next steps

1. User tests the Par redesign + reports with real data (:8000 / mathgrain.com).
2. sync.js cache-buster bump (coordinate with the Math-Games session).
3. ＋ Info card: itemize per-rule constructs.
4. Older plan still open: Catch (`_catchCardClicked`) / Math (`_wsCheck`)
   recording hooks; tickets consuming notes.
