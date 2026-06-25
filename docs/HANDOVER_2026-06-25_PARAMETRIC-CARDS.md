# Handover — Parametric Math Cards ("Par" system) — 2026-06-25

Big multi-session build of a **parametric math-problem authoring system** in the
Card Maker. A card becomes a *template*: it carries named parameters (with ranges,
constraints, constructions) and a formula; the engine generates concrete problem
instances. All work is in **`pm-studio-DrV.html`** (no `js/sync.js` change).

## Where things are
- **Branch:** `work/cardmaker-rowcopy` (MAIN tree), pushed to `vkofman56/Vica_Domino`.
- **Tip:** `cae26af`. Working tree clean, everything pushed. **NOT deployed** to
  mathgrain.com (user said "not yet"; deploy only fires on push to the stale
  `claude/review-project-docs-JOOeh`).
- **Banner:** bumps only on commit (pre-commit hook). Last = **10:50 PM PDT** (`cae26af`).
  If the banner looks "old," it just means uncommitted work exists.
- **Servers:** two durable `nohup python3 -m http.server` — **:8000** and **:8011**.
  ⚠ **localStorage is per-port.** The user's real cards/data live on **:8000** —
  that's their home port. Use `http://localhost:8000/pm-studio-DrV.html`. Hard-reload
  (Cmd-Shift-R) after every push (a soft reload serves a stale cached page).
- **Convention (from [[branch-and-ship-convention]] / docs/HANDOVER_2026-06-23):**
  commit & push only when asked; `git push origin work/cardmaker-rowcopy`; **do NOT
  run `ship.sh`**; CLAUDE.md's canonical-trio convention is stale.

## The UI — left-rail box in the loupe (the "A C" card editor)
Five buttons (only visible when the loupe/card editor is open; hidden on icon edit):
- **Par** — create/edit parameters (the editor: symbol, range, constraints, Construct).
- **f** — player-visible formula (`A + B = C`), with per-symbol visible/hidden chips.
- **Rel** — relations between parameters (`A > B`), applied when generating.
- **▷** — Preview: generate N full instances; shows "K of N possible" (space size).
- **i** — Info palette: lists every parameter (incl. ones derived by the f-formula),
  hover = range+constraints; **clicking a parameter places it on the card** (see WIP).

Plus a **Text | Parameters** mode toggle at the top of the loupe (controls the
single-line on-card formula field's editability vs the draw/stamp tools).

## Data model — all localStorage, uid-keyed by card `dataset.uid`
- `cardMathParams_v1` = `{uid: [param,…]}`. param = `{sym, type:'int',
  mode:'direct'|'constructed', def (construction text), lo:{val,op}, hi:{val,op},
  restrictions:[{kind:'divisible'|'parity'|'prime'|'inset'|'exclude', …}]}`.
- `cardMathFormula_v1` = `{uid:{text, hidden:[syms]}}` — the f-formula.
- `cardMathRel_v1` = `{uid:{text}}` — relations (one per line).
- `cardParFormula_v1` = `{uid: "plain string"}` — the on-card formula, PLAIN mirror
  (read by instance/thumbnail logic).
- `cardParContent_v1` = `{uid: [{t:'text',v}|{t:'param',s}]}` — the SEGMENT model
  (the on-card formula as text runs + parameter chips).
- `cardParStyle_v1` = `{uid:{color,font,size, params:{sym:{color,font,size}}}}` —
  base style + per-parameter overrides. `size` is a RATIO of card width (keeps the
  same relative size in the loupe and on the grid thumbnail).

These stores are device-local (NOT in the sync.js LOCAL-WINS list), so they don't
sync device→device yet. Fine for single-superuser authoring.

## Engine (all in pm-studio-DrV.html, `_mp*` / `_pc*` / `_pf*` / `_ps*`)
- **Expression language, no `eval`:** `_mpTokenize` + `_mpImplicitMult` (so `10a`,
  `2k` work; `×`→`*`, `÷`→`/`) + `_mpEvalToks` (recursive descent: + - * / % ^,
  parens). `_mpParseDef` parses a Constructed definition into free vars / derived /
  relations / main; interval forms `name ∈ [lo,hi]` (`[]`=inclusive, `()`=exclusive),
  `name: lo..hi`, `lo<name<hi`. Result-line match is CASE-SENSITIVE (so capital main
  `A` and lowercase helper `a` don't collide).
- **Generation:** `_mpGenerate` (direct: range+restrictions), `_mpGenerateConstructed`
  (build from hidden sub-params), `_mpGenerateJointEnv` (sample ALL params, retry
  until relations hold), `_mpJointSpace`/`_mpValueSet` (exact problem-space count),
  `_mpGenerateOne` (one random value), `_mpRenderMath` (renders `a/b` as a stacked
  fraction with a horizontal bar — used in displays).
- **Convention:** main parameters = CAPITALS (auto-suggested A,B,C); lowercase =
  helper sub-params inside a construction.

## On-card rendering (this is the important architecture)
The parametric formula is **baked into the card's SVG** as `<g class="pm-baked">`
(`_pcBakeToSVG`): per-segment `<text>` (each chip its own color/font/size; magenta
`<rect>` box around params; non-breaking spaces preserve spacing). Because it lives
in the card's `svgContent`, it shows EVERYWHERE the card renders — Card Maker grid,
**A-Library preview**, library set view, and games — with no per-view overlay.
- `closeLoupe` bakes into the source card SVG + `saveCustomCards()` + refreshes the
  abc/numbers snapshots.
- `openLoupe` strips `g.pm-baked` from the loupe CLONE (the editable overlay shows it
  while editing; re-baked on close).
- `_pmApplyParamCards` lazy-bakes any parametric card's SVG on grid build and adds the
  clickable **"123" tag** (hover = "N possible instances"; click = one instance over
  the card). Runs after every grid rebuild + `openLibrarySet`.
- **EXISTING cards** made before baking: open+close the loupe once to bake their
  formula into stored `svgContent` (then the A-L preview / games show it).

## Styling
Per-parameter: `_pfStyleForSym(card,sym)` merges `params[sym]` over base.
Two ways currently exist (user chose to keep both, but see WIP):
1. **On-card style popup** (`_ps*`): in Parameter mode, click a chip in the formula
   field (or plain text) → inline color/size/font popup. (Committed `3aaf3d7`.)
2. **NEW direction (the user's latest ask):** parameters as **placed letters** styled
   with the *existing* draw tools — see WIP below.

## ⚠ OPEN / WIP — resume here (commit `cae26af`, "first cut")
The user's latest direction: **a parameter should be a normal letter on the card** —
placed, moved, scaled, given font/color with the EXISTING draw tools (the T-tool,
Select, transform, font/color controls) — just tagged as a parameter. They want to
KEEP the single-line formula field too.

Wired so far (NEEDS in-loupe testing on :8000):
- Clicking a parameter in the **i** palette → `_iStartPlaceParam(sym)`: enters draw
  mode, sets the text tool to the symbol, frees the card surface (formula overlay
  `pointer-events:none`). The next **click on the card** drops a `<text data-param>`
  letter (via the existing draw placement at the `drawTool === 'text'` branch, ~line
  8699 — tagged + `_pcMarkParamEl` adds class `pm-param-svg`). It's then movable/
  scalable/styleable with the normal draw tools.

NOT done yet:
1. **Magenta box on placed-letter params** — currently only tagged + a CSS class; no
   visible box that tracks the letter through move/scale (likely a `<g>` with text +
   rect, or a box recomputed on transform).
2. **Instance/Preview from placed letters** — `_pfBuildInstance` reads the formula
   FIELD/segments, not the placed `data-param` elements. Need to also substitute the
   placed letters' values.
3. **Coexistence** of the two systems (single-line formula field vs free placed
   letters) — confirm the intended UX with the user.

## Smaller open items
- Instance numbers don't yet inherit each parameter's per-param style (the parametric
  chips do; the concrete instance values use base) — the user wants "all the numbers
  it represents" to match the param's style.
- `saveNumbersSnapshot` doesn't exist (only `saveAbcSnapshot`); the snapshot refresh
  for the Numbers builtin set is a no-op (custom sets render `svgContent` directly, so
  they're fine once baked).

## This session's commits (newest first)
```
cae26af  parameters can be placed as letters on the card (first cut)  ← WIP
3aaf3d7  per-parameter styling via an on-card popup
60b9367  bake the parametric formula INTO the card SVG
534a904  formula size control + Text/Parameter modes with param chips
503603c  param chips on thumbnails (magenta), thumbnail size fix, legacy migration
2b74dc8  i (Info) parameters palette (Slice A)
7d1e804  i palette writes formula on the card face (Slice B)
142d05a  on-card formula fixes (stamps, style, tag position)
aec866f  math-input polish (intervals, symbols, fractions, UX)
7722cda  Slice 4 (Rel + Preview)
09f52fb  Slices 2 & 3 (Constructed params + f-formula)
43b2c28  Slice 1 (Direct params + Sample)
```

## How to verify in-preview (no login needed)
Hidden-DOM logic tests run via the preview MCP by setting `window.loupeSourceCard`
to a synthetic `.library-card` with a `dataset.uid`, seeding the `localStorage`
stores for that uid, and calling the `_mp*`/`_pc*` functions directly; visual checks
reparent a panel/`#loupe-overlay` to `document.body` (the real ones sit inside the
`display:none` `#domino-library-screen`). Always clean up synthetic cards + store keys.
