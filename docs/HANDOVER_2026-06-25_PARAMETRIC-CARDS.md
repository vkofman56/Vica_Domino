# Handover — Parametric Math Cards ("Par" system) — 2026-06-25 (PM rewrite)

A **parametric math-problem authoring system** in the Card Maker. A card becomes a
*template*: it carries named parameters (ranges, constraints, constructions) and an
f-formula; the engine generates concrete problem instances. All work is in
**`pm-studio-DrV.html`** (no `js/sync.js` change).

> **This is the PLACED-LETTERS-ONLY rewrite.** The earlier design (an editable
> single-line on-card formula field with parameter "chips" + a per-parameter style
> popup) was **deleted** on June 25 (PM) per the user's "delete it fully" choice. If
> you're reading an older copy of this doc that describes a formula field / `g.pm-baked`
> formula bake / `_ps*` style popup — that's gone. See "What was removed" below.

## Where things are
- **Branch:** `work/cardmaker-rowcopy` (MAIN tree), pushed to `vkofman56/Vica_Domino`.
- **Tip:** `dcf4167` ("parameters are now placed letters ONLY …"). **NOT deployed** to
  mathgrain.com (user said "not yet"; deploy only fires on push to the stale
  `claude/review-project-docs-JOOeh`).
- **⚠ `index.html`:** has SEPARATE in-progress device-frame work (board-visibility
  scaling — the Device-Preview feature) that was left **UNSTAGED** this session. Only
  `pm-studio-DrV.html` was committed in `dcf4167`. Don't sweep index.html into a Par commit.
- **Banner:** bumps only on commit (pre-commit hook, scope-aware — stamps only the HTML
  files already staged). Last = **08:57 AM PDT** (`dcf4167`).
- **Servers:** two durable `nohup python3 -m http.server` — **:8000** and **:8011**.
  ⚠ **localStorage is per-port.** The user's real cards/data live on **:8000** — that's
  their home port. Use `http://localhost:8000/pm-studio-DrV.html`. Hard-reload
  (Cmd-Shift-R) after every push (a soft reload serves a stale cached page; the studio
  page has no cache-buster on its own URL — append `?cb=<n>` when testing edits).
- **Convention (from [[branch-and-ship-convention]] / docs/HANDOVER_2026-06-23):**
  commit & push only when asked; `git push origin work/cardmaker-rowcopy`; **do NOT run
  `ship.sh`**; CLAUDE.md's canonical-trio convention is stale.

## The model — a parameter is a PLACED LETTER
A parameter lives on the card as a normal `<text data-param="A">` letter, placed /
moved / scaled / styled with the **existing draw tools** (T-tool, Select, transform,
font/color) — it's just *tagged* as a parameter.

- **Place it:** open the **i** palette → click a parameter → that arms place-on-card
  (`_iStartPlaceParam`: enters draw mode, sets the text tool to the symbol). The next
  click on the card drops a `<text data-param>` letter (the draw `drawTool === 'text'`
  branch tags it + `_pcMarkParamEl` adds class `pm-param-svg`).
- **The magenta box** is drawn AROUND each placed letter, recomputed from the letter's
  live bbox (`getSvgSpaceBBox`, the same call the selection ring uses) so it **tracks
  through move + scale**. Live in the loupe via a cheap rAF loop; baked statically into
  the card SVG on close so it persists in `svgContent` and shows everywhere the card
  renders (Card Maker grid, A-Library preview, library set view, games).
- **Instances:** the **123 tag** (grid) and **i → Instance** (loupe) substitute the
  placed letters with one concrete, relation-aware instance — every Par sampled so the
  relations hold, plus the f-formula answer derived (e.g. `C = A + B`). Click again to
  return to the template symbols. Concrete numbers are **normalized back to symbols
  before any save**, so they never persist into a card's `svgContent`.

Loupe rail (visible only when the card editor / "A C" loupe is open; hidden on icon edit):
**Par** (create/edit parameters) · **f** (player-visible f-formula `A + B = C`) · **Rel**
(relations) · **▷** (Preview: generate N instances + "K of N possible") · **i** (Info
palette: lists every parameter incl. f-derived; click a param to place it on the card).

## Data model — localStorage, uid-keyed by card `dataset.uid`
Still used by the placed-letters system:
- `cardMathParams_v1` = `{uid:[param,…]}`. param = `{sym, type:'int',
  mode:'direct'|'constructed', def, lo:{val,op}, hi:{val,op}, restrictions:[…]}`.
- `cardMathFormula_v1` = `{uid:{text, hidden:[syms]}}` — the **f-formula**. Convention:
  `expression = resultName`, i.e. the result symbol is on the **RIGHT** (`A + B = C`,
  not `C = A + B`). The instance engine derives the result name from this.
- `cardMathRel_v1` = `{uid:{text}}` — relations (one per line), applied on generation.

**Orphaned** (the on-card formula field was deleted, so nothing reads these now):
`cardParFormula_v1`, `cardParContent_v1`, `cardParStyle_v1`. Left in place (harmless);
clean up later if desired.

These stores are device-local (NOT in the sync.js LOCAL-WINS list), so they don't sync
device→device yet. Fine for single-superuser authoring.

## Engine (unchanged — `_mp*`)
- **Expression language, no `eval`:** `_mpTokenize` + `_mpImplicitMult` (so `10a`, `2k`,
  `3(x+1)` work; `×`→`*`, `÷`→`/`) + `_mpEvalToks` (recursive descent: + - * / % ^,
  parens; `%` is floored; `^` right-assoc). `_mpParseDef` parses a Constructed definition
  into free vars / derived / relations / main; interval forms `name ∈ [lo,hi]`
  (`[]`=inclusive, `()`=exclusive), `name: lo..hi`, `lo<name<hi`. Result-line match is
  CASE-SENSITIVE (capital main `A` and lowercase helper `a` don't collide).
- **Generation:** `_mpGenerate` (direct: range+restrictions), `_mpGenerateConstructed`,
  `_mpGenerateJointEnv` (sample ALL params, retry until relations hold — this is what the
  placed-letter instance uses), `_mpJointSpace`/`_mpValueSet` (exact problem-space count,
  drives the 123-tag hover + Preview), `_mpGenerateOne`, `_mpRenderMath` (stacked `a/b`).
- **Convention:** main parameters = CAPITALS (auto A,B,C); lowercase = helper sub-params.

## Placed-letter functions (the new code — `_pm*`)
- **Box:** `_pmDrawParamBoxes(svg, groupCls)` removes the old group then draws one magenta
  `<rect>` per `text[data-param]` (skips a letter currently showing an instance, and skips
  degenerate `display:none` bboxes). `_pmBakeParamBoxes(card)` = static bake into the
  card's SVG (class `pm-param-boxes`). `_pmStartLiveParamBoxes`/`_pmStopLiveParamBoxes` =
  rAF loop drawing `pm-param-live-boxes` in the loupe clone.
- **Lifecycle (mirrors the old formula bake):** `openLoupe` strips `g.pm-param-boxes` from
  the clone + starts the live loop if the card has placed params; placement also starts it;
  `drawSave` strips `g.pm-param-live-boxes` from the writeback; `closeLoupe` stops the loop
  + `_pmBakeParamBoxes` + saves; `_pmApplyParamCards` bakes boxes + adds the 123 tag on
  every `.library-card` that has placed params (and strips both when a card has none).
- **Instance:** `_pmGenEnvForCard(card)` → one joint env + f-formula answer.
  `_pmShowPlacedInstance(svg, env)` swaps each letter symbol→value (stashing the symbol in
  `data-param-orig`) and hides the boxes; `_pmClearPlacedInstance(svg)` restores symbols.
  `_pmHasPlacedInstance(svg)` = is one showing. `_pmNormalizePlacedForSave()` restores all
  placed instances page-wide — called at the top of `saveCustomCards` (also cleared in
  `drawSave` + `closeLoupe`) so a transient instance is never serialized.
- `_pmCardInstance` (123 tag) and `_iInstance` (loupe) toggle the instance; `_iParametric`
  restores symbols.

## What was REMOVED (June 25 PM, commit `dcf4167`)
The old on-card formula-field system + per-param style popup, all rewired to placed-only:
- **Style popup:** `_psEnsure/_psOpen/_psClose/_psOutside/_psChange`, `#ps-popup`, `.ps-popup` CSS.
- **Editable on-card formula field + segment model:** `_pcGetSegments`, `_pcSegmentsFromPlain`,
  `_pcPlain`, `_pcSaveSegments`, `_pcChip`, `_pcRenderField`, `_pcSerialize`, `_pfEnsureEls`,
  `_pfRenderOnCard`, `_pfShowInstance`, `_pfInsertParamChip`, `_pfBuildInstance`,
  `.par-card-formula` / `.par-card-instance` / `.pm-param-chip` CSS.
- **Formula bake:** `_pcBakeToSVG` + the `g.pm-baked` group (placed-letter boxes replace it).
- **Text|Parameters mode toggle:** `_pmMode`, `_pmSetMode`, the toggle HTML + `.loupe-mode-*` CSS.
- **i-palette style control:** `_iStyleChange` + the `i-style-*` controls.
- **Dead `_pf*` style/store island:** `_pfStyle`, `_pfStyleForSym`, `_pfSaveStyle`,
  `_pfSaveParamStyle`, `_pfApplyStyleTo`, `_pfLoad`, `_pfSave`, `_pfContainer`, `_PF_*` keys.

Trade-off (agreed with the user): cards that used the old formula field lose their on-card
formula. Net −345 lines.

## ⚠ STILL TODO — resume here
- **Interactive place-a-letter pass in the REAL loupe on :8000.** All verification so far
  is headless-DOM + screenshot (see below) — it does NOT exercise the actual draw-tool
  placement path. Open a card's loupe → **i** → click a param → click the card to drop the
  letter → move/scale it (box should follow) → **Instance**. Confirm the box tracks, the
  instance substitutes + derives the f-answer, and Save persists symbols (not numbers).
- Optional cleanup: remove the orphaned `cardParFormula_v1` / `cardParContent_v1` /
  `cardParStyle_v1` stores + any leftover migration for them.

## How it was verified in-preview (no login needed)
Hidden-DOM logic tests via the preview MCP: build a synthetic `.library-card` with an
`<svg>` + `<text data-param>` letters, seed the `cardMathParams_v1` / `cardMathFormula_v1`
stores for that uid, call the `_mp*` / `_pm*` functions directly, and assert geometry /
substitution / save-normalization. Visual proof = reparent a synthetic card into
`document.body` + screenshot. Always clean up synthetic cards + store keys. Results this
session: 40/40 engine, box geometry (surrounds/tracks/idempotent/degenerate-guarded),
instance lifecycle + save-normalization, post-deletion smoke 9/9, zero dangling refs to
removed identifiers, no new console errors (only the expected Firebase permission-denied).

## This session's commits (newest first)
```
dcf4167  parameters are now placed letters ONLY (box + instances); retire the formula field + popup
cae26af  parameters can be placed as letters on the card (first cut)
3aaf3d7  per-parameter styling via an on-card popup            ← retired in dcf4167
60b9367  bake the parametric formula INTO the card SVG          ← retired in dcf4167
534a904  formula size control + Text/Parameter modes            ← retired in dcf4167
503603c  param chips on thumbnails, thumbnail size fix          ← retired in dcf4167
2b74dc8  i (Info) parameters palette (Slice A)
7d1e804  i palette writes formula on the card face (Slice B)    ← retired in dcf4167
142d05a  on-card formula fixes (stamps, style, tag position)    ← retired in dcf4167
aec866f  math-input polish (intervals, symbols, fractions, UX)
7722cda  Slice 4 (Rel + Preview)
09f52fb  Slices 2 & 3 (Constructed params + f-formula)
43b2c28  Slice 1 (Direct params + Sample)
```
