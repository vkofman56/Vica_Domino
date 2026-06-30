# Handover — June 29, 2026 — Counting overhaul, Info/Examples cards, Values parts, math-symbol editing

All in **`pm-studio-DrV.html`** on **`work/cardmaker-rowcopy`**, deployed to mathgrain.com by merging
→ `claude/review-project-docs-JOOeh` (**merge, never force-push**) and fast-forwarding the two mirror
branches (`claude/general-session-yVBQq`, `claude/resume-vica-domin-UOJun`) to the same tip.

Builds on the June 27–28 parametric session (`HANDOVER_2026-06-28_PARAMETRIC-CONSTRAINTS.md`). Most of
this was verified via `preview_eval` DOM/measurement on `:8011` (the param editor still doesn't render
in headless screenshots — a real eyeball pass on `:8000` is still the standing TODO).

---

## 1. Values = a list of PARTS (replaces the Range/Set/Both toggle)
- A parameter's domain is now a **dynamic list** of **range** and **set** parts, each add/deletable
  (**+ Add range** / **+ Add set**, × to remove). The domain is the **UNION** of them all — so: one
  range, one set, several ranges, several sets, or any mix. (`_mpDraftParts`, `_mpRenderParts`,
  `_mpPartsOf`, `_mpCandidatePool`, `_mpRangeBounds`.)
- The data model is `p.parts = [{type:'range',lo,hi,loOp,hiOp} | {type:'set',vals:[…]}]`. The FIRST
  range keeps the canonical ids `mp-lo/mp-hi/mp-lo-op/mp-hi-op`, so the place-value Construct helper and
  the space-box proposal (which read those) keep working; extra ranges get indexed ids. Aux listeners
  are re-bound after each render by `_mpBindRangeAux`.
- **`_mpPartsOf` migrates** every older model — single range, the short-lived `domain` (Range/Set/Both),
  and the even-older "In set" restriction — into parts, so existing cards generate identically. The
  "In set" constraint and the Range/Set/Both toggle were both removed.

## 2. Constraint-box tweaks
- **Divisible by k** is now a two-line box **"Div by k"** / **"k ∈ { set number(s) }"** holding a SET of
  divisors (`r.ks`); a value passes if divisible by ANY listed k. Empty = no restriction. Backward-compat
  with the old `{k, rem}`.
- **Prime / "not prime" → Prime / Composite** (composite = integer > 1 that isn't prime, so 0 and 1 are
  excluded).
- Constraint editor placeholder is **"one constraint per box"**; helper text under the box removed.
- **Construct place-value helper**: each digit `0–9` in a place is a **click toggle** (solid = in,
  struck-through = removed) so you can delete/restore individual digits; rewrites the def live. A full
  `{0–9}` place is shown compactly; editing happens inline.

## 3. Counting engine — exact, stable, always a number
- **`_mpJointCount` always returns a count** (no "too large to count"); `_mpFmtCount` formats anything
  > 1000 as a 3-significant-digit × 10^k (e.g. `7.29×10⁸`), with `≈` only when sampled.
- **Cross-parameter (micro-digit) constraints are now enumerated EXACTLY** when the space is small
  enough: `_mpJointSpace` expands each constructed param into its micro-witnesses (`A__a`, `A__b`) and
  checks `xc` relations in the cartesian enumeration — so a relation like `B ≤ b` gives a **stable**
  `150`, not the old wobbling sample (157/163/141…). Sampling (`≈`) only for genuinely huge spaces.

## 4. The answer parameter (formula RHS, e.g. `C` in `A + B = C`)
- **Excluded from the count and generation** — it's COMPUTED, not drawn (`_mpAnswerSyms`,
  `_mpFreeParams`). So `|A|×|B|`, not `|A|×|B|×|C|` (this is where a phantom 14400 came from instead of
  the real 495). `_mpGenerateJointEnv` now draws the free params and **computes** the answers into the env.
- **Its range is OPTIONAL** — `_mpValidateDirect` skips the range requirement for an answer (detected via
  `_mpAnswerExpr`); with no range it shows **"C = A+B"** in the Par list / Info card / i-panel instead of
  "(unset)".
- **A range, when set, NARROWS** the problems — `_mpAnswerChecks` + `_mpInParamDomain` keep only the
  `(A,B)` combos whose computed answer falls in the answer's range/set/constraints (applied in both
  `_mpJointSpace` and `_mpGenerateJointEnv`). Verified: `C∈[10,100]` cut the A1 card 150 → 136.

## 5. Reference cards per line — "Examples" and "Info"
Both share `_pmDropRefCard` (creates a static card after the source, `data-info='true'`, persisted &
skipped by the twin-scan). The **＋** buttons show a **✓ + dim/disable** after adding (re-enabled on
panel reopen / Generate) via `_pmSetMadeBtn`.
- **＋ Examples card** (Preview · Problems panel) → worked problems in NUMBER form (`_pmBuildInfoCardSvg`).
  Built exactly like a real on-card instance: the answer is computed in, each value is **space-box padded**
  with figure-spaces (`_pmExampleSvgBody`), examples are in **random order** (`_pmShuffle`), and the
  header rule + the count `(N)` sit on the first row.
- **＋ Info card** (i panel) → parameter summaries + relations, colour-coded (`_pmBuildParamInfoCardSvg`).
  Constructions are **multi-line** with only the **non-full** digit sets shown (`_pmConstructInfo`);
  relations render as coloured glyph chips (`<= → ≤`, micro `A__b` shown as `b` in A's colour —
  `_pmRelLineSvg`).
- **Transparency follows the visible/invisible (eye) choice everywhere** — `_pmParamHiddenSet`, NOT the
  formula answer. An invisible parameter (eye-off OR in the formula `hidden` set) is faded on the
  examples card (header symbol + its values), the Info card (its line + its symbol in relations), and the
  i-panel row. If nothing is invisible, nothing is faded.

## 6. Loupe / twin-scan / i-panel
- **Twin-scan keys on a parametric SIGNATURE** (`_cardParamSig` = params + formula + relations by uid)
  folded into `_dupTagGroups`' key — so cards with identical art but different parameters/constraints are
  no longer flagged as duplicates. Info/example cards are skipped.
- **Clicking a `<tspan>` selects its parent `<text>`** (`isSelectableElement`/`getSelectableElement`) —
  so coloured multi-part lines (`A+B=C`, `B≤b`) are grabbable/movable anywhere, not just on the gaps.
- **i · Parameters panel**: full per-parameter detail shown **inline** (range/construction/constraints),
  no hover needed; the "Everything about this card's parameters" sentence and the "Place on the card"
  section were removed.
- **Rel editable box**: coloured atomic chips, even spacing, operators inserted as glyph chips
  (`≤ ≥ ≠ ÷ ×`) storing the raw token (`_xcMakeOpChip`, `_xcReadEditable`).

## 7. Card text editing — one Math symbol set
- The **T** (text) draw tool's **Math** group is the single place for formula/relation glyphs:
  `+ − × ⋅ ÷ = < > ≤ ≥ ≠ ∈ ∉ ² ³ √ π` + the **fraction** (`a/b`) inlined at the end. **No parentheses**
  (keyboard). The duplicate "Word/Equation" symbol row and the Brackets section were removed.
- Each Math symbol is **dual-purpose**: inserts into the Word/Equation box when it's focused (mousedown +
  `document.activeElement` check), else places the single glyph on the card.
- **`_pmMathGlyphs()` is the single source of truth** — used by BOTH the T-tool Math group AND the
  **"Edit text"** dialog (`openInlineTextEditor`), so they can't drift apart again. (The 2-D fraction is
  added only in the T tool, since it can't go in a single-line text edit.)

## Data model recap (uid-keyed localStorage, device-local)
- `cardMathParams_v1` — params: `{sym,type,mode,def,parts:[…],lo,hi,restrictions,width,invisible}`.
  `parts` = the Values domain (ranges + sets); `lo/hi` mirror the first range for legacy consumers.
- `cardMathFormula_v1` — `{text, hidden:[…]}`. `hidden` = the invisible/answer symbols.
- `cardMathRel_v1` — `{text?, xc:[…]}`. `xc` = cross-constraint relation strings over qualified names.
- Reference cards carry `dataset.info='true'` (serialized as `cardData.info`, restored at the card-rebuild
  sites + skipped by the twin-scan).

## Still TODO / watch-outs
- **Real eyeball pass on `:8000`** — the param editor panel never renders in headless screenshots, so all
  verification was DOM/measurement via `preview_eval` (conclusive) — worth a visual confirm.
- The **Examples-card insert-into-equation-box** path (Math symbols → Word/Equation input) couldn't be
  focus-tested headlessly; it uses the standard mousedown/`activeElement` pattern (place-on-card verified).
- **Gameplay exclusion of info/example cards isn't wired** — they carry the `info` flag and are skipped by
  the twin-scan, but a game could still include one. Wiring the flag into the game-card collection is a
  follow-up.
- Cross-constraint counts are exact only up to the enumeration cap (~500k combos); beyond that they
  sample (shown with `≈`). An exact micro-level count for huge xc spaces is possible but not built.
