# Handover — June 27–28, 2026 — Math-Problems worksheets, parametric editing, cross-constraints, place-value Construct

All in **`pm-studio-DrV.html`** on **`work/cardmaker-rowcopy`**, deployed to mathgrain.com by
merging → `claude/review-project-docs-JOOeh` (**merge, never force-push**). Deploy-branch tip after
this session: ~`bc61523` (+ this docs commit). Everything below was verified live in the loupe on
the `:8012` preview (a real interactive pass — the long-standing "real-loupe TODO" is now done).

This builds on the June 25–26 placed-letters parametric system (see
`HANDOVER_2026-06-26_LOUPE-PARAMS.md` and `[[parametric-cards-feature]]`).

---

## 1. "Math Problems" — a worksheet game type
- **GM → + New Game → Math Problems** (`_showGameTypeChoice` adds it; the `math` type routes to
  `wsOpenGenerator()` instead of the card-selection flow). The old standalone "Generate Page" button
  was removed.
- The generator overlay (`#ws-overlay`, injected once by `_wsEnsureDom`) is the **interactive
  worksheet**: Title · Problems-per-page · Attempts · Source-card dropdown. `_wsGenerate(cardEl, n)`
  drives the **real engine** via `_pmWithCard` → `_mpJointSpace`/`_mpGenerateJointEnv`/`_fxBuildFromEnv`.
- **Solve flow** (agreed): while attempts remain, show only the mistake COUNT (not which);
  after the last attempt, reveal WHICH are wrong (red); **never reveal the answers** (a wrong cell
  keeps the student's value). Stable geometry (reserved mark slot). Title-only header.
- The **game maker does NOT edit cards** — it uses each card's stored config; the source dropdown
  lists the set's parametric cards.
- A standalone prototype lives at `worksheet-demo.html` (reference only).

## 2. Card copy carries parametric data
- `_pmCopyCardMathData(srcUid, dstUid)` deep-copies `cardMathParams_v1` + `cardMathFormula_v1` +
  `cardMathRel_v1` onto a copy. Wired into `copyCardInRow` (after the new uid is minted). Enables
  problem-card / answer-card on one line, and alt problems on another line.

## 3. Visible / invisible parameters (the eye)
- Per-parameter **eye toggle** in the loupe Parameters bar — the **GP0 eye icon** (`_LOUPE_EYE_SVG`,
  slashed `_LOUPE_EYE_OFF_SVG` when invisible). Invisible = the answer/blank; the placed letter
  renders **half-transparent** on the card (`_pmApplyParamVisibility`, opacity 0.4 — live + baked).
- **Stored on the parameter** (`param.invisible`, persists with or without an f-formula, carried by
  copy) AND mirrored into the formula `hidden` set when a formula exists. The union is read by
  `_pmParamHiddenSet`. (Bug fixed mid-session: the eye did nothing on formula-less cards because the
  old code only wrote the formula hidden set, which `_fxSave` drops when there's no text.)

## 4. "Print on card" = separate movable parts (not one fused text)
- `_fxPrintOnCard` now places each parameter as its own `data-param` `<text>` and each operator as a
  plain `<text>`, on one line at standard distances. Per-parameter dimming + per-letter moving work.
- **Space-box drives the box + the layout**: the magenta box and the inter-part gap reserve the
  parameter's largest instance (`param.width` digit-slots). The digit width is **measured**
  (`_pmDigitRatio` ≈ 0.5 of glyph bbox height — cached), NOT estimated from height; the earlier
  `0.78×height` guess over-reserved ~55% and left a huge gap after a slot-filling value.
- **Auto-fit**: the whole printed line scales down to fit the card width (font + draw-size shrink
  together), so it never overflows regardless of parts / reservations.

## 5. Multi-select loupe editing
- **Marquee** (`_loupeStartMarquee`): drag on empty card space → selects every element it touches
  (skips `pointer-events:none` decoration like the magenta boxes). Plus existing **Shift+click**.
- **Group drag-move** (`_dragGroup`): dragging any selected element moves the whole selection by the
  same delta (relative layout preserved). Bulk delete/copy/font/colour/size already used
  `getAllSelectedElements`.

## 6. Constraint-language additions (engine)
- **`≠`** button (the glyph is accepted as `!=` in both the construction parser and `_relParse`).
- **`Int()`** = integer part (floor), plus `floor/ceil/round/abs` — the expression evaluator now
  supports function calls (`_MP_FUNCS`/`_mpIsFunc`; implicit-mult and `_mpIdsIn` skip function names,
  so `10a` still works and `Int` isn't treated as a variable).
- **Value SETS** in constructions: `a ∈ {0,2,4}` and `{0, 1, …, 9}` (ellipsis auto-expands via
  `_mpExpandSet`). Parsed in `_mpParseDef` (`freeVars[name] = {set:[…]}`), enumerated and sampled in
  `_mpGenerateConstructed`.
- **Undeclared variables default to a digit [0,9]** — writing just `A = 10a + b` makes `a`,`b` real
  micro-parameters without a separate range line (the place-value case); declare a range to override.

## 7. Colour-coding
- `_pmParamColor(sym)` — by capital letter: **A magenta · B orange · C blue · D green · E red**,
  cycling through more hues. Applied to: the on-card box (`_pmDrawParamBoxes`), the Parameters-bar
  chips (`_iMakeParamBtn`), the Par list (`_mpShowList`), the micro-param chips (`_mpRenderMicros`),
  and the cross-constraint chips.

## 8. Cross-parameter constraints (Rel panel) — colour-chip → typed → numbered boxes
The Rel panel evolved across several iterations this session; the FINAL state:
- **Constrains micro-parameters across Big parameters** (e.g. `Int(A/10) ≠ Int(B/10)` — the tens
  digits differ; or `a-of-A ≠ a-of-B`). Stored on the Rel cfg as **`xc`** — an array of relation
  **strings** over **qualified names** (`A__a` = A's micro `a`). Legacy `{l,op,r}` objects still read.
- The **builder**: colour chips (Big params + their micros, inserting `A` / `A__a` at the caret),
  an insert row **`= ≠ < > ≤ ≥ ÷ × Int`** (all white, one line), and a **typeable field** (type
  numbers / parens yourself). Each relation is its **own numbered grid box** (`1.`, `2.`, …) with a
  **"Save relation N"** button that appears once the box has content; after saving a fresh empty box
  appears. The free-text relations box was removed (legacy `cfg.text` migrates into `xc` on open).
- **Enforcement** (`_mpGenerateJointEnv`): each Big parameter's micro-params are exposed under
  qualified names (`A__a`, …) via **`_mpGenerateOneWithEnv`** (which keeps the constructed sample's
  witness env), and the xc relations are checked in the retry loop. Cards with xc **sample** rather
  than enumerate (`_mpJointSpace` returns `{capped:true}`) because enumeration loses the small-param
  witness. xc is carried by a card copy.

## 9. Place-value decomposition helper (Construct)
- From the parameter's **range** it suggests `D = 100a + 10b + c` with a digit set per place; the
  **leading digit reflects the range** (`500<D<1000 → a∈{5..9}`; `_pvCompute`). Shown **ghosted**
  (opacity 0.5) with a checkbox; **ticking the first line** makes it "alive" and writes the
  construction (`_pvApply` → the hidden def). **Recomputes the moment the range changes** even while
  active (`_pvOnRangeChange`) — raise the max to 999 and it becomes `100a+10b+c` instantly.
- Digit sets are **plain compact math sentences** (`a∈{0,1,2,3,4,5,6,7,8,9}`, no spaces so each fits
  one line), with **1px** breathing room between the param/operator tokens and **1px+1pt** around the
  `∈`. Main line **14px**, digit lines **13px**. Edit a set in the construction box below
  (e.g. delete the leading `0`). `_pvLoadFromDef` restores the helper from an existing place-value def.

## 10. Construction edited as numbered rule boxes (like Rel)
- The multi-line textarea (`#mp-def`) is **hidden but kept as the data source**; `#mp-rules` renders
  it as **numbered boxes** — one rule per box, each removable, **click a box to edit it**. An editable
  grid box with a **"Save rule N"** button adds the next rule (Enter also saves). The symbol bar
  (`× ÷ ∈ ≠ Int() frac`) inserts into the **active rule box** (`_mpRuleInput`).
- **The place-value decomposition is Rule 1** (its helper box, labelled "Rule 1 — …"); its lines are
  **excluded** from the rule boxes so additional rules start at **rule 2** (no duplicate box).

---

## Data model (uid-keyed localStorage, device-local)
- `cardMathParams_v1` — params: `{sym,type,mode,def,lo,hi,restrictions,width,invisible}`; constructed
  params hold `def`; free vars can be ranges or `{set:[…]}`.
- `cardMathFormula_v1` — `{text, hidden:[…]}` (the f-formula; `hidden` = the answer/blank symbols).
- `cardMathRel_v1` — `{text?, xc:[…]}` — `xc` = cross-constraint relation strings over qualified names.

## Still TODO / watch-outs
- The param **editor panel did not render in headless `:8012` screenshots** all session — all
  verification was via `preview_eval` DOM/measurement (conclusive), not screenshots. Worth a real
  eyeball pass on `:8000`.
- Place-value **leading digit includes 0** for ranges like `10–999` (since `A=10` → `a=0`),
  consistent with `1<D<1000 → a∈{0..9}`. Delete the `0` (or use `100–999`) for strictly 3-digit.
- `index.html` / `biggame.html` are a SEPARATE parallel session's work — only `pm-studio-DrV.html`
  is committed here.
