# Handover — Parametric loupe authoring (placed letters, instances, alignment) — 2026-06-26

Continues `docs/HANDOVER_2026-06-25_PARAMETRIC-CARDS.md`. Everything is in
**`pm-studio-DrV.html`** (the Studio / Card Maker loupe). The "Par" system is
**placed-letters-only**: a parameter is a normal `<text data-param>` letter (or a
whole printed formula) on the card; pressing **123** / **i → Instance** fills the
placed letters with one concrete, relation-aware example.

## Where things are
- **Branch:** `work/cardmaker-rowcopy` (MAIN tree), pushed to `vkofman56/Vica_Domino`.
- **Tip:** `1177d0b` (+ the docs commit on top). **DEPLOYED** to mathgrain.com this
  session by merging `work/cardmaker-rowcopy` → **`claude/review-project-docs-JOOeh`**
  (the branch the Firebase GitHub Action deploys from — see below).
- **Servers:** durable `http.server` on **:8000** (user's HOME port; their data lives
  here) and **:8011**. localStorage is per-port; **hard-reload (Cmd-Shift-R)** after a
  push — the deploy banner (top-left of the app) confirms the version.
- **Parallel work (NOT mine):** `index.html` (device-preview board-visibility scaling)
  and `biggame.html` (Big Game Scan button + GP player-mode warnings) were edited by a
  separate session. I only ever committed **`pm-studio-DrV.html`**; those files were
  already committed by that session and are on the branch.

## Deploy mechanism (IMPORTANT for next time)
The Firebase Hosting GitHub Action (`.github/workflows/firebase-hosting-deploy.yml`)
deploys to mathgrain.com on **push to `claude/review-project-docs-JOOeh`** only. Work
happens on `work/cardmaker-rowcopy`; to deploy you **merge work → that branch and push
it** (the established pattern — see its `Merge work/cardmaker-rowcopy → deploy` commits).
The deploy branch also carries CI-only commits (Node 24.16.0 pin + retry to dodge a
Node-24.17 googleapis token bug) that are NOT on the work branch, so **merge, never
force-push**. `scripts/ship.sh`'s 3-mirror convention is stale — don't use it.

## The data model (localStorage, uid-keyed by card dataset.uid)
- `cardMathParams_v1` = `{uid:[param]}`. param = `{sym, type:'int', mode, def, lo:{val,op},
  hi:{val,op}, restrictions:[], width}`. **`width`** = the space-box digit count (0 = off).
- `cardMathFormula_v1` = `{uid:{text, hidden:[syms]}}` — the f-formula. Convention:
  `expression = resultName` (result on the RIGHT, e.g. `A + B = C`).
- `cardMathRel_v1` = `{uid:{text}}` — relations.
- Orphaned (formula-field system deleted): `cardParFormula_v1`/`cardParContent_v1`/`cardParStyle_v1`.

Per-element state lives as ATTRIBUTES on the placed `<text>` (saved in svgContent):
`data-param` (the symbol, or `"formula"` for a printed formula) · `data-formula` (raw
formula, marks whole-formula substitution) · `data-align` (`left`|`center`|`right`,
default left) · `pm-param-svg` class. Instance-time scratch attrs (removed on clear):
`data-param-orig`, `data-orig-x`, `data-orig-anchor`, `data-ref-left/-width/-top`.

## What this session added/changed (newest first)
- **Per-element alignment** (`1177d0b`,`7ff6a8f`,`344856d`): each placed param / printed
  formula has `data-align` (default LEFT). Pressing 123 shows a **left/center/right
  toggle** pinned to the **template box's upper-left** (SVG→screen via getScreenCTM, so
  it stays put + clickable as the instance moves). The **template never moves**; only the
  **instance** shifts to align relative to the template's box (`_pmShowPlacedInstance`
  stashes the home x/anchor + box; `_pmPositionInstance` aligns; `_pmRestoreTemplate`
  restores home). Persisted via `data-align`.
- **f-Formula "Print on card"** (`917606c`,`535be69`): 🖨 button drops the WHOLE formula
  as one movable unit (`_fxPrintOnCard` → `<text data-formula data-param="formula">`,
  pretty operators via `_fxPretty`, **left-anchored & centered on placement**). Instance
  substitutes every symbol (`_pmSubstIdentifiers`) → `7−4=3`.
- **Space-box** (`8a9d970`): per-parameter Par-editor option (after Range) reserving a
  fixed digit width (proposed from the range, 0–100 → 3). Instances pad short values with
  a FIGURE SPACE (U+2007, not collapsed by SVG). `param.width`; threaded via
  `_pmGenEnvForCard` → `_pmShowPlacedInstance`.
- **Loupe "123" tag** (`363c855`): a 123 badge on the card's upper-left when it has ≥1
  parameter; click = instance, click = back to symbols (`_loupeToggleInstance` /
  `_loupeUpdateInstanceTag`, driven off `_loupeRenderParamsBar`).
- **Magnifier 🔍 ×N** (`c6893d3`,`acdc63a`,`3a0a92d`): VIEW zoom over the card's REAL size
  (`_loupeRealCardPx`, **×1 = 100px** for a 60-unit card via `_LOUPE_X1_PX`). Default =
  biggest ×N that fits; click the 🔍 to reset to default; bottom-left (z 2300) so the draw
  panel can't hide it. Loupe container = realPx × mag, so resizing the card keeps content
  size at a fixed magnification.
- **Card frame-resize** (`c6893d3`): corner ('se') handle = per-card `cardFrameScale` —
  the card grows (more empty space) with content at its absolute size; persists everywhere
  (`_frameViewBox`, `_applyShapeToPreview`, all save blocks, `buildCardFromMarkup`).
- **Parameters bar + drag-drop** (`0e3036f`,`0ab2c68`): a "Parameters" bar atop the loupe
  (`_loupeRenderParamsBar`); buttons are **draggable onto the card** (`_iDropParamAt`,
  drop zone via `_iWireCardDropZone`) and a copy stays. Loupe opens on the **Select/arrow**
  tool. The bar refresh runs BEFORE `saveCustomCards` (which could throw and skip it) and
  on every math-panel switch; z 2300.
- **Wide-card drag fix** (`0e3036f`): editor mouse→SVG mapping + drag clamp are
  viewBox-aware (`_loupeCardVB`/`_loupePointerToSvg`) — wide cards no longer pin elements
  to a narrow band.
- **Stale-equation cleanup** (`363c855`): orphaned `g.pm-baked` (from the deleted formula
  bake) is stripped on every render in `_pmApplyParamCards`.
- **Placed-letters-only** (`dcf4167`): the old on-card formula FIELD + per-param style
  POPUP + segment store + segment bake were DELETED (existing formula-field cards lose
  their on-card formula — agreed). See the 2026-06-25 handover for the removed-symbol list.

## Key functions (grep these)
`_loupeRenderParamsBar` · `_iDropParamAt`/`_iWireCardDropZone` · `_loupeUpdateInstanceTag`/
`_loupeToggleInstance` · `_pmGenEnvForCard` · `_pmShowPlacedInstance`/`_pmClearPlacedInstance`/
`_pmRestoreTemplate` · `_pmSubstIdentifiers` · `_pmApplyAlign`/`_pmPositionInstance`/
`_pmSyncAlignToggles` · `_pmDrawParamBoxes`/`_pmBakeParamBoxes`/`_pmStartLiveParamBoxes` ·
`_fxPrintOnCard`/`_fxPretty` · `_loupeRealCardPx`/`_loupeDefaultMag`/`_setLoupeMag` ·
`_frameViewBox`/`_loupeCardVB`/`_loupePointerToSvg`. The no-`eval` engine is the `_mp*`
cluster (`_mpGenerateJointEnv`, `_mpJointSpace`, …).

## Verification + ⚠ STILL TODO
All work this session was verified **headlessly** (preview MCP: seed stores + call the
functions, measure bbox/positions) and by screenshot — NOT by a real interactive loupe
session (the :8011 preview sits behind an admin-login gate; tests hide it). **The big open
item: a real-loupe pass on :8000** — place params/print a formula, drag, resize, magnify,
press 123, toggle alignment — to confirm the interactive paths. Smaller: elements placed
before the alignment/print changes may carry old anchors (re-place or toggle once).
