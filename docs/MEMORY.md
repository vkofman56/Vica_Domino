# Vica Domino Project Memory
**Last Updated**: June 4, 2026 — ⚠️ RECOVERY SITUATION (read the banner below FIRST)

---

## ⚠️ READ FIRST — June 4, 2026 — uncommitted-work recovery in progress

**Situation:** Nothing has been committed since **May 28** (commit `b76930f`). The
entire **May 30 → Jun 4** session (`fb852b27…`, **244 edits** across 7 files,
+2282/−255 lines) sits **uncommitted** in the working tree — a direct violation of
the project's own commit/push rules (SESSION_HANDOFF Rule 1). The user reports that
this week's changes **broke unintended things**, and wants to find & undo the
regressions without losing work.

**Do NOT** run any destructive git op (`reset --hard`, `checkout .`, `stash` of the
whole tree) until a safety checkpoint exists. The current tree is **under review** —
do not assume it is "good" or "bad".

**Recovery assets (all safe, outside the repo):**
- **Transcript backup (read-only):**
  `/Users/victoriakofman/CLAUDE CODE/_recovery_transcripts_backup/snapshot_20260604_195112/`
  — the 3 session `.jsonl` files (the complete, ordered edit log: every Edit/Write
  with full old/new text), + subagents + memory. THIS is the recovery key — git has
  no checkpoint between May 28 and now, but the transcripts let us reconstruct any
  past file state.
- **Change tables** in `/Users/victoriakofman/CLAUDE CODE/_recovery_transcripts_backup/`:
  `CHANGELOG_uncommitted.html` (grouped by the user's request, color-coded by file),
  `CHANGELOG_uncommitted.csv` (sortable in Numbers), `CHANGELOG_uncommitted_since_May28.md`.
  244 edits ↔ 98 distinct user requests.

**Key anchors:**
- Clean baseline = `b76930f` (May 28 22:25 PDT = 2026-05-29T05:25:50Z). Filter edits
  with transcript timestamp **after** that cutoff to get the uncommitted set.
- Uncommitted work is ONE session: `fb852b27` (May 30–Jun 4). The other two
  transcripts (`6bc5b668` May 22–29, `e4a9cf67` May 14–21) are OLD/committed.
- Three branches must stay byte-identical: `claude/review-project-docs-JOOeh` (dev),
  `claude/general-session-yVBQq`, `claude/resume-vica-domin-UOJun`.

**Agreed plan (user is leaning to "on-demand time travel"):**
1. SAFETY FIRST — tag the current full state, branch from `b76930f`.
2. Reconstruct files as of a chosen point (baseline + transcript edits up to time T),
   user verifies, then **commit that verified "time-back point."** Advance to the next
   point, verify, commit. Builds a clean chain of verified checkpoints.
   - Alternative / faster: surgical per-bug revert — user names a broken behavior, we
     find the few edits touching it (via the change tables/transcripts) and revert just
     those.
3. Caveats: cosmetic shell-driven changes (banner time, `?v=` cache-busters) aren't in
   the edit stream, so a replay reaches a *functionally* identical state with a possibly
   stale banner; occasional old_string-mismatch on replay needs a manual nudge.

**Tomorrow starts with:** the user reviewing the change tables to spot regressions,
then telling us which request/row to act on. **Before acting, make the safety
checkpoint.** And going forward: **commit + push to all 3 branches regularly** — this
whole mess is from not doing that.

**DECIDED — prevention setup (do AFTER the first recovery step tomorrow):** build the
two forcing functions so the daily-commit rule can't depend on memory again:
- **#1 Auto-snapshot hook** — a Claude Code `SessionEnd` (and/or `Stop`) hook in
  `.claude/settings.json` that runs a script: if `git status` shows uncommitted
  changes, commit them to a `wip/auto-<date>` branch and push. This is the guarantee
  (worst case = lose one session, not a week).
- **#2 `scripts/ship.sh`** — replaces the bump-trial-only ritual: bump banner →
  `git add -A` → commit → push to all 3 branches. Used after each meaningful change so
  clean intentional commits happen at change-frequency.
Root cause of the lapse (for context): the rule lived only in docs (memory-dependent),
the built-in default is "don't commit unless asked," it was one 5-day session with no
natural boundary, and running `bump-trial.sh` *felt* like shipping but only rewrites a
banner. Fix = automation, not discipline.

**Also already in the uncommitted tree (this session's fixes, under review):** sync
`local-wins` guard for `pageNameLabels_gp2`/game keys (`js/sync.js`), page-name id-vs-key
mismatch fix (`index.html` ~line 602 skip `_gpManagedIds`), Start-summary observer
re-assert (`index.html`), no-cache `<meta>` tags in both HTML heads, Prob-delete UX +
Delete-Game dialog + dot-tag/badge polish (`pm-studio-DrV.html`).

---

## June 2, 2026 (cont.) — Studio Prob/Delete UX + dot-tag polish + a sync gap

All in **pm-studio-DrV.html** + **css/style.css** unless noted. Play-by-play in
STATUS_NOTES June 2 (cont.).

### Start-page options summary — final visual pass (index.html)
- The 4-row summary (`_renderStartSummary`) is now PLAIN: **Timer** = the word
  `on`/`off` (no toggle picture); **Probability** = the preset name only (no
  chip box); **Level** = difficulty + descriptor (`Easy 2 dominos`); **Type**
  unchanged. Difficulty from the level shape: **circle=Easy, triangle=Medium,
  star=Hard** (the code already calls triangle the "Medium" bubble).
- **Context-aware rectangle:** the chart draws a 1px bordered box ONLY when the
  Level buttons are visible (the catch-mouse Setup-page case); its RIGHT edge is
  pinned (live `getBoundingClientRect`) to the **`.level-btn-wrapper`** right
  edge — that wrapper carries the rounded background, the inner `.level-btn` is
  just the icon (measure the wrapper, not the btn, or the box is too narrow and
  text wraps). On the GP… Start page (Level buttons hidden) → no rectangle.

### Probability dot-tag (`.mcard-badge` + `.pmode-flag`)
- Grey flag darkened `rgba(120,120,140,0.92)` → `rgba(84,84,100,0.96)`.
- **Dot-only tag centers the dot**: keep the dot+1-digit WIDTH via a hidden
  placeholder reproducing dot+gap+digit, and absolutely-center the visible dot
  (`left:50%;top:50%;translate(-50%,-50%)`) — the badge is `position:absolute`,
  so it's its own containing block. Numbered tags keep the dot left + number.
- **`•p` mode button** (`#game-view-mcard-btn`): dot (6×6, was 4×4) shifted
  `left:-2px`, the `p` raised `top:-2px`, dot uses `currentColor`.

### Prob-delete UX (the big one)
- **Per-Prob delete is now discoverable.** Each `.prob-chip` gets a visible
  `×` (`.prob-chip-x`) — always shown on the ACTIVE chip, on hover for others,
  `pointer-events:none` when hidden so touch can't hit an invisible ×. Plus a
  real right-click / long-press context menu (`_openProbCtxMenu`, reuses
  `_ctxItem`/`_ctxClose`/`_ctxPosition`) with **Rename / Delete**. Replaced the
  old confusing chained `confirm()` where *Cancel* meant *delete*.
- **⚙ Manage chip** (`.prob-chip-manage`, shown when ≥2 Probs) → bulk
  `_openManageProbsDialog` (multi-select, Select-all, "Delete selected (N)"),
  prunes Probs but KEEPS the game.
- **"Delete Game" is now a Prob picker** (`_deleteCurrentGameFlow` →
  `_openDeleteGameDialog`), wired from the in-view Delete Game button (find +
  catch). Lists Probs one-by-one, then an **"All Probes"** row. Subset → prune
  Probs, keep game. **All Probes → whole-game delete** (calls the original
  `deleteGame`/`deleteCatchGame` with their rich warning). With <2 Probs it goes
  straight to the whole-game delete. Final wording: heading "Check the Probes to
  delete", no separate "delete entire game" button.
- Redesigned dialog uses dedicated **`.dgx-*`** CSS (custom rounded checkbox +
  ✓, whole-row click toggles, red-tint selected row, trash header icon, ghost
  Cancel + solid red Delete) — replaced the ugly native checkboxes.
- The three deletion scopes are intentionally separate: **chip ×** = one Prob,
  **⚙ Manage** = bulk prune (keep game), **Delete Game** = picker incl. all→game.

### ⚠️ Sync gap — games are NOT protected from a stale cloud (UNFIXED)
- **Symptom seen:** Previewer showed only 2 Find games while the Studio library
  showed 6 (games "deleted from GP 0, still in A-L"). It self-resolved (stale
  tab), data was never lost.
- **Root cause (js/sync.js ~378–393):** on load, if cloud has data, sync WIPES
  every localStorage key except META/ROLE and replaces with the cloud copy,
  preserving ONLY card keys (`customDrawnCards*`, `cardMakerVariations`,
  `cardArrangement*`, `abcCardSnapshot`). **`savedCustomGames` /
  `savedCatchGames` / `savedCombinedGames` are NOT preserved** → a stale/smaller
  cloud copy silently overwrites local games. Both index.html and pm-studio load
  the same sync.js + Firebase, so either tab can trigger it.
- **Not caused by the Prob/Delete UI work** (that only touches one chosen game).
- **Proposed fix (user deferred):** mirror the card guard for the three game
  keys — preserve local when the cloud copy is empty/missing. (Won't fix a
  smaller-but-non-empty cloud conflict; that's a deeper merge problem.)
- Immediate user recovery: **Download Backup** in the Studio captures the full
  localStorage snapshot (incl. games) before any re-sync.

### Cache-busters
- `css/style.css?v=dgx-redesign-1` (bumped through prob-chip-delete-1 →
  prob-manage-1 → dgx-redesign-1) in BOTH index.html + pm-studio.

---

## June 2, 2026 — Previewer Setup polish + Start-page options summary

All in **index.html** (Game Previewer). Play-by-play in STATUS_NOTES June 2.

### Setup page (GP{m|t} {F|C} Setup) polish
- **"Frequency" → "Probabilities"**, left-aligned with "Timer". Prob chips:
  named → `"N. Name"` (e.g. `1. MainProb`), unnamed → `ProbN`. Heading +
  chips render even with **one** Prob set (gate is `length < 1`). Chips widen
  to the full "Probabilities" title width (`width:100%; box-sizing:border-box`).
- **Catch level icons must be bubbles in BOTH modes.** The bubble-label/SVG +
  `_fillCatchLevelBubbles()` block was mouse-only — split it so it runs for
  touch too (touch was showing dominoes).
- **Player-box icon for Catch** (`#setup-game-icon`) = the FILLED Medium
  (triangle) bubble cluster (1 big + 3 small) cloned and scaled up, carrying
  the game's pictures — never dominoes. Clone the **filled** level button and
  run `_pbUniqueIds()` to suffix all ids (clipPath/gradient collision fix),
  else the cluster renders empty.
- Titles (Level/Type/Probabilities) **top-aligned** (`.setup-columns` is
  `align-items:flex-start`); first prob box dropped to align with Level/Type.

### Start pages — read-only OPTIONS SUMMARY (`_renderStartSummary`)
- On every Start page (player-names visible), the **UPPER box (Box 1)** shows a
  4-row read-only summary: **Timer** (toggle picture + on/off), **Probability**
  (the selected `.player-prob-chip`), **Level** (selected level label), **Type**
  (`.setup-type-line.selected` or `window._currentTypeBehavior`).
- **Box geography matters (cost me a round-trip):** `#setup-game-icon` lives
  inside **Box 2** (`.setup-box-2`) = the *player* box (icon sits above the
  avatars). The "box above the player box" the user means is **Box 1**
  (`.setup-box-1`), where game.js drops `#selected-options-row` (the "N dominos"
  level chip). The summary renders into **`#selected-options-row` within Box 1**;
  Box 2's `#setup-game-icon` is restored to the game icon every time.
- **Level label is a SIBLING of `.level-btn`** inside `.level-btn-wrapper`, not
  a child — `selectedBtn.querySelector('.level-label')` returns null. Reach up
  via `.closest('.level-btn-wrapper')` then read `.level-label` (fallback to the
  button `title`). Symptom of getting it wrong: "Level —".
- **One MutationObserver on `#player-names` style** covers all show-points
  (find/catch × mouse/touch × all player counts): always calls
  `_syncSetupGameIcon()` (Box 2 icon); when visible also `_renderStartSummary()`
  (Box 1); when hidden, hides `#selected-options-row`. The observer fires as a
  microtask *after* game.js's synchronous `showStartScreen` builds the level
  chip, so the summary overwrite wins.

### Lessons
- **Verify which box an element belongs to before rendering into it.** I put the
  summary in `#setup-game-icon` assuming it was the upper box; it's the first
  child of the player box. A 2-line `getBoundingClientRect`/`contains()` eval in
  the preview settled it instantly.
- Preview sandbox has **no game data** — Start/catch flows can't be driven live.
  Verified the summary by injecting representative selections + reading
  `#selected-options-row`. User must confirm Probability/Level on a real game.

---

## May 31, 2026 — Game Previewer page names + Game Studio polish

Two files: **index.html** (Game Previewer / player) and **pm-studio-DrV.html**
(Game Studio). Play-by-play in STATUS_NOTES May 31.

### Game Previewer (index.html) — page-name persistence
- **One applier for every page label:** `window._gpApplyLabel(el, key, default)`
  sets `el.dataset.gpKey`, loads the saved value (or default), normalizes
  🖱→M / ✋→H. A document-level **capture-phase delegated save** (on
  `focusout`) persists under `_pnKeyOf(el)` = `dataset.gpKey || id`. Store:
  `localStorage['pageNameLabels_gp2']`.
- **Keys = per (page-kind × type × mode [× player-COUNT for Start/Board]).**
  Setup `setup-{find|catch}-{mouse|touch}`; Start (player-names)
  `setup2-{F|C}{m|t}{count}`; Board `board-{F|C}{m|t}{count}` (catch overlay
  `board-catch-{m|t}{count}`). **Dominoes (2/3/4) and the "+timer"(xeno)
  variant are NOT in the key** — they share one name; only the player COUNT
  splits Start/Board.
- **Defaults:** Setup `GP{m|t} {F|C} Setup`; Start `GP{m|t} {F|C}{count} Start`;
  Board `GP{m|t} {F|C}{count} Board`. Mode lives in the `GPm`/`GPt` prefix.
- **Shared-name edit = confirm-on-blur with EXACT scope** ("Rename the Setup
  page of Find games in Mouse mode?"), Cancel reverts. Scope built from the
  label's key by `_gpDescribeKey`. It must NOT be a blocking `alert()` *while
  typing* — that steals focus from the contenteditable and commits a partial
  value (was the "reverted to GP F43" bug).
- **Stale-label fix:** opening a Setup (find OR catch) now shows the Setup
  label and HIDES any leftover `setup2-page-label`, so a prior game's
  `GPm F1 Start` can't hang over the next game.

### `_catchGame.inputMode` is NEVER assigned — use the globals
The catch board read `_catchGame.inputMode` (always `undefined`) so both
modes collapsed to `GPt`/touch and leaked names. **Mode truth = globals
`_catchInputMode` / `_findInputMode`** (set by the single intro Touch/Mouse
toggle via `_setInputMode`; device-aware default). Same globals drive the
GPm/GPt prefix everywhere.

### Game Studio (pm-studio-DrV.html)
- **Game-view zone columns** (`_renderZoneRow`) =
  `[sep | letterCell | red | nodot/neutral | green]` → grid
  `[letter, red, neutral, green]`. Two builders: **`openGameView`** (Find),
  **`openCatchGameView`** (Catch). Column headers = 4 `.gv-col-header` cells
  prepended to the grid (Find: Top Cards / Neutral / Bottom Cards; Catch:
  Frozen Bubbles / Neutral / Falling Bubbles; grayish, 13px, weight 500).
- **Probability badge** (`.mcard-badge`) + the unedited **grey flag**
  (`.pmode-flag`) are designed to sit IDENTICALLY — change BOTH together.
  Label from `_groupDisplayLabel` (now capital **P** / **P1, P2…**). The badge
  renders a **dot** (4px circle, `currentColor`) in place of "P": badge is
  `inline-flex; align-items:center; padding-left:2px` so the dot is 2px from
  left + vertically centered; a numbered group adds the number after a 1px
  gap; a dot-only badge reserves a 1-digit-wide invisible placeholder so it
  matches the dot+1-digit width (2-digit grows). Badge at `right:-7px`,
  font 10px.
- **Icon `→G` "to Group" button** (`.icon-send-btn`): per-(gameType ×
  sizeClass) px nudges via shared `_iconBtnShifts` + `_applyIconBtnShift`
  (x = right+, y = down+). Copy/delete badges share the "corner" sub-map.
- **Find has ONE icon type (L1)** → its "L1" label is suppressed everywhere:
  IC chip (`_renderMppIconsRow`, gameType!=='find'), Card-Maker template inner
  label + caption (`_buildIconCardElement`), context menu ("Copy to icons →
  Find the Double", no "(L1)"). Catch keeps L1–S3.
- **IC size chip** moved to a centered cell BELOW each thumb (wrapper div,
  `position:static` on the chip).
- **Zone brackets** (inline CSS atop the `<style>`): colored spines via
  `box-shadow` insets + `::before`/`::after` full-width gradients painting an
  8px prong at EACH end → a full `[ ]` on BOTH sides per zone (red + green).
- **Group line under grouped cards** = inset 4px each side: transparent 6px
  `border-bottom` holds the space, `.gv-grp-line::after` draws the bar
  (`var(--gv-grp-color)`).

### Lessons
- **Never block a contenteditable edit with `alert()`/`confirm()`** — steals
  focus, commits a partial/old value. Use a non-blocking toast, or confirm
  **on blur** (after editing).
- **Two pseudo-elements, four prongs:** a full-width `::before`/`::after` with
  a gradient (color 0–8px, transparent middle, color last 8px) draws a prong
  at BOTH ends — one element brackets both sides.
- **Match-by-design pairs:** `.mcard-badge` ↔ `.pmode-flag`, and the
  per-(type×mode) page keys — touch one, touch its twin.
- Most badge/header/bracket work is **inline** (JS `cssText` or the `<style>`
  block in pm-studio) → reloads with the HTML, NO `style.css` cache-buster.
  Only bump `css/style.css?v=…` (in BOTH index.html + pm-studio) when you
  actually edit `css/style.css`.
- Verify pixel-exact UI by building a throwaway sandbox in the live page
  (Claude Preview) + screenshot / `getBoundingClientRect()` — caught the
  dot-width match (18.38 = 18.38) and the bracket/header/dot looks.
- **Treat the user's "pt" as px** for these nudges (they're tiny UI offsets);
  flag the assumption.

---

## May 30, 2026 — Card Maker: rubber-band select, insert-line, row keys past Z

All `pm-studio-DrV.html` (Card Maker). See STATUS_NOTES May 30 for the
blow-by-blow; this captures the durable facts + lessons.

### What shipped
- **Rubber-band (marquee) select.** Drag a box over empty grid space →
  touched `.library-card`s join `groupEditSelected` / `.ge-selected` — the
  SAME passive selection Shift+click builds and the right-click group
  Copy/Move/Delete verbs already consume. So marquee = a faster selector,
  not new verbs. Marquee IIFE sits next to the card-drag IIFE; they don't
  collide (card-drag arms on pointerdown over a card, marquee on empty
  space). `marqueeJustEnded` guards the click handler. Shift+marquee adds.
- **Never-collapse cross-set move/copy.** A multi-line selection becomes
  one new row PER SOURCE ROW in the target (`_groupCardsBySourceRow`), not
  one merged row. Move keeps `stableId`; copy mints fresh ids.
- **Insert empty line above/below** (`_insertEmptyLine`, right-click menu).
  Model A: shift the occupied run from the insert point up to the first
  free key DOWN one key, drop a BLANK card at the freed key.
- **Row keys past Z**: A–Z then aA–zZ (702). Helpers `_rowKeyParse` /
  `_rowKeyNext`.

### Durable facts (don't relearn these)
- **A row exists only if it holds ≥1 card.** Rows are rebuilt from card
  data on load (`buildNumbersCardSet` groups by first-letter). So an
  "empty" row can't persist on its own — it must carry one blank-art card.
  This is why `_insertEmptyLine` creates a blank card, and why the
  `addNewDrawnCard` "new card on a new row" path already worked.
- **A card's label = rowKey + position** (`renumberRow` writes
  `rowLetter + n`). Relabeling (move/insert/shift) does NOT touch
  `stableId` — it's a stored attribute, so game wiring (which references by
  `stableId`) survives any relabel. This underpins model A and Safe Haven.
- **Label suffixes like `C1_2`** are text-markers (`A2_5+3` =
  rowKey+position+`_`+SVG text), re-derived from the card art — not
  meaningful identity; `renumberRow` normalizes them away.
- **Row-key scheme sorts by plain string compare** (uppercase 65–90 <
  lowercase 97–122), so `insertRowAlphabetically` / `sortRowsAlphabetically`
  just had `toUpperCase()` removed — no length-aware comparator needed.
- **`_geFlash` is invisible without a selection** — it writes to
  `#group-edit-status` inside the `display:none` Group-Edit toolbar. Use
  `alert()` (or show the toolbar) for feedback on no-selection actions.

### Lessons (process)
- **`beforeunload` calls `saveVariations()`** (saves the live DOM). So
  editing localStorage directly while a stale DOM is rendered, then
  reloading, lets the stale DOM clobber your storage edit. Fix BOTH storage
  and DOM (rebuild from storage) before any reload.
- **Don't test destructive ops on real card sets.** A live `insert` test
  mutated the real Numbers set; it was reversible (deterministic un-shift),
  but use a disposable/seeded set for move/insert/delete verification.
- Pure helpers (`_rowKeyNext`/`_rowKeyParse`) are unit-testable headless via
  the JavaScriptCore `jsc` binary — cheap correctness before any DOM test.
- **ALWAYS bump the deploy stamp after editing the studio.** Run
  `bash scripts/bump-trial.sh` (writes current LA time into the
  `HH:MM AM/PM PDT` banner next to "Library", 5 sites across
  pm-studio-DrV.html + index.html). The user reads that stamp to confirm a
  reload actually loaded the new code — a stale stamp = they're seeing old
  code. The pre-commit hook auto-runs it on commit, but when handing the
  user a file to reload WITHOUT committing, bump it manually or they can't
  tell the change landed.

### Row insert/delete + data repair (May 30 cont.)
- **Insert is gap-absorbing** (`_insertEmptyLines`). It walks up from the
  insert point collecting occupied rows until it finds `count` FREE keys, so
  an existing gap (deleted row) soaks up the insert instead of shoving every
  row above it. Earlier "shift everything ≥ insertLetter" version mangled
  sets that had gaps ("inserted below D, D vanished, E appeared").
- **`repairRowsFromArt(setName)`** (+ `window.` + auto-offer on set open via
  `_maybeOfferRowRepair`): rebuilds row labels from each card's DRAWN letter
  (SVG `<text>` marker = ground truth; labels AND even stableIds had drifted).
  Groups by uppercased letter, sorts upper-before-lower, relabels `rowKey+N`.
  Auto-offer is gated to mostly-single-letter sets so number/dot sets never
  trip it. **It MUST force a rebuild of the on-screen rows after writing
  storage** — otherwise the stale DOM lingers and the `beforeunload` save
  clobbers the repair on reload (this exact thing made an "OK" silently do
  nothing for the user, twice). The clobber trap is the #1 recurring footgun.
- **Games survive relabeling**: games wire to cards by `stableId` (sticky,
  never regenerated on renumber), not by label. Insert/shift → games
  unaffected. `_deleteLine` sends game-used cards to Safe Haven (kept), only
  deletes unused ones. Confirmed: shift preserves stableId byte-for-byte.

### Row-key scheme is FULLY migrated (May 30 cont.) — REQUIREMENT: up to ~400 rows
User confirmed real educational sets can grow to **300–400 rows**, so the
A–Z→aA–zZ scheme (702 cap) is a hard requirement, not a nicety. The first
pass only migrated the *core* row fns, which caused a **regression**: the
set-BUILDERS (`buildNumbers/Abc/CustomCardSet`, `buildNumbers/AbcPreview`,
`selectCustomSet`) grouped rows by `label.charAt(0).toUpperCase()`, so an
overflow card `aA1` → `'A'` and **merged back into row A on reload**
(scrambled the user's ABC set; data was intact, only the on-reload grouping
was wrong). Now migrated everywhere a row key OR a label-number is derived:
- New helper **`_labelNum(label)`** = numeric part after the key (`aB3`→3);
  replaces the old `label.substring(1)` (which assumed a 1-char key).
- Routed through `_rowKeyParse` / `_labelNum`: all 3 builders + 3
  preview/select builders, `getNextNumber`, `generateCopyLabel`,
  `addVariation`, `renumberVariations`, `loadVariations`, new-card-mode
  detection, `_groupCardsBySourceRow`, the row-name dialog title,
  `_effectiveRowLetter` (game read path), zone bucketing.
- **Gotcha that bit us:** `copyCardInRow` did `(row.dataset.rowLetter || …)
  .toUpperCase()` → `aA`→`AA`; a grep for `.charAt(0).toUpperCase()` missed
  it. Sweep for ANY `.toUpperCase()` on a rowLetter/label expression.
- Verified on overflow rows: rebuild keeps `aA` separate, `getNextNumber`,
  copy, and add all produce correct `aA-N` labels; row A not polluted.
- Intentionally left A–Z (soft limit, no corruption): `addEmptyGameRow`
  (Game Creator +Row) input regex; two dead `_effectiveRowLetter` inline
  fallbacks; display-only capitalizations (font names, usage titles).

### Still open
- Verb-gating by selection shape (drop within-set "Copy to other row";
  disable multi-line "Move to row" flatten). Drag-to-insert between rows
  (thin layer over `_insertEmptyLine`). "Delete this line" + count-aware
  "Insert empty line(s)" shipped. Empty-row policy (delete last card →
  keep blank / remove row / block) still undecided. `addEmptyGameRow` +Row
  still single A–Z.

## May 28, 2026 — Catch gets Prob Options; columns replace red/green dots

Big follow-on: the whole probability feature now works for **Catch**
games too (it was Find-only), and the red/green **dot button** is gone —
the colored **columns** carry the zone now.

### Zone columns are now color-coded (Studio editor)
The Game-View 3-column layout (`.gv-zone[data-row-zone="red|nodot|green"]`,
inline CSS near top of pm-studio) gained colored "rail" lines so each
column reads as red (LEFT) / green (RIGHT), neutral plain:
- Outer edges = faint white (`rgba(255,255,255,0.18)`); the two INNER
  boundary lines carry colour — red on the red/neutral edge, green on
  the neutral/green edge.
- Each inner line is a directional **bracket**: red `]` (top+bottom
  prongs point LEFT, into the red column), green `[` (prongs point RIGHT).
  Prongs are `::before`/`::after` (8px long, set `display:block` to beat
  the legacy `.library-row[data-row-letter]::before{display:none}` rule),
  z-index 5 so they sit above cards.
- Red is `rgba(255,110,110,0.85)` (line + prongs, 2px); green
  `rgba(60,200,90,0.9)` (2px). Shared `.gv-zone` → shows in Find AND Catch.

### Red/green DOT button + on-card dots RETIRED (Find + Catch)
- The toolbar dot button (`game-view-freeze-btn`) is kept hidden in both
  `openGameView` and `openCatchGameView`; `_freezeModeActive` forced off.
- `renderFreezeIndicators()` is now a **no-op** (clears stray dots only) —
  no red/green dots drawn on cards.
- UNCHANGED: `_freezeState` data + **drag-between-columns** (which sets it
  in `_renderZoneRow`), so zones / two-channel probs / deck+spawn builders
  all still work. (`cbef723`)

### Prob Options now work for Catch (was Find-only)
Two stages. The probability MODEL is identical for both types
(red = static/top, green = falling/bottom, neutral = both).

**Stage 1 — Studio Catch editor (`a56dcf1`):** the chip strip, `p`
badges, weight badges, zero-prob dimming, p-mode flag, group popup, and
per-Prob exclusions all work for Catch now. The fix was mostly removing
Find-only guards and routing through the already-neutral
`_getCurrentViewGame()` / `_saveCurrentViewGames()` plumbing
(`_renderProbChipStrip`, `_switchActiveProb`, `_createNewProb`,
`_resetToBasicS`, `_showProbChipMenu`, `_applyZeroProbDimming`,
`applyMWeightBadges`, `_applyPModeFlags`). `openCatchGameView` now runs
`_migrateGroupProbsToCards` + `_migrateGameToProbOptions` and mirrors the
active Prob's excludedDominos to the legacy key. `_autosaveActiveProbForGame`
takes the view index and runs for both types. `_activeProbForExcluded`
generalized to the open Find OR Catch view.

**Stage 2 — Catch Player spawn (`b60219a`):** the Catch engine was
role-only (`_freezeState`) and ignored the numbers; now it **weights by
probability** and **0 = never appears**.
- `openCatchPlayModal` calls `_gpApplySelectedProb(game, idx,
  window._gpSelectedProbId)` before building `valueGroups`.
- New helpers `_catchRedProb`/`_catchGreenProb` (red=static weight,
  green=falling weight; frozen→green0, floating→red0; missing channels
  default 100/50) + `_catchPickWeighted` / `_catchSampleWeighted`.
- `_catchStartRound` + `_catch2pStartRound` pick static / match /
  distractor cards via weighted sampling, dropping 0-prob cards, with
  graceful fallback ladders.
- `_renderPlayerProbSelector(gameIndex, type)` generalized; the Catch
  setup screen (`goToMainPage` + `_reapplyCurrentSetup`) shows the
  "Frequency" selector for 2+ Probs. Catch remembers the pick and applies
  it at launch.
- **Gotcha fixed (`2995d6a`):** the Frequency host `#player-prob-select`
  lives INSIDE `#setup-timer-col`, which `_applyTimerSwitchForGameType`
  hid wholesale for Catch — so the picker landed in a hidden column. Now
  the timer switch hides only the timer heading + toggle for Catch, and
  `_renderPlayerProbSelector` reveals the column when it shows the picker.
- Backward compatible: Catch games never opened in the new Studio still
  play (no probOptions → `_gpApplySelectedProb` no-ops, channel defaults).

### Studio hover tooltips (`febff38`)
Native `title` tooltips don't render in the embedded preview pane (and
never on touch), so a small custom tooltip (`#studio-tip`, event-delegated
over `.zoom-btn`, `.prob-chip*`, `.help-trigger-btn`, etc.) shows an
instant bubble sourced from each control's `title` (lazily moved to
`data-tip`, `aria-label` kept).

### Open follow-ups
- Player **cards-library legend** (index.html `_buildCardsLibraryRow`)
  still shows red/green freeze STRIPS + a legend — left as-is (the
  retirement was about the Studio dot button + on-card dots).
- Player has no "?" page-help system (tooltips only) — by user's call.

---

## May 28, 2026 — Two-channel probability + help/tooltip audit

Follow-on polish after Prob Options. Three things landed:

### 1. Homogeneous two-channel per-card probability
Every card carries BOTH halves of its frequency, the same way regardless
of dot state, so a whole column stores identically:
- `_probRed` = LEFT / top-half weight (0–100)
- `_probGreen` = RIGHT / bottom-half weight (0–100)

Both channels ALWAYS exist (0 = "off in that zone"); migrations never
delete one. `_freezeState` selects which are live: `frozen` → red/top
only, `floating` → green/bottom only, undefined (neutral/no-dot) → both.

- **Groups are convenience only.** `mGroups[] = {id, name?, members[]}`
  let the user edit one probability and apply it to all members, plus
  carry a name. `group.probability` is **deprecated**;
  `_migrateGroupProbsToCards(game)` pushes any legacy group prob into
  member card channels once (frozen→_probRed, floating→_probGreen,
  neutral→both) then `delete g.probability`. Idempotent, runs in
  `openGameView` after `_migrateGroupsAndProbabilities` (which is now
  homogeneous too — never drops a channel).
- **Editor popup** `_showGroupPopup`: neutral card → two controls (LEFT
  + RIGHT) via `_buildProbControl(sideLabel, initVal)`; red/green → one.
  Range 0–100. Save writes channels to ALL members + autosaves.
- **Deck builders** (`_computeCardZoneInstancesStudio`, Player
  `_computeCardZoneInstances`): group-prob override REMOVED; read card
  channels, GCD-reduce per (row, zone). Match 0-4: 11090 → 1258 copies.
- **Weight badge** (`applyMWeightBadges`, when 1/M ON): `pr` / `pg` /
  `pr/pg` (e.g. `70/30`) `×N`. Dimming reads channels directly.

### 2. p-mode marker only recolours on edit
`.pmode-flag` (in `_applyPModeFlags`) now matches `.mcard-badge`
geometry exactly (`top:13px; right:-2px; 8px font; 1px 3px pad; 3px
radius;` + same text-shadow). Un-edited = neutral grey
`rgba(120,120,140,0.92)`; editing turns it a palette colour in place —
no more jumping corners / resizing. (`70166be`)

### 3. Help + tooltip audit
- `_helpContent.gameview` rewritten to match the live toolbar and cover
  probability: `MPP`→`IC`, `M`→`p`, plus new entries for the p / p1,p2
  badges, the LEFT/RIGHT editor, the `70/30 ×N` weight badge, and the
  `BasicS / Prob1 / +Prob` chip strip.
- Added missing tooltips: Studio Library `+` (new card set) and
  delete-mode button; Player "Frequency" heading + preset chips.
- **Player (`index.html`) has no "?" page-help system** — tooltips only.
  Studio's `showPageHelp(page)` covers library / gameview / cardmaker /
  cardeditor. Open question whether the Player should get one.

---

## May 27, 2026 — Prob Options (9-stage feature, Find only)

A second large rework after the 8-stage probability rework. "Prob
Options" let an admin author **several named probability presets per
game**; the player picks one in the Game Previewer and the gameplay
deck rebuilds from it. Find games only for v1 (Catch deferred). All
commits on `claude/review-project-docs-JOOeh`, mirrored to the two
sibling branches.

### Design (locked with the user before building)

- A **Prob** stores, per card: a **zone** (red / no-dot / green) and a
  **probability** (red/green channels, 0–100). Two channels always
  exist; the off-channel is 0 in a single-color zone, so the user
  usually sees one number. 0 is allowed = "card absent from this Prob."
- **BaseState** ("BasicS") = all cards neutral / 50-50; a reset target,
  not a stored Prob.
- Editor is **always inside one active Prob**; new games auto-get Prob 1
  on first edit. Autosave (no explicit save button).
- **Per-Prob**: cardZones, cardProbs, mGroups, excludedDominos.
  **Per-game** (shared across Probs): the player/levels/types/timer
  setup matrix, the card SET itself.
- Add a card → lands neutral/50-50 in every Prob. Delete a card →
  choose "delete from all Probs" or "just zero it in the active Prob."

### Data model

```js
game.probOptions = [{
  id, name?,
  cardZones: { <key>: 'red'|'green'|'nodot' },
  cardProbs: { <key>: { red:0..100, green:0..100 } },
  mGroups:   [...],            // same shape as legacy game.mGroups
  excludedDominos: [...]
}]
game.activeProbOptionId
```
`<key>` = `u:<uid>` > `s:<stableId>` > `l:<label>` (helpers
`_probCardKey` / `_resolveCardForKey` in Studio, `_gpProbCardKey` in
the Player).

### The 9 stages

| # | Stage | Commits |
|---|---|---|
| 1 | Data model + idempotent migration (`_migrateGameToProbOptions` builds Prob 1 from the current cards/mGroups/excludedDominos localStorage; runs in openGameView). Helpers `_getActiveProb`, `_materializeProbIntoCards`, `_writeActiveProb`, `_snapshotProbFromCurrent`. | `650f529` |
| 2+3 | Editor chip strip `[BasicS][Prob1*][Prob2][+Prob]` + Prob switching + autosave. `_renderProbChipStrip`, `_switchActiveProb`, `_createNewProb`, `_resetToBasicS`, `_autosaveActiveProbForGame` wired into `saveGameViewOrder` / `_saveFreezeView` / `_saveCurrentViewGames`. Also added a local `saveCustomGames()` helper (none existed). | `50b7398` |
| 4 | Allow probability = 0: popup + inline `%` editor min 1→0, zero-prob cards dim (`.prob-zero-card`, `_applyZeroProbDimming`, group-aware), deck builder honors honest 0 (skip pair when copies≤0). | `543f0da`, `7a1df2c` |
| 5 | Delete-card 3-option dialog (2+ Probs): "Delete from all Probs" (`_purgeCardFromAllProbs`) / "Just set to 0% in ProbN" / Cancel. | `2db0915` |
| 6+7 | mGroups per-Prob (already worked via the Stage 2/3 mirror) + excluded dominoes per-Prob (`getExcludedDominos`/`saveExcludedDominos` route through the active Prob via `_activeProbForExcluded`; legacy key kept mirrored for the Player). | `e765b95` |
| 8a | Player deck builder honors the selected Prob: `startCustomGame(idx, btn, probId, skipSetupRender)` → `_gpApplySelectedProb` rewrites in-memory card zones/probs, swaps mGroups, stashes excluded. | `45eff50` |
| 8b | Player "Frequency" chip selector below the timer toggle on the setup screen (`_renderPlayerProbSelector`; chip click rebuilds deck with `skipSetupRender=true` so level/player picks survive). | `7704a7f` + UI tweaks |
| 9 | This docs entry. | — |

### Badge rename (during the feature)

`M`-for-Match badges retired. Single card with a custom probability →
lowercase **`p`**; multi-card group → **`p1, p2…`** (numbered among
multi-card groups only, no gaps). Prob Option chips spell out **`Prob1,
Prob2`**. Toolbar mode button `M` → `p`. Helper `_groupDisplayLabel`.
(`d72488e`, `96b63cd`)

### p-mode per-card flag

In probability mode, every card without a group badge shows a clickable
`p` flag; clicking opens the editor (size-1 group seeded with the card's
current prob, removed on cancel). `_applyPModeFlags`, `_editSingleCardProb`.
(`fbe37ac`)

### Deprecation decision (Stage 9)

`game.mGroups` and the `excludedDominos_<idx>` localStorage key are
**kept, not removed** — they serve as fallbacks for games without
probOptions (Catch games, or Find games never opened in Studio) and as
the Player-facing mirror until a future Catch rollout. The active Prob
is the source of truth in the Studio editor; the legacy fields are
mirrored on save / view-open.

### Player-side Frequency selector — final layout

After several nudges: heading "Frequency" (#fff, 1.3rem bold, matching
the Timer/Levels h3s), relative-offset up; chips Prob1/Prob2 stacked
vertically, width 65%, left-aligned with the timer pill, dropped 9pt
below the heading. Lives inside `#setup-timer-col` under the toggle.

### Files

- `pm-studio-DrV.html` — all editor stages, helpers, chip strip, dialogs
- `index.html` — Player deck materialization + Frequency selector
- `css/style.css` — `.prob-chip-*`, `.player-prob-*`, `.prob-zero-card`
- `docs/*` — this entry

---

## May 26, 2026 — header & library polish (evening addendum)

After Stage 8 closed out the 8-stage rework, a short polish pass on
the page headers and the Library row. Five small commits, all pushed
to the 3 mirror branches.

### Pub/Unpub toggle disabled, Game Previewer shows all games (`e06b53b`)

User: publishing isn't implemented, so the Pub/Unpub button on each
Library row does nothing meaningful and "Unpub" games were hidden
from the Game Previewer (hiding work-in-progress games).

Changes:
- `populateLibraryGames` no longer renders the `.publish-toggle-btn`
  for Find or Catch rows. The `game-unpublished` fade class on the
  game-name button is also dropped so every name reads at full
  opacity.
- Four `if (game.published === false) return;` filters removed —
  pm-studio `populateIntroGames` (Find + Catch branches) and
  index.html intro (`findList` + `catchList` branches).
- The `published` field on game objects is left intact in localStorage
  so re-enabling the feature is a one-line revert per site once
  publishing actually ships.

### AGC label: shrink 10%, bottom-align with game name (`0b2b96b`)

`#a-game-view-label` ("AGC-Found" / "AGC-Catch" — the faded page
label in the Game Creator header) was 28px and pinned at `top: 6px`,
floating above the game-name H1's baseline.

- CSS override: `font-size: 25.2px` (= 28 × 0.9) + `line-height: 1`.
- New JS helper `_alignAGCLabelToGameNameBottom()` measures
  `#game-view-title.getBoundingClientRect().bottom` minus the
  label's own height, sets `label.style.top` so `label.bottom ===
  gameName.bottom`. Wrapped in `requestAnimationFrame` so it runs
  after layout settles.
- Called from both `openCatchGameView` and `openGameView` right
  after `_alignGameNameToGameTypeIndicator` (the existing horizontal
  aligner from the May 24 session).
- Bumped `style.css` cache buster `icon-fallback-title-1 →
  agc-label-shrink-1`.

### GP 0 title row shifted 15pt down (`7fdd6b0`)

The "MathGrain Game Preview" h1 + TOUCH/MOUSE toggle on `#intro-screen`
(GP 0, the welcome page) overlapped the top-right Saved / Sync
status pill.

- Added `margin-top: 15pt` to `.intro-title-row` (the flex container
  wrapping both elements) — they shift down as a unit, clearing the
  sync indicator.
- Cache buster `agc-label-shrink-1 → gp0-title-shift-1`.

### Drop "TRIAL" prefix from the deploy-time banner (`7c8f15c`)

User: the header should just be the time, e.g. `10:34 PM PDT`, not
`TRIAL 10:34 PM PDT`.

- Stripped "TRIAL " from all 5 banner sites: index.html intro +
  start screens, pm-studio admin-id splash + admin home + Library
  title.
- `scripts/bump-trial.sh` now:
  - Writes `NEW_BANNER="${NEW_TIME}"` (no prefix)
  - Match regex `(?:TRIAL\s+)?\d{1,2}:\d{2}\s+(?:AM|PM)\s+(?:PDT|PST)`
    — optional TRIAL prefix so any legacy banner that slips back in
    (rebase, branch merge) gets normalized on next commit.
- The pre-commit hook continues to re-run `bump-trial.sh` whenever
  either HTML file is committed, so the time stays fresh.

### Library (A-L) timestamp font 20% smaller (`77a1f93`)

Inline span next to the "Library" h1: `font-size: 36px → 28.8px`
(= 36 × 0.8). Other 4 banner sites left at their existing sizes
(28px on Player intro/start, 14px on pm-studio splash + admin home).

### Files touched

- `pm-studio-DrV.html` — copy-game, library rows, AGC aligner JS,
  cache busters, banner sites, library inline-style font
- `index.html` — intro filters, GP 0 title row CSS hook, banner sites
- `css/style.css` — `#a-game-view-label` override + new helper,
  `.intro-title-row` margin
- `scripts/bump-trial.sh` — bare-time format + permissive regex

---

## May 26, 2026 — 8-stage probability rework + critical Player fix

Long multi-day session. The user wanted a rework of how M-groups
("Match groups") interact with deck generation: instead of being a
visual-collapse mechanism, groups become a UI shortcut for bulk
probability editing, and each card carries an independent probability
that biases its deck representation. Eight stages, plus a steady
trickle of polish and three significant bug fixes.

All commits land on `claude/review-project-docs-JOOeh` and are
mirrored to `claude/general-session-yVBQq` and
`claude/resume-vica-domin-UOJun` per the project's 3-branch safety
net.

### Stage 1 — Data model migration

`_migrateGroupsAndProbabilities(game)` runs at the top of openGameView
/ openCatchGameView (idempotent):

- **Per-card probability**: each card gets `_probRed` and/or
  `_probGreen` (1–100). Defaults:
  - `_freezeState === 'frozen'`   → `_probRed: 100`,  no `_probGreen`
  - `_freezeState === 'floating'` → `_probGreen: 100`, no `_probRed`
  - no dot                        → `_probRed: 50, _probGreen: 50`
- **mGroups schema**: legacy bare-array members → object form
  `{id, name?, probability, members: ident[]}`. `probability` defaults
  to 100. `id` is `'g_' + Date.now() + '_' + random6`. Members stay
  in the same `"u:<uid>"` / bare-label format Stage-0 left them.

Two compatibility helpers used everywhere downstream:
- `_mgMembers(g)` — returns members array regardless of legacy/new shape
- `_findCardByMGroupIdent(cards, ident)` — resolves uid or label to a card

### Stage 2 — 3-column row layout (red / no-dot / green)

Each row in the Game Creator now renders as a CSS Grid with four
visible columns: separator, letter, then three "zones" sharing
identical widths via `grid-template-columns: auto auto auto auto`.
Zone cells are tagged `data-row-letter` + `data-row-zone` so the
drag handler can read the zone the user dropped into:

```
zoneToFreeze = { red: 'frozen', green: 'floating', nodot: null };
```

When a card crosses zones during a drag, `saveGameViewOrder` resets
its freeze state AND zeroes the previous-zone probability fields so
the new-zone defaults take over (the 50/50 split survives only as
long as the card stays in the no-dot column).

Polish layered in during this stage:
- 2-line "red cards" / "no dot" / "green cards" placeholders in
  empty zone cells; first drop into a cell clears the placeholder
- Zone cells are never removed on drag-out (only their contents
  change). The legacy drag-end logic that removed `.library-row`
  when empty was guarded against `dataset.rowZone` so zone cells
  survive
- Shift-click multi-select inside `_gvMultiSelected` Set → bulk
  drag of selected cards
- Per-row delete button (red `×` next to the letter cell)

### Stage 3 — Group / probability popup

Click any colored M-badge → `_showGroupPopup(groupIdx)`:

- Name field (optional free text)
- Probability field (1–100 number + 10-step quick-pick buttons)
- Member count + sample labels
- Save / Cancel / Ungroup-all buttons

Critical bug worth remembering: `getMCardGroups()` re-parses
localStorage on each call, so the `grp` reference captured at
popup-open is from a stale clone. Save must look up the LIVE entry
at save time via index:

```js
var allGroups = getMCardGroups(currentGameViewIndex);
var liveGrp = allGroups[groupIdx];
// ...mutate liveGrp...
saveMCardGroups(currentGameViewIndex, allGroups);
```

Originally the save also prompted "M-N has the same probability —
merge?". User pushed back hard: **groups are only created by
explicit user action**. Removed the entire merge branch. Two groups
sharing a probability now simply coexist (commit `a902c78`).

### Stage 4 — P%×N badge in 1/M collapsed view

When the 1/M button is ON, every visible card gets a small dark
`P%×N` pill in the top-right corner:

- **P** = group probability (1–100), or 100 if ungrouped
- **N** = group's member count, or 1 if ungrouped

Painted by `applyMWeightBadges()` at the end of `applyCollapsedView`
(both the no-groups branch and the main branch) so toggling 1/M
paints/clears in lockstep. Torn down during `_showAllCardsForShape`
so it doesn't overlap shape-editing handles.

Polish: the percent number is its own `.mcw-pct` span, clickable.
Click → inline number input → Enter/blur commits, Escape reverts.
On commit, `_setCardProbability(cardIdent, newProb)` either updates
the existing group's probability or creates a size-1 group carrying
just this card (commit `6832b95`). The badge as a whole keeps
`pointer-events:none` so card drag still works through it; only
the number span opts back in.

### Stage 5 — GCD-reduced instance counts in deck builder

The core change. Each card now contributes `(topInst, botInst)`
copies to the deck:

Priority for the probability source:
1. `mGroup.probability` if the card is in a group with `probability` set
2. Card's own `_probRed` / `_probGreen` (set by Stage 1 migration)
3. Default 100

Mapping to top/bottom instance counts:
- `_freezeState 'frozen'`   → topInst = P, botInst = 0
- `_freezeState 'floating'` → topInst = 0, botInst = P
- no dot                    → topInst = P_red, botInst = P_green

After raw counts, GCD-reduce within each `(row, zone)` bucket so the
smallest count in a bucket is 1. Pair-emit multiplies:

```js
copies = topInst(top) × botInst(bottom);
for (var cp = 0; cp < copies; cp++) customDeck.push(...);
```

**Backward compatibility**: when every card has prob 100 (the
default), GCD = 100 → every card becomes 1 instance → deck is
identical to pre-Stage-5. Existing games behave exactly as today
unless probabilities are explicitly varied.

Three call sites updated, all using the same `_computeCardZoneInstances`
helper (duplicated as `_computeCardZoneInstancesStudio` in pm-studio
because Studio and Player don't share a JS module):

| File | Function | Behavior |
|---|---|---|
| `index.html` | `startCustomGame` | Emits N copies per pair → weighted draws |
| `pm-studio-DrV.html` | `rebuildGameViewDominos` | One tile per unique pair, attaches `_copies` |
| `pm-studio-DrV.html` | `startCustomGame` | Same multiply-emit as index.html |

`domino.js getShuffledDeck` is unchanged — it returns a uniform
shuffle of `customGameDeck`, so duplicated entries naturally weight
the draw.

**Deck-size note**: when a game's probabilities are coprime (Match
0-4 has `{5, 8, 13, 30, 60, 75, 80, 100}`), GCD can't reduce much
and the deck grows fast — 11,090 entries for Match 0-4. This is
mathematically correct (a prob-100 card SHOULD appear 20× as often
as a prob-5 card) and `shuffleArray` is O(N) so perf is fine, but
if it becomes an issue an across-pair scaling cap is the next step.

### Stage 6 — ×N count badge on Show Dominos tiles

Each unique-pair tile in Show Dominos shows a small dark `×N` badge
in the top-right when the pair contributes more than one entry to
the gameplay deck. The data (`_copies`) is set on the `allDominos`
entries by Stage 5's `rebuildGameViewDominos`; Stage 6 just renders.

Reads `domino._copies` in `buildGameViewDomino`, appends a
`.domino-copies-badge` div when `> 1`. Tooltip: "Appears N times in
the gameplay deck (weighted by per-card probability)."

Default behavior unchanged: with all probs 100, every pair has
copies=1 and no badge renders.

### Stage 7 — Cross-row color consistency (verified) + palette extension

**Verification (the original goal)**: every color-assignment site
in the codebase derives the badge color from `palette[gi % len]`
where `gi` is the position in the global `mGroups` array. So a
group spanning multiple rows always resolves to one color regardless
of which row a member lives in. Confirmed structurally and at
runtime — Match 0-4's M3 (spans rows B+E) and TEST 1's M7 (spans
C+D+E) each show one consistent color across all members.

**Bonus finding**: with only 8 palette slots, games with 9+ groups
wrap around — M9 reused M1's yellow, and x2 x4 with 21 groups had
3-way collisions on every base color. Extended palette to 12 in
both `pm-studio _mGroupColors` and `index.html
_CARDS_LIBRARY_M_COLORS`:

| Slot | Color | Notes |
|---|---|---|
| M9  | `#3D5AFE` indigo | distinct from M4's cyan-blue |
| M10 | `#76FF03` lime   | distinct from M3's emerald + M1's yellow |
| M11 | `#FF4081` hot pink | distinct from M2 red + M6 magenta |
| M12 | `#6D4C41` brown  | low-sat anchor, off the rainbow |

Wrap still happens at M13. Algorithmic HSL hue rotation
(`hue = gi × 137.5° mod 360`) is the next escalation if the user
hits it.

### Stage 8 — This docs update.

### Significant bugs caught + fixed during the rework

**1. CRITICAL — Player deck always empty (`46d5953`).** The user
reported "no dominos in the game" with a Game Over screen.
Diagnosed: index.html `startCustomGame` had a filter
`if (!c.svgMarkup || !c.svgMarkup.trim()) return;` that dropped
every card. Post-Stage-1 cards are trimmed of inline svgMarkup and
reference the central card-set store via stableId. `getGameCardSVG`
already handles both shapes (inline first, then `_gpResolveBySid`
fallback) — the filter just denied it the chance. Fix:
`if (!getGameCardSVG(c)) return;` instead. Studio was unaffected
because it uses `getGameCardSVGWithFallback`. Pre-existing bug,
surfaced by Stage 5 testing. **Stage 5 itself was not the cause.**

**2. Card-delete sweeping siblings (`aa208c5`).** Deleting a single
4-dot card removed every card sharing its `stableId`.
`Array.filter` with `stableId === stableId` removed all siblings.
Fix: new `_findRemoveIdx(cards)` returns ONE index preferring
`gameCardIdx → uid → first stableId → first label`; caller does
`splice(idx, 1)`.

**3. Test 1 / legacy games showed 6 player buttons instead of 4
(`2259ede`).** Games saved before the per-game setup feature have
no `setup` field. `_applyGameSetupToPlayerScreen` early-returned
after `_resetGameSetupLabels` (which restores ALL 6 static HTML
buttons to visible). Initial fix: hardcoded 4-button fallback
(`_applyFallbackPlayerButtons`). Upgrade (`9bb8f41`): runtime-
clone the setup from `DEFAULT_FIND_GAME_TEMPLATE = 'Match 0-4'`
instead, so legacy games render with the full template config.
Hardcoded 4-button view kept as final safety net.

### Other polish (smaller commits)

- **M2/M6 same red (`614bea4`, `9ae7421`)**: pink `#F50057` at
  palette index 5 read as red next to vivid red at index 1.
  Replaced with purple `#AA00FF`, then user requested more pink
  tone → `#D500F9` (Material purple A400).

- **Size-1 groups (`fab2284`)**: previously single cards had no
  path to set name / probability. Relaxed `createMCardGroup` to
  accept 1+ selected, kept size-1 groups through `ungroupMCard`'s
  filter, adapted popup title ("Edit card A3 (M5)") and destructive
  action ("Clear" instead of "Ungroup all") for size-1.

- **Copy-game preserves all settings (`9bb8f41`)**: `copyGame` /
  `copyGameAndEdit` were enumerating fields and silently dropping
  anything added later (setup, published, MPP config, …). Switched
  to `JSON.parse(JSON.stringify(game))` like `copyCatchGame` has
  always done.

- **Sync race (carried from prior session)**: `SYNC_DEBOUNCE_MS`
  reduced from 2000 → 350 in `js/sync.js`; `beforeunload` flush +
  warning for in-flight changes.

### Files touched

- `pm-studio-DrV.html` — primary file (Stage 1–8 changes, palette,
  popups, badges, copy-game, group-edit logic)
- `index.html` — Player deck builder (Stage 5), palette sync, setup
  fallback + Match 0-4 template, svgMarkup filter fix
- `js/sync.js` — earlier-session sync race fix (referenced for context)
- `docs/MEMORY.md`, `docs/STATUS_NOTES.md` — this entry

### Cache-busters

No JS/CSS file edits in this session (everything was inline HTML
script), so no cache-buster bumps required.

---

## May 24, 2026 — M-card semantics overhaul + Game Creator polish

Long session. Started with row/icon polish in the Game Creator, then
pivoted into a deep rework of the M-card grouping system and the domino
pair generator after a user-reported duplicate-domino bug exposed a
chain of label-based identity assumptions. All commits land on
`claude/review-project-docs-JOOeh` and are mirrored to two sibling
branches per the project's 3-branch safety net.

### 1. Times 2_ up to 7 — missing rows / +Row affordance

Cards added via "Add Card" carry an `_addedToGame: true` flag that
parked them in a single "+" staging row at the bottom of the Game
Creator. With 18 cards spanning 5 letters in this game, the staging
row was a dumping ground and the user couldn't see rows A, B, C, D, E
nor create them via the top-bar +Row button ("letter already in use").

Three additions, all in `pm-studio-DrV.html`:

- `_autoPromoteAddedCards(game)` runs at the top of openGameView /
  openCatchGameView. Walks game.cards, drops `_addedToGame`, splices
  each card after the last existing keeper with the same first letter
  (inheriting its `_gameRow`), or appends as a new row. New-letter
  batches sort alphabetically so they appear A, B, C… instead of in
  physical click order. Persists if anything changed.
- `_sortRowsAlphabetically(game)` runs right after promotion. Buckets
  cards by first letter, sorts A→Z, re-flattens, re-assigns
  `_gameRow`. Also sorts `game.emptyRows`. Idempotent.
- `_appendAddRowAffordance(container)` — a small dashed-green "+"
  button rendered as a `.library-row` so it lines up under the
  letter column (verified at left=143 = same as `.library-row-letter`
  span). Same handler as the top-bar +Row.

### 2. Game Creator title row swap

`Game Creator <span.game-creator-type>FIND THE DOUBLES</span>` lived
indented 40px while the editable game name sat flush at the row's left
edge. User asked to flip: "Game Creator" at the left, game name under
the white-caps indicator. Done by dropping `margin-left: 0` on the
H1, plus `_alignGameNameToGameTypeIndicator()` — measures the indicator's
post-layout left position inside rAF and sets a matching `margin-left`
on the game-name H1. Robust to text-width changes ("FIND THE DOUBLES"
vs "CATCH THE MATCHING BUBBLE").

### 3. Freeze/float dot duplicate-label bug (root cause + audit)

User reported: in "Match 0-4" row A she couldn't put different
red/green dots on duplicate cards (three "0"s and two blank cards).
Root cause: `handleFreezeCardClick` and `renderFreezeIndicators` looked
up cards by `label` only. Three "0" cards all had label "0" → only
the first one ever toggled.

Fix: `buildGameViewCard(cardInfo, cardIdxInGame)` now accepts an index
and tags the DOM with `data-game-card-idx`. Both view openers pass
each card's position via a `cardInfo → index` Map. Click and render
handlers read the idx, fall back to label for legacy DOM.

Then audited every label-only card lookup. Found two more sites of
the same bug class:
- `saveGameViewOrder` (drag-reorder) — was looking up by label AND
  splicing while iterating, so the first matching card's state got
  re-associated with a different DOM position after dragging duplicates.
  Replaced with a Set-based `_consumedIdx` tracker; re-tags surviving
  DOM cards with fresh idx values after the save so subsequent ops
  stay correct.
- `deleteCard` (game-view propagation) — stableId/uid/label fallback
  couldn't distinguish duplicates re-added from the same source.
  Prefers `dataset.gameCardIdx` now; old fallback chain remains for
  Card-Maker-initiated deletes. Re-tags surviving DOM cards too.

Left alone: M-card grouping handler and badge rendering — addressed
separately below.

### 4. M-card UX (group/ungroup discoverability)

The Ungroup button existed but only after entering M-mode and clicking
a grouped card. User asked: "how do I ungroup? if I can do it somehow,
it is not obvious."

Made the colored M1/M2/… badge directly clickable. cursor:pointer +
"M-group N (X cards). Click to ungroup." tooltip. Click → confirm
dialog → ungroup → view re-renders. Works without entering M-mode.
M button tooltip and the M-mode status text both now mention both
paths (badge-click and in-mode + Ungroup button).

### 5. M-group visual cleanup

A cascade of polish in the order the user surfaced them:
- M-group bottom border 3px → 6px (was "barely visible").
- Palette swap. The default first entry was `#7c4dff` (purple) which
  vanished against the purple Game Creator background. New palette:
  `#FFD600, #FF1744, #00E676, #FF6D00, #00B0FF, #F50057, #1DE9B6,
  #FFAB00`. Added `text-shadow: 0 0 2px rgba(0,0,0,0.85), 0 1px 0
  rgba(0,0,0,0.6)` on the white badge text so it stays legible against
  yellow.
- Tried a full-card ring (box-shadow inner color + outer white). User
  reverted: prefers the underline.
- M-mode selection outline was `outline: 3px solid #7c4dff` — same
  vanishing-purple issue. Replaced with `outline: 4px solid #ffffff
  !important; outline-offset: 2px; box-shadow: 0 0 0 6px
  rgba(0,0,0,0.35); border-radius: 9px` for a visible white ring with
  a subtle dark glow and softly rounded corners.

### 6. M-group identity: label → uid

The user kept hitting cases where cards she hadn't clicked ended up in
her group. Two contributing causes, both real bugs:

- **Drag-end click guard missing on Find view.** The Catch click
  handler had `if (_gvDragJustEnded) return;` but Find did not. A
  drag in M-mode would silently fire as a click on the drop target.
  Mirrored the guard. Fix in commit `423bb6c` predated this audit;
  the explicit guard added here is the symmetric fix.

- **M-group identity was label-based.** A group stored a list of
  labels; `applyMCardBadges` matched any DOM card whose label
  appeared in the group's label list — so duplicates with the same
  label all got badged together even when the user only clicked one.

Introduced a string identifier format `"u:<uid>"` (new, instance-precise)
with bare-label kept as the legacy form. Helpers:
- `_getCardIdentFromEl(cardEl)` — builds the ident from a DOM element
- `_cardMatchesIdent(cardEl, storedIdent)` — DOM ↔ ident match
- `_findCardByMGroupIdent(cards, ident)` — resolves an ident to a
  single card from a list (uid match, label fallback)
- `_isCardInMGroup(card, group)` — generic membership test
- `_migrateMGroupsToUidForm(game)` — one-shot conversion: each legacy
  label entry → uid of the FIRST matching card, with duplicate-label
  siblings dropped. Runs on every open; idempotent (uid-form passes
  through). Persists so user's saved groups auto-clean on first view.

Sites updated to consume the new identity:
- `handleMCardClick` (selection)
- `applyMCardBadges` (badge rendering)
- `applyCollapsedView` (1/M hide)
- `createMCardGroup` / `ungroupMCard` (write paths)
- `buildEffectiveCards` in pm-studio (domino preview)
- `findGroupCards` in pm-studio (hover tooltip)
- `_buildCardsLibraryRow` in index.html (player-side cards-library
  overlay with `_lookupGroupIdxForCard(card)` helper)
- `startCustomGame` mGroup resolution in index.html (`_findOrigCardByIdent`)

### 7. Domino pair generator — three independent bugs

User saw "two identical dominos" and "231 dominos when I expected 396",
plus invalid red×red / green×green combinations. Three pair-builder
bugs, each fixed independently:

(a) **Identical dominos from same-source duplicates.** Two cards
with different labels but the same `stableId` (e.g., E3 and E12 both
pointing at the same source template) passed the label dedup but
generated visually-identical pairs when matched with anything else.
Added stableId-based dedup alongside the existing label dedup in
both `buildEffectiveCards` (Studio) and `startCustomGame`'s origCards
builder (gameplay). Caught 3 cards collapsing to 1 in user's Match 0-4
data; also another instance in "x2 x4" with two `H8_10x4` sharing
stableId.

(b) **Invalid same-color pairs.** Pair generator emitted every
`i<j` combination. Red = top-only, green = bottom-only — two cards
wanting the same half can't form a domino. Added
`_groupCanGoOnHalf(group, half)` and applied in all three pair
builders (two in pm-studio for the Show Dominos area and the rebuild
path; one in index.html for the gameplay deck builder). Filter:
skip pair when neither (i top, j bottom) nor (j top, i bottom) is
valid; swap orientation when only the mirror satisfies the constraints.

(c) **M-group was collapsing the deck.** User clarified the intended
semantics: each unique card should be its own deck slot; M-grouping is
a visual tag + probability-weighting mechanism, NOT a deck collapse.
Admin needs to see every red × green combination in the Game Maker
so individual dominos can be excluded. Probability weighting comes
naturally — a card that visually repeats generates more deck slots
and therefore appears more often in random draws.

Removed the M-group folding loop from `buildEffectiveCards` and the
mirror in `startCustomGame`. Each origCard now becomes its own
effective entry. Net effect for Match 0-4 (10 red + 33 unique green
+ 3 visually-repeating green):
  - before: 22 effective × C(22,2) = 231 raw pairs
  - after: 43 effective × valid red×green = 330 pairs

The user paused here ("I now think that I should group the cards when
they are presented as dominos - not when they are presented as cards.
I need to think.") so the next direction is open.

### Commits in this session (oldest → newest)

```
5b0fa20  fix: auto-promote Added cards into letter rows + "+" row affordance
b1a9ef4  polish: alphabetical row sort + cleaner title + aligned +row affordance
76ce1c1  fix: freeze/float dots support duplicate-label cards
423bb6c  fix: drag-reorder + deletion respect per-card index (duplicate labels)
4ea8375  ux: make M-badge click directly ungroup (discoverability)
c8d0ef1  ux: thicken M-group bottom border from 3px to 6px
4595e07  ux: swap M-group palette to non-purple high-contrast hues
9a4fb02  ux: swap title row indentation in Game Creator
d53e30a  ux: M-group ring around whole card + white outer band   (later reverted)
b0bf249  Revert "ux: M-group ring around whole card + white outer band"
c4819b0  ux: recolor M-mode selection outline (purple → white)
132928e  ux: round corners on M-mode selection ring (border-radius: 10px)
5346940  ux: reduce M-mode selection ring radius 10px → 9px
77aff72  fix: M-group includes ONLY the cards user clicked (uid-based identity)
0dd9622  fix: cleanup remaining M-group label resolvers + one-shot migration
4d2e4b1  fix: dedupe domino pair builder by stableId (no more identical pairs)
678622f  fix: skip red×red and green×green pairs in domino generator
77300b5  fix: M-group no longer collapses the domino deck
```

### Files touched
- `pm-studio-DrV.html` — 18 commits, M-card system + Game Creator polish
- `index.html` — 4 commits, gameplay-side mirrors of the M-group + dedup fixes
- No JS/CSS files modified — no cache-buster bumps required.

### Open thread
M-card semantics. The user is reconsidering whether grouping should
happen at the domino level (currently: no collapse — each card pairs
with each) vs the card level (previous behavior: M-group collapses to
one deck slot, random face per draw). Decision deferred.

---

## May 21, 2026 — Setup polish + loupe path support + Card→Icon copy

A grab-bag session focused on plugging UX gaps that surfaced once IC
was live. Six independent fixes, all in `index.html` + `pm-studio-DrV.html`
only — no JS/CSS touched, no cache-buster bump needed.

### 1. Game Types / Levels delete with confirm + ID-collision fix
`pm-studio-DrV.html` `_gsAddOption` / `_gsRemoveOption` (~12172, 12200).

- `_gsRemoveOption` now `confirm()`s before splicing. Message includes
  the row's prefix + label, and for Types with voice input enabled
  warns that custom trigger words will be lost.
- `_gsAddOption` previously allocated IDs as `'opt' + (length+1)`,
  which collided after a delete (`[opt1,opt2,opt3]` → delete opt2 →
  next add → opt3 colliding with existing opt3). Now uses
  `max(existing numeric suffixes) + 1` so IDs are monotonic.
- "≥1 row" floor unchanged.

### 2. Voice "✎ words" button → just "✎"
`pm-studio-DrV.html` ~12563. The setup row was wide enough that the
`✕` delete button got pushed off-screen on the Type rows. Trimming
the voice-editor button to its glyph alone made room. Tooltip
("Edit voice trigger words for this Type") still explains what it
does. Class name (`gs-voice-edit-btn`) preserved so selectors don't
break.

### 3. Card Maker "Copy to icons…" (new context-menu flow)
`pm-studio-DrV.html` ~6425-6580 (submenus), ~8326-8367 (copy fn),
~6890 (menu wiring).

User flow: right-click a card → **"◎ Copy to icons…"** → pick
**Find the Double** (auto-copies into the only Find slot, L1) or
**Catch the Bubble…** → pick size class (L1/L2/L3/S1/S2/S3).

Implementation:
- Destination is **always** the active card set's icon row
  (`customDrawnIcons_<activeCardSet>`). There is no cross-set
  picker. Earlier draft of this had a 3-level cascade (set →
  game type → size); user pushed back hard ("Copy to 'icon slot' —
  what is it???") and we collapsed it to the current 2 levels.
- `_copyCardToIconSlot(card, setName, gameType, sizeClass)` clones
  the target template's geometry (`cardShape`, `cardShapeW`,
  `cardShapeH`, `cardCornerR`, `gameType`, `sizeClass`), generates
  fresh `uid` + `stableId`, sets `_isTemplate:false`, copies the
  source card's `svgContent` **verbatim**. No SVG transformation —
  the icon renderer already uses `viewBox="0 0 60 60"` so a
  60-unit-authored card auto-fits the smaller slot via display
  width/height. Verified against `_buildIconCardElement:9612` and
  `_applyShapeToPreview:2692-2698`.
- Editor reopens at full 60×60 thanks to `_openIconForEdit`'s
  canvas promotion (10113-10118 comment block confirms intent).
- **No caps.** Icon line is shared across multiple games of the
  same card set — append freely.
- Multi-select-aware: each selected card becomes its own appended
  icon in the chosen slot.
- Hidden in Safe Haven (`activeCardSet === 'Safe Haven'`).

Submenu positioning gotchas resolved:
- Bug 1: 2nd-level submenu position read `parentItem.getBoundingClientRect()`
  AFTER removing `_ctxSub`, but parentItem lived inside the removed
  submenu so its rect collapsed to (0,0) → submenu landed top-left.
  Fix: capture rect before removing.
- Bug 2: "Box for Find is a little far away, the catch box is far
  away a lot." Two issues — `+8` offset from parent ITEM right
  edge meant 15-25px visible gap (the menu container has padding);
  and L3 destroyed L2 on open, leaving a wide empty corridor.
  Fix: dock against the parent MENU's right edge with `+2` gap,
  AND keep L2 visible when L3 opens (standard cascading-menu UX).
  Added `sub._parentSub` chain + `_ctxClose` walks back via that
  chain so Esc / outside-click tears down the whole cascade.
- Helper `_ctxParentMenuRect(parentItem)` resolves the parent menu
  container so any submenu can dock against it.

### 4. Loupe drag + scale for `<path>` (and other previously-ignored shapes)
`pm-studio-DrV.html` `getElementPos` / `setElementPos` (3725-3781),
`applySizeToElement` path branch (4079-4179), `populatePropsFromElement`
(4012-4039), `_pushLoupeAttrHistory` capture lists (4941, 5029).

Symptom: user couldn't drag or resize a particular "3" card (D2 in
Numbers, desc `"3" (flat top)`). Selection ring appeared but every
move was a silent no-op.

Root cause: `getElementPos` / `setElementPos` only handled
`circle`, `text`, `g`. The `selectableTags` map at 3748 accepts
`path`/`line`/`polygon`/`polyline`/`ellipse`/`rect`/`image`/`use`
so selection works — but the position helpers fell through to
nothing (`getElementPos` returned `{0,0}`, `setElementPos` was a
no-op) so drag/arrow-keys did nothing visible. Same for the
resize via Size slider — `applySizeToElement` had branches only
for `circle`, `g` (fraction + stamp), `text`.

Fix design:
- **Position** for path/line/polygon/polyline tracked via a
  separate `data-pos-x` / `data-pos-y` pair PLUS a one-time-captured
  `data-base-transform` (the path's intrinsic transform, often a
  centered-scale chain like `translate(0,30) scale(1,1.06623)
  translate(0,-30)` — must not be disturbed). Rendered transform
  is rebuilt every time as `translate(posX,posY) <base>`. This
  composes cleanly with any intrinsic transform without breaking
  the centered-scale idiom. `ellipse`/`rect`/`image`/`use` got
  proper native-attribute branches (`cx/cy` or `x/y`).
- **Scale** for path/line/polygon/polyline applied via a
  scale-around-bbox-center chain (`translate(cx,cy) scale(s)
  translate(-cx,-cy)`) inserted INSIDE base. Bbox center captured
  once into `data-scale-cx`/`data-scale-cy` via `getBBox()` (local
  d-coord space, pre-transform — same space the scale chain
  operates in). User-scale tracked in `data-user-scale`. Baseline:
  slider `sz = 30` → 1x. Each unit moves proportionally.
- Single source of truth: `_rebuildPathTransform(el)` composes
  position + base + user-scale every time. Both `setElementPos`
  and the path branch of `applySizeToElement` set their state,
  then call it.
- `populatePropsFromElement` gets a matching path branch that
  reads `data-draw-size` so re-selecting a scaled path syncs the
  slider (default 30 if never scaled).
- Undo capture lists extended with `data-pos-x/y`,
  `data-base-transform`, `data-user-scale`, `data-scale-cx/cy`.

Verified end-to-end with synthetic paths matching D2's shape:
drag-only moves correctly, scale doubles/halves correctly,
scale-around-center holds with no drift, combined drag+scale
composes without either overwriting the other, slider syncs on
re-select.

Outstanding (intentional, not fixed):
- The Size slider for paths uses a fixed baseline `sz=30 ↔ 1x`.
  Paths have no intrinsic "size unit" so we picked a neutral.
  Tweakable if a different baseline reads more natural.

### 5. Read-only card audit (one-off)
Walked every `customDrawnCards*` key (698 cards across 14 sets) via
DOMParser + lenient HTML fallback. 8 placeholder cards with empty
`svgContent` (intentional blanks, e.g. ABC Y1/Z1) and 2 cards with
strict-XML parse warnings (TEST ABC F2/F3 — imported PNG stamps
that use `xlink:href` without declaring the namespace; browser's
own SVG renderer is lenient and they edit normally). **Zero
genuinely broken cards.** Script not retained — invoked ad hoc in
preview.

### 6. Player-side Types/Levels: drop `.on` filter + dynamic level renderer
`index.html` `_applyGameSetupToPlayerScreen` (1655-1764) and
`_renderTypesPicker` (1832).

User report: "x4 find game with touch has 5 Types in Setup but only
3 visible to player." Two distinct issues:
- **Types**: `_renderTypesPicker` was filtering by `o.on`. Renderer
  itself is dynamic (no DOM cap). Fix = drop the filter; all
  configured Types now appear. One line.
- **Levels**: Was iterating `document.querySelectorAll('#start-screen
  .level-btn-wrapper')` — the static HTML has exactly **3** of
  these. Setup options beyond index 2 were silently ignored. Fix:
  cache the original 3 hand-crafted wrappers as templates the first
  time the renderer runs, then rebuild the container's children
  every call from `conf.levels.options`. Slots beyond 3 reuse the
  "star" (4-domino) SVG as visual placeholder and get unique
  `data-level` tokens (`L4`, `L5`, …). The `.on` filter is also
  dropped for parity with Types.

Preserved: single-option → `is-static-text` rendering, zero-options
→ column hidden, selection-fallback when previously-selected token
no longer exists.

**Critical gameplay caveat** (not fixed, scoped for follow-up):
`js/game.js:1252, 1262, 1777` hardcodes `circle`/`triangle`/`star`
→ 2/3/4 dominos. Levels beyond #3 are visually rendered but their
gameplay falls through to the 4-domino branch. Same for Catch:
`_fillCatchLevelBubbles:2666` iterates the same 3 hardcoded tokens
so L4+ Catch slots won't get bubbles. Catch levels were already
noted as Under Construction in setup.

**Admin-side checkbox semantics changed**: the `.on` checkbox in
Game Setup still exists per row but is now a no-op on the player
side. Admin removes a Type/Level by deleting the row (the `✕`
button), not by un-checking. Worth a UI follow-up — either remove
the checkbox or repurpose it (e.g. "default selection").

### Resume notes

- Operational rules in `docs/SESSION_HANDOFF.md` Part 3 still
  apply. Push to all three claude/* branches after every commit.
- The path drag/scale code (item 4) is the trickiest piece. If
  you touch `getElementPos`/`setElementPos`/`_rebuildPathTransform`,
  preserve the invariant: **`data-base-transform` is captured
  once and never overwritten**. Every position or scale update
  is layered on top.
- The Copy-to-icons flow (item 3) assumes the source card was
  authored on a 60-unit canvas. If you ever introduce non-60
  source cards, the auto-fit-via-viewBox math may need attention.
- Two open UI items mentioned above: (a) the no-op `.on` checkbox
  in Game Setup, (b) game.js level token support for L4+. Both
  surfaced in the user's testing but weren't in scope to fix.

---

## May 19–20, 2026 — IC (Icons' Creator) system shipped end-to-end

**The big architectural pivot of this period.** Replaced the old
"MPP" (Main Page Pictures) flow — which tried to render arbitrary
Card-Maker cards inside Catch bubbles and kept fighting clip/viewBox
math — with a dedicated icon authoring + assignment pipeline. See
`docs/STATUS_NOTES.md` for the full play-by-play. Durable facts:

### Storage model

```
localStorage:
  customDrawnIcons_<setName>   ← icon pool per card set
                                 (parallel to customDrawnCards_<setName>)
  game.icons = [{uid, setName, sizeClass}, …]
                                 ← explicit per-game icon pool
                                   (capped 4 per size class → 24 total)

In-game slot assignment lives on game.mainPageDominos.<level>[idx]:
  Catch: slot.icon = {uid, setName, svgContent, sizeClass, cardShape, …}
  Find:  slot.iconTop / slot.iconBottom (per half)
```

### Size classes (`ICON_SIZE_CLASSES`)

```
L1: 42 units (~49 px)   S1: 25 (~29 px)
L2: 36       (~42 px)   S2: 21 (~25 px)
L3: 30       (~35 px)   S3: 17 (~20 px)
```

Find icons are rounded squares (`cardShape:'square'`, cornerR:15).
Catch icons are circles (cornerR = round(w/2)). `_buildIconCardElement`
derives dimensions from `ICON_SIZE_CLASSES[sizeClass]` at render
time — stored `cardShapeW` is fallback only. `_migrateIconSizes`
snaps any drifted sizes back on load. Templates are versioned via
`ICON_TEMPLATE_VERSION` (currently `3`).

### Editor reuse

Double-click a user icon → opens the **existing** loupe + draw-mode
editor (NOT a separate modal — the user vetoed that). Two adapters:
- `_openIconForEdit(card)` normalizes the icon to 60×60 for the
  loupe, stashes the original shape on private dataset attrs.
- `closeLoupe` icon-hook restores the icon's authored shape +
  size class before persisting, then writes `svgContent` back to
  `customDrawnIcons_<setName>`.

Editor toolbar during icon edit:
- `#draw-shape-row` hidden (shape locked by size class).
- Real-size preview docked as first child of `#draw-tools-panel`,
  live-mirrored via MutationObserver.

### Icon → Game migration

Explicit only. No inference from card sets. Each user icon has a
blue `→G` button that opens a picker listing eligible games (type-
matching). Each row shows `Game Name · L1 2/4`. `_iconAddToGame`
returns `'added'`, `'duplicate'`, or `'full'`. Pool dedupes by uid.

### Start-page rendering

Four renderers in `index.html` all prefer `slot.icon` over the
card-based path:
- `_introCatchIconSVG` / `_introFindIconSVG` (tile previews)
- `_fillCatchLevelBubbles` (Catch level-selection bubbles)
- `updateLevelDominoIcons` (Find level-selection dominos)

**Critical detail**: each icon-render path defines a LOCAL clipPath
inside the nested `<svg>` (circle at 30,30 r=30 in icon's 0–60
coords). The bubble's pre-existing clipPath uses outer-SVG user
space; reusing it on the inner SVG re-interprets coords and
off-centers the clip, chopping icon tops. Always local.

### Safe Haven for icons

Soft-delete via `_trashed=true` flag. Icon stays at the same
`{uid, setName}` so game.icons refs keep resolving (but are
filtered out in renders + IC panel). Safe Haven card set surfaces
all trashed icons across all sets via `_gatherTrashedIcons()`.
- `_restoreIcon(uid, setName)` clears the flag.
- `_purgeIcon(uid, setName)` permanent-deletes AND strips orphan
  game.icons refs.

### Defensive Start Game guarantee (May 20 fix)

`_ensureStartButton(playerNamesDiv)` in `js/game.js`. Called at:
- end of `renderInlinePlayerNames` (non-xeno branch)
- inside its idempotency early-return branch too
- end of `selectPlayerCount` (non-xeno branch)
- final safety net in `_applyGameSetupToPlayerScreen` (index.html)

Helper moves the button back to #player-names + clears inline
display/visibility/hidden; if truly gone, recreates with a fresh
click handler. The Catch interceptor in `index.html` now uses
DOCUMENT-LEVEL capture delegation (via `e.target.closest`) so
button recreations don't lose it.

### Decisions worth keeping

1. **One editor, not two.** Trust the user's instinct when they
   say "we already have this".
2. **`sizeClass` is the source of truth at render time** — stored
   `cardShapeW` is a hint that can go stale.
3. **Inner-SVG clipPaths must use inner coords** (not outer-SVG
   user space).
4. **Explicit migration beats implicit inference** for cross-
   subsystem data flow (icons → games).
5. **Defensive guards beat hunt-the-bug** when the root cause is
   elusive — guard every render path.

### Cache busters at end of arc
- `css/style.css?v=icons-p5-1`
- `js/game.js?v=ensure-start-2`

---

## May 13, 2026 evening — First local-Mac session: toolchain + 3 ships + ABC migration

First-ever local session on Victoria's Mac. Previous sessions all
ran in the Anthropic cloud sandbox. Tonight covered toolchain
bootstrap (so future local sessions skip the friction), three
small code ships, and a one-time browser-data fix for the legacy
ABC stableless cards.

### Toolchain stood up on the Mac

- **Repo cloned** into `~/CLAUDE CODE/Domino`. Initial obstacles
  (auto-created `.claude/` stub, Finder-dropped `.DS_Store`)
  resolved by deleting and re-cloning. Then `.claude/` was added
  to `.gitignore` (commit `aa6ab60`) so it doesn't keep nagging.
- **Git identity** configured globally:
  `Victoria Kofman <66704482+vkofman56@users.noreply.github.com>`.
  Important privacy note: without explicit `user.email`, git
  auto-derives from macOS account + hostname, which **exposes the
  home IP in commit emails** on public GitHub history. Always set
  the noreply alias on any fresh local clone.
- **Pre-commit hook activated** (`git config core.hooksPath
  .githooks`). Confirmed working — stamped `TRIAL 05:36 PM PDT`
  on `41c6d35` and `TRIAL 06:56 PM PDT` on `b1efa14`.
- **GitHub auth via `gh` CLI**: `brew install gh` (also installed
  Homebrew first), `gh auth login` with web browser flow. Future
  pushes from this Mac are silent.
- **Preview-browser test pipeline**: `.claude/launch.json` was
  added (gitignored) so the `mcp__Claude_Preview__*` tools manage
  the local server. Pattern: edit code → `preview_eval` to drive
  a headless Chrome → confirm DOM/localStorage state without
  needing to ask the user to manually click through.

### Commits (chronological)

- **`41c6d35`** — `studio: seed A1/B1 placeholder cards with stableIds`.
  `_createNamedSet` (pm-studio-DrV.html:14861) seeded every new
  card set with two stableless placeholder cards, the last code
  path violating the stableId contract. Each seed now calls
  `generateStableId(label, name)`. 2-line change. Static-verified
  via `curl + sed`, behaviorally verified by driving the function
  in a preview-browser and asserting both seed cards came out with
  IDs of the expected shape (regex `^\d{10,}_[A-Za-z0-9-]+_…`).

- **`aa6ab60`** — `chore: gitignore .claude/ session config`. One-
  line `.gitignore` add. Stops Claude Code's per-machine session
  config (`settings.local.json`, `launch.json`) from showing up
  as untracked on every status check.

- **`b1efa14`** — `studio: auto-show Group Edit toolbar on
  Shift+click`. **Closes P2** from the May 11 plan. New helper
  `_updateGEToolbarVisibility()` shows the toolbar when
  `groupEditActive || groupEditSelected.length >= 1`, else hides
  it. Wired at three passive-selection lifecycle points:
  Shift+click toggle (line 5527), non-shift click that clears
  passive selection (line 5540), and Esc-key clear (line 8611).
  Gr-mode show/hide paths remain authoritative; the helper is
  read-only with respect to them. Verified via preview-browser
  logic suite (7 scenarios: baseline/auto-show/auto-hide/idempotent/
  Gr-mode-override) + user live-tested in Chrome.

### Browser data fix — not a commit

- **15 stableless cards in `customDrawnCards_abc`** stamped with
  stableIds via console snippet (mirrors `buildAbcCardSet`'s
  built-in migration at line 15634). `_scheduleGameStableIdMigration`
  scheduled for game-side propagation. Result verified:
  `{total: 15, withStableId: 15}`. `sync.js` will push the
  migrated array to Firestore on its next budget window.

### Insight surfaced — "stale doc item" was actually a coverage gap

The handoff docs listed "15 stableless cards in customDrawnCards_abc
legacy seed" as an open item. Surface reading: stale paperwork,
since the migration code at `buildAbcCardSet:15634-15640` should
have fixed them long ago. **Actually:** the migration only fires
when the user opens the ABC tab inside the Card Maker. A fresh
browser that hydrates from Firebase via `sync.js._pullFromServer`
but never navigates into the ABC tab leaves the 15 cards
stableless forever. Victoria's localhost was exactly this case
tonight — she'd hydrated via Firebase but hadn't opened ABC.

This also means the migration is "lazy": once *any* browser
triggers it, the migrated array gets uploaded by `sync.js` and
all subsequent browsers pull down the fixed version. So the
self-healing path works — it just has a precondition the docs
didn't capture.

**Implication for future work:** the same lazy-migration pattern
exists for custom sets at line 15521. Reasonably safe in
practice (any visit to the Card Maker triggers it), but if
similar "why are these cards still stableless" reports come up
in the future, check whether the affected browser has ever
opened that specific set's view.

### Operational notes / gotchas

- **Firestore `resource-exhausted` errors observed** during the
  session: `Write stream exhausted maximum allowed queued
  writes` / `Using maximum backoff delay to prevent overloading
  the backend`. Not blocking (sync.js retries) but suggests
  `sync.js` may be too aggressive on bulk write operations.
  Worth keeping in mind if user reports "my recent change
  didn't show on the other device for a while."
- **Multiple `[Card Safety] Custom set save would reduce cards
  from 17 to 16 — checking DOM`** log lines were present in
  Victoria's console for the `BigNumbersDots` set. Unrelated to
  tonight's work but possibly a separate bug worth investigating
  in a future session (false-positive safety reduction warnings
  on save).
- **Right-click batch ops (Move/Copy to set/row, lines 5789+)
  also clear `groupEditSelected`** but were NOT wired into
  `_updateGEToolbarVisibility()` in `b1efa14`. The toolbar
  remains briefly showing with stale state after a batch op
  until the user's next click/Esc. Easy follow-up if it proves
  annoying — wire the helper after each of the ~4 mutation
  sites that end batch ops.

### Open items going forward

- **Repo housekeeping** — 9 old branches on origin awaiting user-
  side deletion (May 12 morning audit, Tier A + B list). Must be
  done from Victoria's laptop terminal, not from a Claude
  session.
- **Optional polish** — wire `_updateGEToolbarVisibility()` after
  right-click batch op completions (see operational notes
  above).
- **`buildAbcCardSet` lazy-migration awareness** — see Insight
  section. Probably no code action needed; just a known property
  of the migration.

### End-of-session state

- HEAD on all three branches: `b1efa14` (will become whatever
  the doc-commit hash is after this notes update lands).
- Working tree clean.
- Banner: `TRIAL 06:56 PM PDT`.
- Local preview server still running under Claude management.

## May 13, 2026 — Card-group operations completed + multi-aware right-click

The four-feature plan from May 11 ((a) Delete, (b) Move to set,
(c) Copy to set, (d) Copy to row) is now fully closed. Today's
work was the four group operations plus a series of right-click
menu polish fixes.

### Commits (chronological)

- **1b8f54c** — Right-click **Copy** + **Copy to row…** submenu
  multi-aware (closes (d)). `copyCardInRow` gained an optional
  second arg `optTargetRow` so cross-row copy reuses the existing
  function. New `_ctxCopyCardOrSelectionToRow` wrapper + new
  `_ctxShowCopySubmenu` builder. Existing "Copy" item now
  duplicates each selected card in its own source row when a
  multi-selection is active.

- **17b2506** — Right-click **Move to set…** multi-aware
  (closes (b)). Extracted `_moveCardToSet(card, targetSetName)`
  from the legacy `_moveCardToSafeHaven` (which becomes a thin
  wrapper). New `_ctxMoveCardOrSelectionToSet` wrapper + new
  `_ctxShowMoveToSetSubmenu` builder. Game wirings stay intact
  because stableId carries over.

- **0a885a3 / 2a148a6** — Bug: switching between sibling submenus
  (e.g. hovering "Move to…" then "Move to set…") sometimes killed
  the new submenu. Root cause: the previous parent's mouseleave
  timer woke up 200 ms later and ran `if (!_ctxSub.matches(':hover'))
  remove` against the *new* `_ctxSub` it had no business
  touching. Fixed by capturing `guardedSub = _ctxSub` at
  mouseleave time and only removing on identity match.
  Diagnostic logs added in 0a885a3 (later removed in 2a148a6).

- **140d5f2** — Right-click **Copy to set…** multi-aware
  (closes (c)). Sibling to (b): `_copyCardToSet(card,
  targetSetName)` writes a fresh-stableId copy to the target,
  source DOM untouched. `_ctxCopyCardOrSelectionToSet` wrapper
  + `_ctxShowCopyToSetSubmenu` builder + menu item.

- **5b7a8cd** — Cross-set move/copy batches now land in **one
  new row** at the bottom of the target instead of one row per
  card (E1, E2, E3, E4 instead of E1, F1, G1, H1). Added an
  optional third arg `optLabel` to `_moveCardToSet` / `_copyCardToSet`.
  The two cross-set wrappers precompute the batch's row letter
  once via `_nextBottomRowLabel(targetKey)` before the loop and
  pass `letter + seq` to each per-card call, incrementing `seq`.
  Status flash now includes the row letter ("Moved 4 to Extras
  row E").

- **b488c10 / 439e7ca** — Submenu hover fix. User reported
  "submenu disappears as soon as I move cursor toward it" / "I
  can't get to Move to since the submenu covers parent items".
  Two-part fix:
    a. Each submenu now has its own `mouseenter` that **cancels
       the pending close timer parked on the submenu element**
       (`sub._pendingClose`). The parent's mouseleave stores the
       timer ID on the submenu so the submenu can find it.
       Slow horizontal hovering no longer races the 200 ms
       timer — the moment the cursor lands on the submenu, the
       close is aborted.
    b. Submenu also gets its own `mouseleave` that schedules a
       fresh close with 200 ms grace. The parent's mouseleave
       timer becomes a fallback for the "cursor never reached
       the submenu" case.
    c. The gap between parent menu and submenu was briefly
       removed in b488c10, then restored at 8px in 439e7ca so
       the parent's items below the hovered one stay clearly
       accessible (the cursor can drop straight down without
       accidentally entering the submenu).

### Open items going forward

- **P2 — auto-show Gr toolbar on Shift+click** (discoverability
  for the match-attributes / Erase actions). Still pending.
- **`_createNamedSet` seeds** — A1/B1 placeholder cards still
  get no stableId. Tiny fix; pattern is the same as every other
  card-creation path.
- **15 stableless cards** in `customDrawnCards_abc` legacy seed.
- **Repo housekeeping** — 9 old branches from the May 12 audit
  still on origin awaiting user-side deletion (Tier A+B list in
  the May 12 morning section).

## May 12, 2026 evening — Right-click multi-selection actions

Building on yesterday's design plan for card-group operations
(see "Open items" further down). Three small ships:

- **f7c655d / 4e30329** — Added a `Shift+click` entry to the Card
  Maker help map (pm-studio-DrV.html:12560) so multi-select is
  discoverable. User originally said "Cmd+Shift" — wording trimmed
  to plain "Shift+click" to match what the handler at line 5514
  actually keys off (`e.shiftKey`).

- **4bf956a** — Right-click → **Delete** now honors active multi-
  selection. Previously: even with 4 cards Shift+selected, right-
  click → Delete on one of them opened the single-card "Delete
  permanently" dialog and only deleted that one. Now: when the
  right-clicked card is part of a 2+ selection, the menu item
  dispatches to `geActionErase()` instead — the same group-aware
  path the Delete key uses, with the "Erase N cards?" confirm.
  Single-card right-click flow unchanged.

- **934b3b6** — Right-click → **Move to…** matches. New wrapper
  `_ctxMoveCardOrSelectionToRow(card, targetRow)` at line 5683
  loops the move across `groupEditSelected` in a single undo
  entry, skipping cards already in the target row. Menu labels
  also show the selection count when applicable:
  "Delete (4)" / "Move 4 to…". Single-card right-click keeps the
  original "Delete" / "Move to…" labels.

- **786d0f1** — Follow-up: user noticed 4bf956a regressed the
  Safe Haven option. `geActionErase` had been using a plain
  `confirm("Erase N cards?")` while the single-card flow used the
  nicer three-button "Move to Safe Haven / Delete permanently /
  Cancel" dialog. Replaced the confirm with a custom dialog
  modeled on `_showSimpleDeleteDialog`:
  - Green "🛡️ Move N to Safe Haven" — always available; loops
    `_moveCardToSafeHaven` (works on game-used cards too because
    stableIds survive the move).
  - Red "Delete N permanently (skip M game-used)" — only shown
    if there's a non-blocked subset.
  - Cancel.
  Yellow warning panel listing the game-blocked cards when any
  are present. Label preview truncates past 10 cards.
  All four callers benefit automatically (Gr-toolbar Erase, Group
  Edit context-menu Delete Selected, right-click Delete multi,
  Delete key on multi).

The "Copy" item in the right-click menu is still single-card. The
user explicitly held off on group-copy (would be (c) / (d) from
the larger plan).

### Open items / pending features from yesterday's plan

Yesterday's plan (in conversation history, not in notes) had four
group operations: (a) delete, (b) move to another set, (c) copy to
another set, (d) copy to another line in same set. Status now:

- **(a) Delete** — DONE for both keyboard (Delete key →
  `geActionErase`, was already there) AND right-click (4bf956a).
- **(b) Move group to another card SET** — not started. Would
  generalize `_moveCardToSafeHaven` into `_moveCardToSet(card,
  targetKey)`, plus a set-picker UI.
- **(c) Copy group to another card SET** — not started. Clone of
  (b) minus source deletion, plus fresh stableIds (per the
  `_doCopySet` lesson from May 11).
- **(d) Copy group to another LINE in same set** — not started
  for COPY. The MOVE version (group move between rows) IS now
  done via 934b3b6's right-click Move-to. So (d-copy) is the
  natural next step: add a "Copy to row…" submenu next to
  "Move to…" and reuse `copyCardInRow` + row-picker logic.
- **P2 — Auto-show Group Edit toolbar on Shift-click**: still
  worth doing per yesterday's plan; right now the user only sees
  the toolbar after explicitly entering Gr mode. Low-cost UX win.

## May 12, 2026 morning — Remote-branch audit (action pending)

Conducted a full audit of every branch on `origin` to decide which
can be deleted. **Nothing was deleted from the remote** — user
asked to keep them on origin until they read this report and
decide. Only my local tracking refs were pruned to keep the
sandbox clean.

### Topology finding

Only TWO branches share commit history with our current HEAD at
`21319a4`:
- `origin/master` — merge-base at `570f9d8` (PR #6 merge from
  May 9). Master is 21 commits behind our HEAD and has 1 unique
  commit (the merge commit itself).
- The three live branches (`claude/review-project-docs-JOOeh`,
  `claude/general-session-yVBQq`, `claude/resume-vica-domin-UOJun`)
  — all identical at `21319a4`.

**Every other branch has a completely independent history** (no
common ancestor at all with our HEAD). They were imported/forked
from different roots earlier in the project's life. So their "X
commits ahead" numbers in `git rev-list` count *all* their commits
(no divergence point to subtract from), and diff sizes are huge
(30K–50K lines) simply because every file is foreign — not
because there's that much useful unmerged work.

### Branches recommended for deletion (9 total)

**Tier A — fully merged, no work loss:**
- `claude/catch-bubble-pictograms-fix` — 0 ahead, 67 behind. Tip
  is in our HEAD's history.

**Tier B — abandoned/superseded experiments. Spot-checked each:
work is either gone or rebuilt:**
- `Resizing-for-different-hardware` (2026-01-04) — predates
  `pm-studio-DrV.html`; old responsive design experiment.
- `find-the-double` (2026-01-31) — predates Studio; original game
  files. PR #1 already merged its essence into main.
- `claude/review-vica-domino-notes-vxyYf` (2026-02-07) — old card
  art tweaks (D2 redraw, A3/B3/D1 sizing). PRs #1+#2 closed.
- `claude/review-daily-progress-4qGJy` (2026-02-14) — coins/gems
  economy + number-10 alignment. Predates Studio. Parallel design
  exploration.
- `claude/read-todays-notes-zfR1g` (2026-02-28) — old
  `cardArrangement` / ABC-deletion fixes. Infrastructure has been
  completely rewritten.
- `claude/review-project-docs-QNagl` (2026-03-29) — empty-card
  filters, sync error fix, admin login requirement. All present
  (and further evolved) in HEAD. PRs #3+#4 closed in March.
- `claude/clarify-task-1NM0X` (2026-04-19) — draw-slider labels.
  Spot-checked: doesn't match current Studio slider markers; was
  forked exploration. Current Studio uses a different
  implementation (`.draw-size-row`).
- `claude/fix-card-deletion-bug-ElUcy` (2026-04-26) — card-
  deletion-not-persisting fix. Card-deletion code in our HEAD has
  been substantially rewritten (the `_geFindCardUsage` flow we
  just touched). Superseded.

### Branches to KEEP

- `master` — GitHub default branch. Holds PR #6 merge at `570f9d8`
  (May 9). Our 21 commits since are not in master. Don't delete:
  it's the canonical record + the eventual target for bringing the
  deploy branch forward.
- `main` — Has open PR #5 (`master → main`). Until that PR is
  closed/merged, main is nominally the longer-term "approved"
  branch. Last touched March 31 ("Trial 09:33"); content is stale
  but the open PR keeps it relevant.
- The three live branches.

### Recommended action plan (when user is ready)

**Phase 1.** Delete the 9 Tier A + B branches from GitHub web UI
(Settings → Branches → trash icon) or via `git push origin
--delete <branch>` from user's local machine (NOT this sandbox —
proxy 403s would only affect master pushes, not arbitrary branch
deletions, but doing it from user's laptop avoids any sandbox
weirdness):

```
claude/catch-bubble-pictograms-fix
Resizing-for-different-hardware
find-the-double
claude/review-vica-domino-notes-vxyYf
claude/review-daily-progress-4qGJy
claude/read-todays-notes-zfR1g
claude/review-project-docs-QNagl
claude/clarify-task-1NM0X
claude/fix-card-deletion-bug-ElUcy
```

**Phase 2.** Decide what to do with PR #5 (`master → main`) — merge
it (main catches up), or close it without merging (main stays
stale). Then decide whether to keep `main` at all. Grep-check
that no external system (GitHub Pages, readme links) points at
`main` before deletion.

**Phase 3.** Once user decides between `master` and `main` as the
canonical branch, fold the deploy-source branch into it from
laptop, and we shrink the three-branch dance to two-branch (deploy
+ mirror).

### What I did to local environment

After writing the report I pruned all 11 non-live tracking refs
via `git update-ref -d refs/remotes/origin/<branch>`. The remote
is unchanged — only my local view was simplified. To get them
back next session: `git fetch --all`.

## May 10-11, 2026 session — GP setup levels-as-column polish + card-set bugfixes

Long session, two distinct themes.

### Theme 1 — GP Setup level picker visual overhaul (commits b649e4d → 6bd2268)

Player-facing GP Setup page got a structural rework of the Levels axis,
driven by a series of user requests. End state mirrors the Game Type
column on the right of the setup screen.

- **b649e4d** — Switched `.game-level-select` from horizontal flex row
  to vertical column-reverse so the 3 level icons (2/3/4 dominos)
  stack with highest on top. Labels moved from below each icon to the
  right of it.
- **9ec49ad** — Removed the redundant "Choose the icon" / "Type your
  name" labels above the per-player rows on all three rendering paths
  (selectPlayerCount, renderInlinePlayerNames, mouse-Catch inline path
  in index.html ~1853).
- **0e4f748** — Dropped the hardcoded trailing `":"` after the
  Type-of-Game axis label. Now reads admin's axisLabel verbatim like
  Players and Levels axes already did.
- **8c0b20e** — Title for the Levels axis was centered above the
  whole row (icon+label combined width). User wanted it centered
  above only the icon column. Restructured `.game-level-select` into
  a 2-col CSS grid (col 1 fixed 85px = icon natural width, col 2
  auto = widest label), moved the h3 inside the grid as a row-1 item
  spanning only col 1. `.level-btn-wrapper` became `display: contents`
  so each wrapper's button + label land directly in grid cells.
- **052536e** — Thinned `.level-btn` outline (3px → 1.5px, radius 15
  → 10px) to match the `.setup-type-btn` outline on the Game Type
  pill row. Grid col-1 bumped 85 → 82 to track the new button width.
- **90783d9 / 7ebf2d5** — Bug fixes for the grid layout. Three JS
  restore paths were clobbering the grid by hardcoding `display: flex`
  on `.game-level-select` and on each `.level-btn-wrapper` after a
  game ended. All three flipped to `style.display = ''` so the
  stylesheet's `display: grid` / `display: contents` wins.
- **b0505dc** — User's browser was still seeing the broken horizontal
  layout because the cache-buster query strings on css/style.css and
  js/game.js hadn't been bumped since well before the layout work
  started. Bumped both to `?v=level-grid-fix-1`. **Important takeaway
  recorded in STATUS_NOTES.md Operational section: every meaningful
  CSS/JS change MUST bump the ?v=... query param or the fix never
  reaches users' browsers.**
- **7e40dc9** — Documented the cache-buster requirement explicitly
  in STATUS_NOTES.md after the b0505dc near-miss.
- **6bd2268** — Final form: user asked for Levels column to look
  *exactly* like Game Type column. Rebuilt `.game-level-select` as a
  flex column-reverse of full-row bordered boxes (each
  `.level-btn-wrapper` now carries the 1.5px/0.18α border + 10px
  radius + 10x14 padding identical to `.setup-type-line`). Inner
  `.level-btn` lost its own outline — wrapper carries everything.
  Selected state lives on `.level-btn` via JS but is picked up on the
  wrapper through CSS `:has(> .level-btn.selected)`. Click handler
  in `initGameLevelSelector` moved from the button to the wrapper so
  the whole row is the click target. h3 moved back out of the grid
  to its original position as a sibling above the box stack (mirrors
  Game Type's `#setup-right-h3` structure). Cache-buster bumped to
  `?v=level-box-rows-1`.

### Theme 2 — Card-set bugfixes + new Extras set (commits 210d271 → 0d1dbfb)

User reported: copying a card set, then trying to erase a card in
the copy, triggers a false-positive "card is used in a game"
warning. Long investigation via console audits running in the
user's browser.

- **210d271** — Root fix: `_doCopySet` (pm-studio-DrV.html:14227) was
  reading the source set's cards from localStorage and writing the
  array verbatim to the new key. Every card in the copy inherited
  the source's stableId, so `_geFindCardUsage` (9154-9188) matched
  the copy's cards against any game wired to the source. Fix:
  per-card `.map` that regenerates stableId via
  `generateStableId(card.label, newName)` while preserving all other
  fields.
- **User console audit** revealed deeper context:
  - 0 cross-set stableId collisions (so my first theory was
    incomplete — the actual mechanism was the label-only fallback).
  - 211 of 566 cards in the library had no stableId at all (37%) —
    they fell through `_geFindCardUsage`'s label-only fallback at
    9169/9181 and matched any game-card with the same label string
    regardless of source set.
  - 6 orphan card-sets (Multiply 1a, Numbers Dots 0-6, Test Set,
    Copy of Test Set, Numbers Dots 3-10, Multiply by 3, total ~1.7
    MB) sitting in localStorage from previous experiments — invisible
    in the UI because they were deleted from `savedCardSets` but
    their `customDrawnCards_*` blobs were never purged. All 211
    stableless cards lived in those orphans (+ 15 in the legacy
    `abc` built-in seed key); active 8 sets were 100% clean.
- **One-time browser-console operations (user ran these themselves;
  not committed to repo):**
  1. Self-contained HTML backup viewer of all 6 orphans (1.75 MB)
     downloaded to user's Downloads folder. Initial version
     rendered "(no SVG)" placeholders because the embedded
     `svgContent` strings are SVG *fragments* (just `<text>`
     children), not full `<svg>` elements; a follow-up snippet
     re-rendered in-place by wrapping each fragment in
     `<svg viewBox="0 0 60 80" width="100" height="...">`. User
     confirmed the cards now display properly.
  2. Orphan localStorage keys deleted (`customDrawnCards_*` minus
     the savedCardSets-listed and built-in keys); ~1.7 MB freed.
  3. Cards from the backup file merged into a user-created
     `Extras` set: each card got a fresh stableId via
     `generateStableId(label, 'Extras') + '_n<counter>'` (counter
     suffix as collision guard), labels suffixed with source set
     (e.g. "A1 (Multiply by 3)"), empty-svgContent cards skipped.
     Then a follow-up snippet dropped the 2 stableless seed cards
     that `_createNamedSet` auto-seeds into every new set. Final
     state: Extras has 191 cards, all with proper stableIds, no
     duplicates.

### Theme 3 — Studio "new card set" UX polish (commits 60b06df → 0d1dbfb)

- **60b06df** — Placeholder in the new-set inline input read "Enter
  the title of the 12's card set" for a user with 8 sets. Two bugs:
  count used DOM-rendered `.library-set-btn` (over-counted because
  Recent + folder sections double-render each set), and the format
  used possessive `"N's"` instead of ordinal. Now reads
  `loadCardSets().length + 1` and runs through an ordinal formatter
  (1st, 2nd, 3rd, 4th… with teens carve-out for 11th-13th).
- **680d87f** — `createNewCardSet` toggle bug: after navigating into
  the card maker and back, clicking "+" did nothing on first click
  because the `_addSetMode` module flag was stale-true while the
  `.new-set-input` DOM element had been wiped by rebuilds. Fixed by
  reading the live DOM (`.new-set-input` presence) as source of
  truth instead of the in-memory flag.
- **8da7aea** — Safe Haven was being counted in the new-set ordinal.
  Filter on `!s.isSafeHaven` (the flag set at line 7201 when Safe
  Haven is first created) so a user with 7 real sets + Safe Haven
  correctly sees "8th".
- **5c8715d** — Defensive self-heal at the top of `createNewCardSet`:
  any orphan `.library-set-copy-btn` left from a previous activation
  gets wiped before adding a fresh row, so Copy buttons can no
  longer pile up on repeated "+" clicks. Also tightened
  `insertBefore` to verify `preview.parentNode === col` before using
  it; falls back to `appendChild`. Two `console.log` lines added for
  diagnostics — removed in **0d1dbfb** once the user confirmed the
  flow works.

### Theme 4 — In-card element copy/paste in the loupe (commit 7343c4f)

New feature, user-requested. Previously the loupe (card editor) let
you select / move / transform (rotate, reflect in-place) / delete
an element on a card, but had no way to duplicate it.

- New module-level `_loupeElementClipboard` holds cloned SVG nodes
  across loupe sessions.
- `loupeCopyElement` reads `getAllSelectedElements`, deep-clones,
  strips selection markers, enables the Paste button.
- `loupePasteElement` clones from clipboard, strips ids to avoid
  DOM duplicates, applies a +5,+5 SVG-unit offset on the simplest
  available positioning attribute (x/y/cx/cy, with a transform
  translate fallback for paths/groups/use), appends to the loupe
  SVG, pushes onto `drawHistory` using the legacy-element pattern.
  Multi-element pastes coalesce into a single undo entry via
  `_coalesceLoupeHistory`.
- New Copy / Paste buttons in `#draw-tools-panel` next to Delete.
  Copy mirrors Delete's visibility (only shown when something is
  selected, hooked through `_updateDrawSizeActivation`); Paste is
  always visible but starts disabled and unlocks on first copy.
- Cmd+C / Cmd+V / Cmd+D keyboard shortcuts registered in **capture
  phase** so they beat the existing card-list-level Cmd+C / Cmd+V
  shortcut at line 8061 when the loupe is open. Loupe takes
  precedence — Cmd+C in the loupe means "copy this element", not
  "copy this whole card".

### Operational gotchas surfaced this session

- **Cache-buster query strings on css/style.css and js/game.js MUST
  be bumped on every meaningful CSS/JS change.** Two days nearly
  wasted chasing a "fixed" bug that never reached the user's browser
  because the `?v=...` hadn't been bumped. See STATUS_NOTES.md
  Operational for the file list + audit grep.
- **Three branches must stay identical**:
  `claude/review-project-docs-JOOeh` (deploy source),
  `claude/general-session-yVBQq` (mirror), and
  `claude/resume-vica-domin-UOJun` (per-session). Push sequence
  after every commit:
      git push -u origin claude/review-project-docs-JOOeh
      git push    origin claude/review-project-docs-JOOeh:claude/general-session-yVBQq
      git push    origin claude/review-project-docs-JOOeh:claude/resume-vica-domin-UOJun
- **Firestore card_backup is a 20-min snapshot, not a live mirror.**
  Each user's localStorage holds the working data; sync just dumps
  rolling JSON chunks to `users/<uid>/card_backups/<ts>/chunks/`,
  keeping the last 3. Cards do not sync between devices in real
  time. Audits and data operations have to run in the user's
  browser; this sandbox cannot read their data directly.

## May 9, 2026 session — GP intro mode popups + GP setup polish

Mostly polish on the player-facing setup flow: a TOUCH / MOUSE popup
for Find games (mirroring the Catch one), several rounds of "click
outside to close" tightening for those popups, and three GP Setup
cleanups — drop the legacy "Player Options" heading + "Type N — "
radio prefix, and inline the name/icon + Start form when admin
enabled exactly one Player Option. Also one Studio-side cleanup so
the Find Game Creator's "Show Dominos" preview honors per-card
red/green placement.

Master is intentionally behind: the Anthropic git proxy 403s pushes
to master from inside the sandbox, so the user keeps three identical
branches as the safety net (`claude/review-project-docs-JOOeh` =
deploy source, `claude/general-session-yVBQq` = mirror,
`claude/resume-vica-domin-UOJun` = per-session). Stop-hook complaints
about master being behind are intentional; ignore them.

### Commits (chronological, this session)

- `a080804` Find Game Creator: Show Dominos honors red/green placement
- `143a5ba` GP intro: Find games get a TOUCH/MOUSE popup like Catch
- `23d35d7` GP intro: mode popups close on click outside
- `d4035ec` GP intro: mode popups close on any click outside the action buttons
- `570f9d8` GP setup: drop 'Player Options' default heading + 'Type N —' prefix
- `5c32d42` GP setup: inline name/icon + Start when 1 Player Option enabled

### 1. Find Game Creator: Show Dominos honors red/green placement (`a080804`)

`rebuildGameViewDominos` previously always grabbed `effective[i].cards[0]`
as the representative for each domino half, so the Studio "Show
Dominos" preview never reflected the per-card freeze/float assignment
admin set. New `_pickRepForHalf` walks the group's cards (when
`game.freezeEnabled` is on) and prefers:

- top half (left in data): cards with `_freezeState !== 'floating'`
- bottom half (right):    cards with `_freezeState !== 'frozen'`

Falls back to `cards[0]` if nothing matches the filter (e.g. a
singleton group whose only card is the wrong polarity for that
half). Same graceful-fallback pattern the Player runtime uses
(d494848). `freezeEnabled === false` path is unchanged.

### 2. GP intro: TOUCH/MOUSE popup for Find games (`143a5ba`)

Mirrors the Catch-mode popup pattern for Find + combined games
(combined chains Find stages). Clicking a Find tile no longer drops
straight into setup — it anchors a popup with TOUCH / MOUSE buttons
plus the same "no touchscreen detected" warning chrome as Catch.
Mode pick stores in `window._findInputMode`, sets `selectedIntroGame`,
calls `goToMainPage()`.

`_applyGameSetupToPlayerScreen` now reads `_findInputMode` for Find
(was the `_hasTouchScreen` heuristic) so the saved touch / mouse
Game Settings tab applies to whichever input the player picked. The
heuristic survives only as last-resort default for code paths that
bypass the popup (e.g. ABC fallback in `goToMainPage`).

Setup page label flips between `"GPt F Setup"` / `"GPm F Setup"`
based on `_findInputMode` — same convention Catch uses. No gameplay
changes yet; the picker just records intent + selects the Game
Settings tab.

### 3. GP intro: mode popups close on click outside (`23d35d7`, `d4035ec`)

Two-step cleanup. First (`23d35d7`) added a shared helper
`_attachPopupOutsideCloser` that installs a one-shot capture-phase
document click listener after the popup shows (deferred via
`setTimeout` so the open-click doesn't immediately re-fire close).
Outside click → detach + run close helper. `_detachPopupOutsideCloser`
is called from choose / hide helpers so picking a mode also tears
down cleanly. Re-opening removes any stale listener first.

Second (`d4035ec`) tightened the rule: the user wanted *anything*
that's not a TOUCH/MOUSE button to close, including the popup's own
neutral chrome (background, padding, the warning text). Handler now
walks the popup's `<button>` descendants and skips close only if the
click hit one of them — every other click closes.

### 4. GP setup: drop "Player Options" + "Type N — " prefixes (`570f9d8`)

Two cleanups on the player setup page (Find + Catch, both modes):

**Players axisLabel default → empty.** `mkPlayersAxis()` ships with
`axisLabel: ''` so brand-new games render no Players heading.
`_getGameSetup` runs a one-time migration: existing games whose
stored `axisLabel === 'Player Options'` (the literal old default)
get reset to `''` on next load. Admin-customized labels survive.

**Type radio buttons drop "Type N — " prefix.** `_renderTypesPicker`
≥2-enabled branch now shows only the admin-entered text (e.g. "Slow
Pace", "Voiced Answer 🎤"). If admin left the label empty, falls
back to a plain `Type N` placeholder (no em dash). The 1-enabled
branch already hid the heading + used just admin text, so its rule
is unchanged.

### 5. GP setup: inline name/icon + Start when 1 Player Option (`5c32d42`)

When admin enables exactly one Player Option in Game Settings, the
player has nothing to pick on the Players axis. New flow: replace
the (formerly static-text) player button with the name/icon inputs
+ Start button rendered directly inline on the setup page. Levels
and Types pickers above stay visible so the player still picks
those before tapping Start.

**`_applyGameSetupToPlayerScreen` 1-enabled branch (index.html
~line 1414):** hide every `.player-btn`, hide `.player-select`
container, hide the Players h3, mark the lone (hidden) button as
`.selected` so the catch start interceptor (which reads
`.player-btn.selected`) still resolves the chosen variant for
2-player Catch, then call `window.game.renderInlinePlayerNames`
with the option's `data-players` count + `data-xeno` flag.

**New `Game.renderInlinePlayerNames(count, includeXeno)` in
js/game.js:** mirrors the input-building portion of
`selectPlayerCount` (per-player icon + name rows + optional Xeno
row + Start move-into-Xeno) but skips the side effects that hide
setup-columns / game-level-select / build the cloned-level chip.
**Idempotent:** `_applyGameSetupToPlayerScreen` re-fires on input-
mode switch, Game Settings save, back-from-setup, etc. — when the
re-render's (count, xeno) match the existing form, the helper
returns early so anything the player typed survives.

**Back-arrow handler (game.js back-to-intro-btn):** added
`isInlinePlayerNames` detection (`#player-names` visible +
`.player-select` hidden, and not the existing mouse-Catch case).
Inline mode → wipe `#name-inputs` + `playerIcons`, hide
`#player-names`, then go straight to intro. Mirrors what
`backToGameSetup` does on the click-to-reveal path so re-entering
the game starts fresh.

**Defensive restore at top of every players section:**
`pselect.style.display = ''` is now applied unconditionally before
the branch dispatch, so a 1-enabled → 2+-enabled transition (admin
save) doesn't leave `.player-select` collapsed.

**pm-studio-DrV.html: not changed for this commit.** Its
`#start-screen` uses three hardcoded non-catalog player buttons
(no `data-id`), and `_applyGameSetupToPlayerScreen` doesn't run
there — so the catalog-aware filter is a no-op in studio. The
banner stamp was the only edit.

### Files touched this session

- `index.html`: `_applyGameSetupToPlayerScreen` 1-enabled branch
  rewrite, defensive `pselect.style.display` restore, find-mode
  popup wiring (`143a5ba`), `_findInputMode` consumer wiring,
  setup-page-label switch.
- `js/game.js`: new `renderInlinePlayerNames` method, back-arrow
  inline-mode branch.
- `pm-studio-DrV.html`: `mkPlayersAxis` default + `_getGameSetup`
  migration (570f9d8); banner stamps for the rest.
- All five trial-banner instances bumped to `TRIAL 08:19 PM PDT`
  on 5c32d42.

### Resume notes for tomorrow

- HEAD on all three branches is `0d1dbfb` (or whatever the latest
  is — see `git log`). The three branches that must stay identical
  are: `claude/review-project-docs-JOOeh` (deploy source),
  `claude/general-session-yVBQq` (mirror), and
  `claude/resume-vica-domin-UOJun` (per-session).
- **Push rule: after each commit, push to ALL THREE branches.** Use
  a single sequence:
      git push -u origin claude/review-project-docs-JOOeh
      git push    origin claude/review-project-docs-JOOeh:claude/general-session-yVBQq
      git push    origin claude/review-project-docs-JOOeh:claude/resume-vica-domin-UOJun
  Don't push to master. Don't mention master being behind every
  turn — proxy 403s from the sandbox, the three branches are the
  safety net.
- Develop directly on `claude/review-project-docs-JOOeh`. Don't
  switch to the per-session branch as the working branch — keep
  it as a third mirror.
- **Bump the cache-buster `?v=...` on css/style.css and
  js/game.js for any meaningful CSS/JS change** — otherwise the
  fix won't reach users on a normal reload. Six files carry version
  params (audit with `grep -nE '\?v=' index.html pm-studio-DrV.html`):
  css/style.css, js/firebase-config.js, js/sync.js, js/domino.js,
  js/voice.js, js/game.js. pm-studio-DrV.html's own inline-script
  changes don't need a buster — the HTML file is the entry point
  and a normal reload picks up the new HTML.

### Open items / known issues at end of session

- **2 stableless seed cards** still exist in any newly-created card
  set: `_createNamedSet` (pm-studio-DrV.html:14287) seeds new sets
  with `{label: 'A1', svgContent: '', desc: 'Empty'}` and
  `{label: 'B1', ...}` — both lack stableId. User cleaned theirs up
  in Extras manually via console option-A snippet. Future work:
  patch `_createNamedSet` so seeds get `generateStableId(label,
  newName)` like every other card-creation path does.
- **15 stableless cards** still in the `customDrawnCards_abc`
  built-in legacy seed key. They drive a small amount of label-
  fallback noise in `_geFindCardUsage` but aren't actively hurting
  the user. Same fix as above — seed paths should call
  generateStableId.
- **`_geFindCardUsage` label-only fallback** at
  pm-studio-DrV.html:9169/9181 still exists. After the orphan
  cleanup the surface area is tiny (only the 15 abc-seed cards plus
  the 2-per-set placeholders), but the structural fix would be to
  drop the fallback entirely and only match on stableId. Hold off
  until all built-in seeds + placeholders carry stableIds (see two
  bullets above) — otherwise legit-but-stableless cards would stop
  matching their wired games.
- The renderInlinePlayerNames helper duplicates ~150 lines from
  `selectPlayerCount`. If we touch the input-building shape again
  (icon size, name placeholder rules, Xeno row layout), we should
  refactor both into a shared `_buildPlayerInputRows(count, xeno)`
  rather than letting the duplication drift.
- `pm-studio-DrV.html`'s `#start-screen` is still on hardcoded
  3-button HTML with no catalog filter. If the user ever wants
  Studio's "preview play" to honor the same admin matrix, we'd
  need to port `_applyGameSetupToPlayerScreen` (or its core)
  into the studio file too.

---

## May 5, 2026 session — Catch round-trip fixes + cards-library overlay

A focused session on closing the loop between Studio (Game Creator)
and Player for Catch games: the player was rendering the right cards
in some places but stale ones during gameplay, the freeze/float UI
was wired up backwards, and the only visible "stop" affordance during
a round was a × that crashed the screen. All commits land on master
+ `claude/general-session-yVBQq` + `claude/review-project-docs-JOOeh`
(stable triple-push, see "Push to 3 branches" rule below). Trial
banner now reflects actual commit time via `scripts/bump-trial.sh`.

### 1. Catch player level-button bubbles fill from MPP (`03deb40`, `5b9b980`)

The Catch start screen's level-buttons were stamped with hardcoded
*empty* bubble SVGs (`_bubbleSVGs` in `index.html` ~line 1261). MPP
saved a card per bubble in `game.mainPageDominos`, but the live
Player never read it — Catch had no equivalent of Find's
`updateLevelDominoIcons`. Added `_fillCatchLevelBubbles(game)`,
called right after the bubble swap in `goToMainPage`'s catch+mouse
branch:

- Builds `markupMap[label] -> {markup, viewBox}` from `game.cards`
  via `getGameCardSVG` (stableId-first, snapshot fallback) so post-
  add Card Maker edits flow through.
- Walks each `.level-btn[data-level=…]`, picks the bubble fills by
  matching `fill="url(#bg…)" / "url(#bs…)"` so decorative inner
  rings + shines are skipped.
- For each bubble (DOM order = MPP slot order from Studio's
  `_bubblePos`), reads `game.mainPageDominos[level][i].top`, falls
  back to recycling `game.cards` labels when MPP is missing.
- Inserts a `clipPath` sized to the bubble + a nested `<svg>` with
  the card markup, sized 2r square at `(cx-r, cy-r)`, inserted right
  after the bubble fill so shine/inner-ring decoration draws on top.

### 2. Cards-library overlay (eye button on GP intro)

**Per-game eye button next to every Find / Catch game on the intro
screen** (combined games skipped — multi-stage doesn't fit a single
view). Click → modal showing every card the Player would render for
that game, organized into "equivalence lines". The modal is the
verification surface for the Studio → localStorage → Player round-
trip: if the eye matches Studio, the rendering chain is intact.

Final layout after a few iterations (commits `c44c134`, `dc69dfe`,
`fe462a3`, `18e1bd1`, `989ad1c`):

- **Rows match Studio's Game Creator**: walk `origCards` in saved
  order, group consecutive cards by `_gameRow` (or `label.charAt(0)`
  fallback) — same logic as `openCatchGameView` / `openGameView`.
- **Border color = M-group**: cards sharing a group share a border
  color; palette is the same `_mGroupColors` Studio's
  `applyMCardBadges` uses. Cards not in any mGroup keep the default
  neutral border. (Replaced an earlier corner-badge prototype.)
- **Left-edge dot-line = freeze/float assignment**: `border-left:
  4px dotted` on an absolutely-positioned span sitting inside the
  card's left edge. Red = `_freezeState === 'frozen'`, green =
  `'floating'`, no strip = unassigned ("can do both"). The mGroup
  border stays solid on all 4 sides — the freeze indicator lives
  inside without competing for the border slot.
- **Empty cards render as blank tiles**: `_buildCardsLibraryRow`
  resolves markup *itself* rather than calling `getGameCardSVG`,
  which folds `svgContent === ''` into the same null-return as
  "data missing". The row builder distinguishes "intentionally
  empty" (sourceFound but markup is whitespace) from "data missing"
  (no source found at all) and only falls back to the label-as-text
  display in the latter case.
- Card name labels under each tile preserved.

The dedup matches the Player runtime (`!c.isVariation`, one entry
per label), so the cards displayed in the eye-overlay are exactly
the pool the Player picks from at gameplay time.

### 3. Catch player resolves cards by stableId, not snapshot (`5d1cf04`)

**Root cause of the "Match 0-4 board renders 4×6 / 2×14" bug.** The
Player's `_catchBuildCardSVG` (at `index.html:2849`) was the last
renderer in the codebase still using only `cardInfo.svgMarkup` — the
snapshot frozen onto the game record at add-time. When a Match-0-4
card's snapshot got overwritten with Multiply-by-4 content at some
past point, gameplay faithfully rendered the stale snapshot forever.
Studio's `_catchBuildCardSVG` (in `pm-studio-DrV.html`) and the
cards-library overlay both already resolved through `stableId →
_gpResolveBySid → live storage`. Player's renderer mirrored to
match: PRIMARY = stableId-resolved svgContent (typeof === 'string',
so empty cards still render as blank); FALLBACK = snapshot only when
stableId can't be resolved; LAST RESORT = label-as-text. Variation
transform applied in both PRIMARY and FALLBACK paths.

After this commit, all three card-rendering surfaces (Studio Game
Creator, eye-overlay, Catch gameplay board) read from the same
source of truth.

### 4. Frozen / Floating semantics — wired correctly this time

The previous Catch player code interpreted `_freezeState` as "spawn
this card stationary in the falling area" — frozen cards became
fixed-position tiles in the drop zone, unmarked cards got a 50/50
random spawn-state. Wrong design.

**Correct semantics**:
- `_freezeState === 'frozen'` (red) → static-only: the card can be
  the LEFT "Find this card" target, never falls.
- `_freezeState === 'floating'` (green) → falling-only: never sits
  on the LEFT target slot, only spawns as a falling tile.
- `undefined` → unconstrained, can play either role.

Implemented in two passes:

- `224e4f6` — strip the misinterpretation. Removed `_freezeMap`
  build in `openCatchPlayModal`, the `freezeEnabled` / `freezeMap`
  fields on `_catchGame`, the per-card `isFrozen` branching in
  `_catchStartRound` (positioning, tiltSpeed/drift overrides,
  `frozen` field on cardData, opacity dim), the `if (cd.frozen)
  return` skip in the animation loop, and the round-end check's
  `(cd.frozen && !cd.isMatch)` clause (collapsed to `cd.clicked`).
- `d5dc91c` — wire the correct semantics in both `_catchStartRound`
  and `_catch2pStartRound`:
  - **Static pool** = `targetCards` filtered to drop floating-only cards.
  - **Match pool** = `targetCards` minus the static label, minus frozen.
  - **Distractor pool** = other-value cards minus frozen.
  - Each pool has a graceful fallback: if the strict filter empties
    the pool (e.g. every card in the value group is floating), the
    constraint is relaxed for that one round so the round still
    proceeds. The Game Creator's existing per-game warning pill is
    the right surface for admins to fix unbalanced assignments.

### 5. Catch ⏸ pause button replaces × close

The × close button on the Catch HUD only ran `_catchCleanup()`
(remove overlay, no navigation), leaving a blank page. Replaced
entirely with a real pause control (commits `69a59cc`, `836372f`,
`a21e198`):

- New `⏸` SVG button in the same HUD slot the legacy × occupied,
  same round chrome (`.catch-pause-btn`).
- `_catchPause()` sets `_catchGame.paused = true`, cancels the
  animation frame, marks `roundActive = false`, and layers a
  centered `.catch-pause-overlay` ("Paused / Tap anywhere to
  continue with a new task").
- `_catchResume()` (any click on the pause overlay) removes the
  pause overlay and starts a **fresh round** — current falling
  cards are wiped, a new target value is picked. Lives, score,
  gems, and round counter persist. So pause = "skip this drop,
  give me a fresh task" rather than a hard quit. Routes to
  `_catchClearFalling` + `_catchStartRound` (1P) or
  `_catch2pClearFalling` + `_catch2pStartRound` (2P).
- 2-player redundancy: dropped the duplicate pause button I had
  briefly added in the 2P middle column (`836372f`). The existing
  2P-build code keeps the top HUD's pause button visible, so 2P now
  has exactly one pause button, matching 1P.
- `body.catch-active` toggle around catch overlay lifecycle hides
  Find's `.game-pause-btn` (z-index 11500, above the catch overlay's
  10000) for the duration of any Catch round. Without that, the
  Find pause button leaked through whenever
  `body.game-round-running` was still set from a prior Find round.

### 6. Catch Game Creator — Copy Game button (`2c5845d`)

Find Game Creator already had Copy Game; Catch only had Delete Game.
Mirrored Find's flow:

- `Copy Game` button next to `Delete Game` in `openCatchGameView`'s
  button row.
- `copyCatchGame(catchIndex)` prompts "Name for the copy:" with
  default `Copy of <name>`. Cancel / empty input aborts silently.
- Deep-copies the entire `savedCatchGames` entry via JSON round-trip
  so every saved field is preserved without enumeration: cards
  (incl. per-card `_freezeState`), `mGroups`, `freezeEnabled`,
  `mainPageDominos`, `setup` (Type options / voice / etc.), shape
  overrides, description, published flag.
- Drops `sourceName` from the copy. If the original was a Find→Catch
  clone (`cloneGameToCatch` sets sourceName), the copy shouldn't
  carry that lineage — "Update from source" should only apply to
  the original clone, not copies of it.
- Refreshes Library / start screen / Card Maker game lists, opens
  the new copy in the Catch Game Creator.

### 7. GP Setup level box reflects admin's choices (`cc9d0ef`)

Two related Game-Settings UX fixes:

- `_applyGameSetupToPlayerScreen` (in `index.html`): apply the
  `levels` axis filter to BOTH Find and Catch (was Find-only, with
  an explicit `gameType !== 'catch'` skip). Per-button on/off drives
  `display:none` on `.level-btn-wrapper` as before, plus:
  - **0 levels enabled** → entire `.setup-left` column hidden
    (heading + button row).
  - **N levels enabled** → only those N show.
  - If the previously-`.selected` level button is now hidden,
    selection auto-shifts to the first visible one and is persisted
    through `localStorage.vicaSelectedLevel` +
    `window.game.selectedLevel` so launching the game still picks
    the right level without a manual click.
- `saveGameSettings` (in `pm-studio-DrV.html`): before persisting,
  compare each axis's enabled-count between the working copy and
  the currently saved setup across both modes. If any axis
  (players / levels / types) lost an enabled option, alert
  *"You reduced the number of choices in game player setup"* after
  the modal closes.

**Heads-up on legacy Catch games**: Catch's `levels` axis defaulted
to all-off-with-blank-labels. The Player previously skipped Catch's
levels axis entirely, so admins never saw or configured it. With
the filter now applied, those games will hide the level box on the
Player Setup page until admin opens Game Settings → Levels and
enables the ones they want. One-time per Catch game; no migration
shipped because legitimately-disabled-by-admin Catch games would
otherwise be silently re-enabled.

### 8. `scripts/bump-trial.sh` + pre-commit hook (`a50578f`)

Old rule was "manually update `TRIAL HH:MM AM/PM PDT` in 5 places
on every push." Easy to forget; led to stale banners that confused
"is the live site current?" checks. Replaced with deterministic
tooling so the deployed banner always reflects actual commit time:

- `scripts/bump-trial.sh` — reads `TZ='America/Los_Angeles' date`,
  rewrites all 5 banner occurrences in `index.html` +
  `pm-studio-DrV.html` to `TRIAL <now PDT>` via perl in-place edit.
  Permissive regex normalizes legacy variants (PDT/PST, extra
  whitespace) too.
- `.githooks/pre-commit` — runs the script automatically before
  every commit that stages either of the two HTML files, then
  re-stages them. Skips bumping for commits that don't touch
  deployable HTML to avoid noisy diffs on docs/CSS-only commits.
- Enable per-clone with `git config core.hooksPath .githooks`. If
  not enabled, `bash scripts/bump-trial.sh` works as a manual call.
- `MEMORY.md` rule was rewritten — replaced the two manual-bump
  rules (lines ~235 and ~741) with the new script-based workflow so
  future Claude sessions don't fall back to hand-picking
  timestamps.

### Files touched this session

- `index.html`: `_fillCatchLevelBubbles`, `_openCardsLibrary` and
  `_buildCardsLibraryRow`, `_catchBuildCardSVG` rewrite,
  `_catchStartRound` + `_catch2pStartRound` filters, `_catchPause`
  + `_catchResume`, level-axis filter in
  `_applyGameSetupToPlayerScreen`, `body.catch-active` toggle, eye
  button in `_renderIntroGameBtn` + `populateIntroGames`. Trial
  banner bumped on every push.
- `pm-studio-DrV.html`: `copyCatchGame` + Copy Game button in
  `openCatchGameView`, `saveGameSettings` reduced-choices warning.
- `css/style.css`: `.intro-game-row`, `.intro-game-eye`,
  `.cards-library-*` family, `.cards-library-card-freeze-strip`,
  `.catch-pause-btn`, `.catch-pause-overlay/-card/-title/-sub`,
  `body.catch-active .game-pause-btn { display: none !important }`.
- `scripts/bump-trial.sh`, `.githooks/pre-commit` (new files,
  executable).
- `docs/MEMORY.md`, `docs/STATUS_NOTES.md` (this entry).


## Sand-timer (hourglass) — auto-pause for non-stop games without Xeno

**Use case**: a 2-player non-stop Find-the-Doubles round has no Xeno
timer pushing the kids forward. If they walk away mid-round, the
celebration / loss flow never fires and the game just sits there.
Sand-timer fixes that with a soft, kid-friendly "are you still there?"
pause after a configurable silent stretch.

### Scope

- **Activates when**: Type behavior = `nonstop`, Xeno timer **off**,
  admin-configured `sandTimer` > 0. Otherwise it's a no-op (hourglass
  stays hidden).
- **Resets on**: any pointerdown / keydown / voice phrase (capture-phase
  listener on `#game-screen`).
- **Expires** after `sandTimer` seconds of silence → calls
  `_pauseGame('sand')` which shows the existing pause overlay with
  swapped text: "Are you still there? / Tap anywhere to continue".
- **Resume** restarts sand-timer from full (per design — not
  continue from partial).
- **Manual pause during sand-timer**: sand-timer suspends; on resume
  it restarts from full. Same one overlay, different reason text.

### Admin UI

- **Game Settings** (per-game) has a new "Sand-timer (s):" row right
  below the existing Timer row. `0` disables. Default `60`.
- Stored at `game.setup.sandTimer` (peer of `game.setup.timer`,
  shared across touch / mouse modes). Schema-repaired in `_getGameSetup`.

### Runtime plumbing

- Player-screen apply-setup writes `window._currentGameSetupSandTimer`
  alongside `_currentGameSetupTimer` so `js/game.js` can read it.
- `Game._startSandTimer / _stopSandTimer / _resetSandTimer` —
  hourglass scaling driven by CSS variable `--sand-progress` on
  `.sand-hourglass`. 250 ms tick.
- Capture-phase pointerdown / keydown listeners on `#game-screen`
  bind once per game instance and only act when timer is running.
- `_pauseGame(reason)` swaps overlay title between "Game paused"
  (manual) and "Are you still there?" (sand). `_resumeGame` reads
  `_sandWasRunning` and restarts the sand-timer fresh.

### Files touched

- `index.html` + `pm-studio-DrV.html`: hourglass markup inside
  `#game-screen`, overlay title/sub now have IDs `game-pause-title`
  / `game-pause-sub`.
- `pm-studio-DrV.html`: new `gs-sand-timer` row, `_defaultGameSetup`
  + `_getGameSetup` + `_gsCaptureForm` + `_gsRenderForm` plumbing.
- `index.html` apply-setup: writes `window._currentGameSetupSandTimer`.
- `css/style.css`: `.game-sand-timer` + `.sand-hourglass`,
  `body.sand-timer-active` gating, two `.sand-top` / `.sand-bottom`
  scaleY transforms.
- `js/game.js`: `_startSandTimer / _stopSandTimer / _resetSandTimer
  / _shouldRunSandTimer / _sandSetProgress`; round-start hook in
  `startSunLevelGame`; reset hook in `_onVoicePhrase`;
  navigate-away hook in `_cleanupVoiceUI`; pause-reason text
  swap and `_sandWasRunning` save/restore in `_pauseGame`/
  `_resumeGame`.

## Deployment Notes
- **Site URL**: https://vkofman56.github.io/Vica_Domino/pm-studio-DrV
- **Deployed from**: `claude/review-project-docs-JOOeh` branch on GitHub (GitHub Pages)
- **IMPORTANT**: Every push must include `git push origin master:claude/review-project-docs-JOOeh` to deploy
- **Push command**: `git push origin master && git push origin master:claude/review-project-docs-JOOeh`
- **Trial timestamp**: Update the trial timestamp in the Library title (`pm-studio-DrV.html` line ~302) with every push so the user can verify they're seeing the latest version. Use San Francisco time (TZ='America/Los_Angeles').
- **GitHub Pages delay**: Deployment takes 30-120 seconds after pushing

## Project Overview
- **Brand**: "Pinky Math"
- **Platform**: "Pinky Math Gaming" — a game generator that produces standalone game applications
- **Repo/codename**: Vica_Domino
- **First standalone apps**: "Find the Double" — a family of domino-based games (various versions)
- **Type**: Educational math game generator, single-page web app
- **Vision**: Each completed game is extracted as a standalone application; the generator continues developing new games
- **Development**: 484+ commits over Feb 1-27, 2026 (most active: Feb 7 with 68 commits)
- **Detailed notes**: See [project-details.md](project-details.md) and [STATUS_NOTES.md](STATUS_NOTES.md)

## Project Structure (current sizes)
- `index.html` (~7,328 lines): Main UI, HTML screens, inline `<script>` for Card Maker/Library/Game Maker
- `js/game.js` (3,614 lines): `VicaDominoGame` class - all gameplay logic
- `js/domino.js` (185 lines): Card definitions, utility functions (isDouble, canPlayOn, etc.)
- `css/style.css` (~4,737 lines): All styling, animations, responsive layouts
- `audio/select-double.mp3`: Voice instruction for tutorial
- Inline script in index.html runs BEFORE game.js loads
- `game.js` uses `DOMContentLoaded` to instantiate `VicaDominoGame`
- **Total**: ~15,864 lines of code

## Game Modes
1. **Sun Level (Find the Double)**: Primary mode - each player gets N dominos, must find the double
   - Circle/Sun = 2 cards, Triangle/Alien = 3 cards, Star/Sunflower = 4 cards
2. **Classic Domino**: Traditional domino gameplay with board placement (left/right)
3. **Combined Games**: Multi-stage progression with coin/gem economy

## Card Sets
1. **Numbers & Dots** — 5 values (A-E) with 6 representations each, 15 domino pairs
2. **ABC Card Set** — 25 letter cards (A-Y), 5 values × 5 representations, with animal icons (Ant, Brain, Cat, Dog, Egg)

## Key Features
- **1-2 player** support + optional **Xeno** computer opponent (pink alien AI)
- **Adaptive Xeno Timer**: Starts at 20s, decreases on wins, increases on losses
- **Keyboard controls**: Number keys 1-4 (player 1) and 7-0 (player 2) for card selection
- **W/P shortcuts** for Play Again in end-game state
- **Tie detection** (within 500ms for 2-player)
- **Progressive tutorial**: finger animation, "double" label, voice instruction, keyboard hints — all hide after N wins
- **Card Maker**: Create/edit custom card designs with draw tools (pencil, eraser, shapes, text, stamps), font selector, SVG-based, Aa/r sliders, color palette, reflect/rotate
- **Variation toolbar**: 2×4 grid layout — top row: 4 reflections, bottom row: 3 rotations + symbol toggle; SVG icons use `currentColor`
- **Game Maker**: Create custom games, select cards, manage domino pairs, per-game variation exclusions, flip mode
- **Card Library**: Two-column layout (Card Sets + Games), browse with zoom, loupe mode, grid overlay
- **Card Variations**: Multiple visual representations per card value, with pixel-based duplicate detection; editable in loupe via double-click
- **Drag-and-drop**: Copy cards, move between rows, reorder within rows, persistent arrangement
- **Main Page Pictures (MPP)**: Custom domino level preview icons
- **Introductory page**: Game selection before main setup
- **Combined Games**: Chain multiple games into stages with coin (5 coins = 1 gem) progression
- **Coin/Gem economy**: Gold coin visuals, vertical stacking, stage stones in header
- **LocalStorage persistence** for custom games, variations, card data, arrangements
- **Responsive design**: iPad landscape/portrait, tablet, mobile

## localStorage Keys
| Key | Purpose |
|-----|---------|
| `savedCustomGames` | Custom game definitions |
| `customDrawnCards` | Numbers & Dots card SVG data (built-in key) |
| `customDrawnCards_Numbers and Dots` | Numbers & Dots card SVG data (custom set key — used when set was deleted & recreated) |
| `customDrawnCards_abc` | ABC card SVG data |
| `customDrawnCards_<SetName>` | Custom card set SVG data |
| `savedCardSets` | Array of custom card set names |
| `deletedBuiltinSets` | Array of deleted built-in set names (e.g. `["numbers"]`) |
| `deletedCards_abc` | Deleted ABC cards tracking |
| `cardArrangement` | Card row/order persistence (Numbers) |
| `cardArrangement_abc` | Card row/order persistence (ABC) |
| `cardMakerVariations` | Card variation definitions |
| `abcCardSnapshot` | ABC card set snapshot for Library preview |
| `savedCombinedGames` | Combined game stage configurations |
| `savedCatchGames` | "Catch the double" cloned game definitions |
| `_singlePlayerWins` | Tutorial progression counter |
| `__sync_userId` | Firebase sync user ID |
| `__sync_userRole` | Firebase sync role (superuser/player) |
| `migration_builtins_converted` | Migration flag (`'v2'`) |
| `loupeZoom_v1` | Loupe zoom factor (L4) — syncs across devices via Firebase |
| `drawToolsPanelPos_v1` | Draw-tools panel drag position (L3) |
| `variationToolbarPos_v1` | Variation toolbar drag position (L3) |
| `groupEditToolbarPos_v1` | Group Edit toolbar drag position (L3 extension) |

**CRITICAL**: `getNumbersStorageKey()` returns `customDrawnCards` normally, but returns `customDrawnCards_Numbers and Dots` if `deletedBuiltinSets` contains `"numbers"` and `savedCardSets` contains a matching name. Always use this function to get the correct key.

## Debugging Lessons
- **Always validate JS syntax first** when user reports "nothing works" / "frozen". Use: `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"`
- A SyntaxError in a `<script src="...">` file prevents the ENTIRE file from executing
- `const` redeclaration in the same scope is a SyntaxError
- **Card corruption**: Be careful with localStorage persistence of drag/order data — scope to active card set, use unified `cardArrangement` key
- **ABC vs Numbers mixing**: Always check active card set before saving/loading custom cards
- **findCardByLabel must be scoped by cardSet**: Both ABC and Numbers sets share the same label format (A1, B1, etc.) — searching the whole DOM returns the wrong card if the wrong set appears first
- **Card set DOM may not be built**: The ABC card set DOM (`#card-set-abc`) starts empty and is only populated when the user opens it in the card maker. Game loading must fall back to stored `svgMarkup` when DOM lookup fails — don't skip cards just because they're not in the DOM
- **Auto-creation functions defeat deletion**: `ensureAbcGameExists()` recreated the ABC game on every page load, making deletion impossible. Replaced with a one-time migration that only backfills data on existing games

## Known Fixed Issues
- **Duplicate ID `draw-btn`**: Card Maker draw button and game's "Draw from Bank" shared ID. Fixed: game's button → `bank-draw-btn`
- **`hideCreateEdit()` display bug**: Was setting start-screen to `display: block` instead of `display: flex`
- **Duplicate `const key`** in handleKeyPress caused SyntaxError freezing everything
- **Domino disappearing** on second 2-player game
- **Xeno timer box overlapping** game board (fixed for both normal and iPad landscape)
- **Card corruption from drag/order**: Fixed with unified `cardArrangement` persistence scoped to active card set
- **ABC cards reappearing after deletion**: Fixed with separate `deletedCards_abc` key
- **Cards disappearing from Game View**: Fixed with `svgMarkup` fallback
- **ABC game showing wrong cards**: Fixed card set mixing in Card Maker
- **Text editing hanging**: Fixed multiple Enter press issue
- **Deleted cards appearing in gameplay**: Game data stored stale card SVGs. Fixed: cards included only if they have stored `svgMarkup` OR exist in the DOM (March 4)
- **Wrong card set shown in games**: `findCardByLabel()` now accepts optional `cardSet` param to search only the correct container (`#card-set-numbers` or `#card-set-abc`) (March 4)
- **Hardcoded "Dots and Numbers" intro button**: Removed — intro screen now only shows user-created games dynamically (March 4)
- **ABC game not rendering (plain letters)**: ABC card set DOM not built at game start time. Fixed: SVG pool building uses stored `svgMarkup` fallback (March 4)
- **ABC game re-created after deletion**: `ensureAbcGameExists()` removed; replaced with one-time migration (March 4)
- **Custom ABC cards beyond row E disappearing on reload**: `buildAbcCardSet` only created rows A-E; now creates rows on demand for any letter (March 7)
- **Symbol toggle swapping operators**: `applySymbolToggle` rotated ALL elements including +, -, ×, ÷, =; now filters out operators and only swaps numerals (March 7)
- **Variations disappearing on reload for ABC/custom sets**: `saveVariations()` now stores card set; `loadVariations()` defers ABC/custom set variations until those sets are lazily built (March 7)
- **Custom card set data wiped when previewing in Library**: `beforeunload` handler called `saveCustomCards()` with empty `#card-set-custom` div; now guards save to only run when Card Maker is visible (March 8)
- **Card data wiped by beforeunload/iframe saves**: `saveVariations()`→`saveCustomCards()` read from Card Maker DOM which is empty if never opened; `beforeunload` and Play iframe triggered this. Fixed with `_cardMakerBuilt` guard + `safeSaveCards()` (March 25)
- **Cloud sync wiping local card data**: `syncLogin()` replaced ALL localStorage with cloud data including empty card arrays. Fixed with sync guard that preserves ALL `customDrawnCards*` keys when cloud version is empty (March 25)
- **Play button showing empty page**: Play mode iframe ran `startCustomGame()` before `populateStartScreenGames()` populated game data. Fixed by moving play mode init after initialization. Also fixed `VALUE_RANK` not defined error (March 25)
- **Numbers and Dots cards lost and recovered**: Cards were extracted from git history (commit `561692f^`) and restored via `recover-cards.html` page. Root cause was chain of: empty DOM save → sync to cloud → cloud overwrites local on reload (March 25)

## March 7 Session Notes
- **Variation toolbar**: Reorganized from single row into 2×4 grid (2 rows of 4 buttons). Removed separator divs. All SVG icons changed from hardcoded `#2255aa` to `currentColor`. Key: `index.html` ~line 343, `css/style.css` ~line 623.
- **Non-double domino styling**: Added copper outline (`#CD7F32`) to non-double dominos in Game View, matching the gold outline (`#FFD700`) on doubles. Both now look like proper joined domino pairs. Key: `css/style.css` ~line 1832, selector `.game-view-domino:not(.double-domino) .game-view-domino-half`.
- **Symbol toggle implemented**: The toggle button (bottom-right in V toolbar) now swaps positions of placed elements on a card. Removed disabled state, implemented `applySymbolToggle()` with position rotation logic. Works for cards with 2+ elements (text, circles, stamps, groups). Filters out math operators (+, -, ×, ÷, =) so they stay in place. Key: `index.html` — `createVariationSVG` and helpers.

## March 7-8 Session Notes (continued)
- **Variation cards editable in loupe**: Double-click a variation card to open it in the loupe editor. Implemented inverse transform matrix for coordinate conversion, so drawing/selection works correctly inside transformed variation `<g>` elements.
- **Built-in Numbers and Dots cards restored**: 45 built-in cards (rows A-I) were accidentally removed and then restored. Empty cards A3, A4, A5, H4, H5 filled with new designs (hollow oval, cursive "0", dashed box, 7-dot pattern, 8-dot pattern).
- **Variations persistence fix**: `saveVariations()` now includes `cardSet` field. `loadVariations()` defers restoration of ABC/custom set variations until those sets are built (lazy initialization).
- **Custom card set data preservation**: Fixed Library preview wiping custom card set data by guarding `saveCustomCards()` to only run when Card Maker screen is visible.
- **Built-in set deletion attempted then reverted**: Briefly prevented deletion of built-in card sets, but reverted to keep deletion available.

## March 10-11 Session Notes
- **Insert SVG from file**: Added "Insert SVG from file" button to Card Maker draw tools. Allows importing external SVG files as stamps that can be placed on cards.
- **Over-scale slider (×1–×10)**: Added a scaling slider for imported SVGs, allowing them to be scaled up to 10× their default size (which fits within the card). This lets large/detailed SVGs fill the card.
- **Crop/Pan tool for imported SVGs**: When an imported stamp is oversized (scaled beyond card boundaries), a crop/pan button appears allowing the user to drag/reposition the SVG within the card area. Includes a "done" button to finalize placement.
- **Status: NOT FULLY WORKING** — The crop/pan and overscale features still have issues. Competing drag handlers were partially fixed but behavior is still not right. Needs further debugging in next session.
- **Planned fix approach (clipPath model)**: Rewrite crop/pan to use the Word/image-editor pattern — the card is the crop frame (fixed), the imported SVG sits inside a `<clipPath>`-clipped group, pan changes `translate()` on the inner group, scale changes `scale()` on the inner group. This cleanly separates pan/scale from the existing element drag system (no competing handlers). The card boundary is the clip rect; the SVG moves freely behind it.
- Key commits: `f0efe4f`, `f49ad32`, `c744ef2`, `6a7ff72`, `fcc139b`

## March 23 Session Notes
- **Player/Admin role selection on intro screen**: Replaced the old intro screen (which showed game list + Play + Create and Edit all at once) with a two-step flow:
  1. Initial load shows only **Player** and **Admin** buttons
  2. **Player** → shows game list + Play button (same as before)
  3. **Admin** → shows sync login overlay with superuser ID input; after successful login, navigates directly to card library
- **Files changed**: `index.html` (intro screen HTML + `selectRole()`/`resetIntroScreen()` JS functions), `css/style.css` (`.intro-role-panel` and `.intro-role-btn` styles), `js/game.js` (back navigation calls `resetIntroScreen()`), `js/sync.js` (removed `create-edit-btn` from superuser elements, added Firestore ID validation)
- **Removed `create-edit-btn`** from intro panel — Admin role button on intro screen replaces it; clicking Admin triggers the sync login overlay directly at the admin ID input step
- **`_adminLoginPending` flag**: When Admin is clicked from intro screen, sets this flag so `doAdminLogin()` navigates to card library instead of reloading the page
- **Fixed Firestore reserved ID error**: `"__player__"` was stored in localStorage from a legacy version, causing `[Sync] Error: invalid-argument Resource id "__player__" is invalid because it is reserved`. Fix: sanitize userIds starting with `__` in `syncLogin()` and auto-login, guard `_pullFromServer`/`_pushToServer` with `_isValidFirestoreId()` check
- **Back navigation reset**: All back buttons (from start screen, card library, create-edit screen) now call `resetIntroScreen()` to show the Player/Admin choice again
- **Separate admin page (`pm-studio-DrV.html`)**: Admin/superuser site now has its own standalone HTML file, deployed at `/pm-studio-DrV`
- **Fixed admin login overlay showing empty dialog**: `showSyncLoginOverlay()` was calling `showRoleChoice()` which hid the admin login form and showed an empty role-choice div. Fixed to call `showAdminLogin()` directly so the superuser ID input and Login button appear immediately.
- Key commits on branch `claude/review-project-docs-QNagl`: `a24919c`, `8d11310`, `ffe0d9d`, `1fa33a9`, `56b7823`
- Key commits on branch `claude/review-project-docs-JOOeh`: `8c85ad4` (admin login overlay fix)

### March 24 Session — Built-in Card Migration Fix
- **Problem**: Built-in cards (45 Numbers & Dots cards, ABC cards) were not appearing in Card Maker after migration
- **Root cause 1**: The built-in "numbers" set had been deleted (`deletedBuiltinSets: ["numbers"]`) and recreated as a custom set called "Numbers and Dots". Migration wrote to `customDrawnCards` (built-in key) but the custom set reads from `customDrawnCards_Numbers and Dots`
- **Root cause 2**: Migration ran synchronously on page load, but Firestore `syncLogin()` completes asynchronously and **wipes all localStorage** replacing it with cloud data — destroying migration results
- **Fix (migration v2)**:
  1. Detects `deletedBuiltinSets` and `savedCardSets` to find the correct storage key
  2. Changed from IIFE to named function `runBuiltinMigration()`
  3. Called inside every `syncLogin().then()` callback (runs AFTER Firestore restore)
  4. Uses flag `'v2'` (not `'true'`) so it re-runs over old v1 migration
  5. Merges cards from old keys, cleans up legacy keys
- **Key lesson**: Any localStorage migration must run AFTER async Firestore sync completes, not before
- Key commits: `56d966d` (v2 migration with key detection), `d3888a7` (fix timing — run after sync)

## Development Workflow Rules
- **ALWAYS update trial timestamps with EVERY deploy/push**: This is the #1 rule. The deployed `TRIAL HH:MM AM/PM PDT` banner must reflect actual deploy time so the user can tell whether the live site is current. **Use `bash scripts/bump-trial.sh`** — it sets all 5 locations across `index.html` and `pm-studio-DrV.html` to the current Los Angeles time in one shot. Run it BEFORE every commit that touches those two HTML files. (A pre-commit hook at `.githooks/pre-commit` does this automatically when enabled with `git config core.hooksPath .githooks`; if not enabled, run the script by hand.) **Never hand-pick a timestamp** — the script reads the system clock and the result is always honest.
- **Push to 3 branches**: Every push must go to all 3 branches: `git push origin master && git push origin master:claude/general-session-yVBQq && git push origin master:claude/review-project-docs-JOOeh`
- **Dual-file architecture**: `index.html` (player) and `pm-studio-DrV.html` (admin) have SEPARATE code. Timestamp changes must be applied to BOTH. Feature changes typically only go to `pm-studio-DrV.html` unless they affect gameplay.
- **ALWAYS validate JS syntax before committing**: Run `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"` for JS files. For inline scripts in HTML, extract and validate each `<script>` block. Broken syntax (e.g., unescaped quotes in innerHTML strings) causes silent failures that are hard to debug.
- **Test data flow end-to-end**: When saving data to localStorage, verify the key matches what the reading code expects. This project has multiple storage key patterns (`customDrawnCards` vs `customDrawnCards_<SetName>`) depending on whether a set is built-in or custom.
- **Never save empty arrays over non-empty card data**: Use `safeSaveCards()` wrapper which blocks saving `[]` when existing data has cards. This prevents accidental wipe from DOM-based saves when Card Maker isn't open.
- **Card Maker DOM is lazy**: The card set containers (`#card-set-numbers`, `#card-set-abc`, `#card-set-custom`) are only populated when the user opens them in Card Maker. Any save function that reads from DOM must check `_cardMakerBuilt` flag first. When looking up card data, always fall back to localStorage if DOM is empty.

## Current State (April 16)
- **Branch**: `claude/review-project-docs-JOOeh` (active development, also `claude/general-session-yVBQq`)
- **Backup tags**: `backup-before-catch-game-20260331`, `backup-before-math-editor-20260402` (local only — remote tag push blocked by 403)
- **Player page** (`index.html`): Working — Full navigation flow GP 0 → GP F Setup/C Setup → GP Fnm Start → GP Fnm Board
- **Admin page** (`pm-studio-DrV.html`): Working — All 8+ screens have page name labels with unique IDs
- **Page name labels**: Temporary dev aid — editable, persistent via localStorage (`pageNameLabels_gp2` / `pageNameLabels_admin`)
- **Navigation**: Back-arrow returns to previous page, home button goes to GP 0. Works for both Find and Catch games.
- **Catch the Double gameplay**: Fully working — falling cards, scoring, coin/gem economy matching Find the Double
- **Catch mouse mode**: Single-player setup (no "How many players?"), heading "The Level of Difficulty:", bubble icons instead of domino icons, labels "2/3/4 bubbles"
- **Coin/gem system**: Both Find and Catch games have gold disk coins, gem conversion at 10 coins, glin-glin sound, fall animations
- **Google Fonts**: Full font list loaded in both files for cross-device card rendering (page UI fonts unchanged)
- **Card migration**: Working — 45 Numbers & Dots built-in cards + ABC cards now appear in Card Maker and sync to Firebase
- **Sync status**: Working — migration runs after Firestore restore, `migration_builtins_converted = 'v2'`
- **Card data protection**: 3 layers of safeguards against card data loss
- **Auto card backup**: Every 20 minutes to Firebase `card_backups` subcollection (last 3 kept)
- **MPP for Catch games**: Bubble-based MPP editor with circle-clipped card images; loads/saves from `savedCatchGames`
- **Rotation auto-fix**: `_stripRotationWrapper()` removes top-level `<g rotate(...)>` wrappers from card SVGs during game loading
- **Loupe rotate undoable**: `loupeTransformInPlace()` now adds to `drawHistory`; `drawUndo()` properly unwraps `<g>` wrappers
- **Next planned feature**: Math equation editor for cards (WYSIWYG toolbar approach)

## March 28 Session Notes — Card Maker Scaling, Game Creator, SVG Import

### Card Maker Improvements
- **× slider always visible**: Works with all element types (text, stamps, circles, imported SVGs)
- **× slider redesigned**: Dynamic range with clickable max selector popup (0.5, 1, 1.5, 2, 3...10); 2-column dropdown layout; 0.02 step increments for fine control
- **Bottom-left anchor scaling**: When resizing with × slider, bottom-left corner stays fixed
- **Imported SVG hit-area**: Transparent rect added so drag works on transparent gaps
- **Drag bounds widened**: Any element with data-over-scale > 1 gets wider drag bounds (not just imported stamps)
- **Card save fix**: `_cardMakerBuilt` was not set for custom card sets; fixed so edits persist
- **Auto-generate card names**: New cards get auto-generated names (e.g., "E3") instead of prompting
- **drawSave try/catch**: Wrapped save logic so closeLoupe() always runs even if save errors

### SVG Import Improvements
- **compressSVG()**: Strips XML declarations, comments, metadata, editor attributes, reduces numeric precision, collapses whitespace
- **Auto-rasterization**: SVGs >200KB are rasterized to 600×600 PNG via canvas (3MB → ~50-450KB)
- **Auto-size sliders**: Aa=90, r=10 set on import so image fills card at ×1
- **Rasterized images**: Use 100×100 internal coords matching stamp coordinate system; `<image>` with both `href` and `xlink:href`

### Game Creator Improvements
- **Add Card button (+)**: Green "+" in Game View toolbar opens overlay to add cards from any card set
- **Card set picker**: Shows all sets (Numbers & Dots, ABC, custom sets) with renamed display names from localStorage
- **Multi-card selection**: Click cards to select (green highlight), click "Add Selected"
- **Cross-set adding**: Cards from any set can be added to any game with SVG markup stored inline
- **Cards in "Added" row**: Newly added cards appear at bottom with green border; sort into proper letter rows when game is reopened
- **Card deletion in Game View**: Now updates `savedCustomGames` localStorage (not just DOM)
- **Dominos auto-refresh**: Show Dominos rebuilds from fresh data; auto-refreshes after card add/delete
- **Large SVG guard**: Cards >500KB skipped with warning; QuotaExceededError handled with revert
- **Crop feature removed**: Was non-functional; all crop-related code deleted (~98 lines)

## March 31 Session Notes — UI Improvements & Catch the Double Infrastructure

### Card Maker UI Improvements
- **Google Fonts integration**: Replaced system fonts with Google Fonts for cross-device consistency; added `<link>` tag in `<head>`
- **Two-level font picker**: Categories panel (Sans-serif, Serif, Display, Handwriting, Monospace) → font list panel with live preview; replaces old `<select>` dropdown
- **Recent fonts**: Up to 2 recently used fonts shown above category list (excludes current font)
- **Font migration**: `migrateFontFallbacks()` IIFE updates existing localStorage card data to use Google Fonts equivalents
- **Custom color palette**: `loadCustomColors()`/`saveCustomColors()` with color picker panel using native `<input type="color">`; colors persist in localStorage

### Card Fixes
- **Empty cards selectable**: Removed 9 empty-SVG filters across selection, saving, loading, display, and gameplay code so empty cards (representing zero) can be used in Game Maker
- **Card copy in Game View**: `copyCardInRow` now updates `savedCustomGames` and regenerates domino pairs when in Game View context
- **Row assignment at game creation**: `completeGame` assigns `_gameRow` to each card based on its position

### Library Games Section
- **Subtitles**: "Find the Doubles" and "Catch the double" subtitles under Games heading
- **Indentation**: Games title 15px right, game rows 10px right
- **Game type prefixes**: All game names display with type prefix — "Find the doubles: Name" / "Catch the double: Name" — in Library, Game View, Card Maker, Start Screen, Intro Screen

### Catch the Double — Clone Infrastructure (gameplay not yet implemented)
- **New localStorage key**: `savedCatchGames` — stores cloned game definitions independently from source
- **Clone button (⤵)**: On each "Find the Doubles" game row; creates a copy under "Catch the double" section
- **Data model**: Each clone stores `name`, `sourceName` (for update tracking), independent `cards` copy, `published` flag
- **Update from source (⟳)**: Pulls latest cards from original "Find the Doubles" game, overwrites clone's cards
- **Publish/Unpublish**: Same Pub/Unpub toggle as original games; unpublished clones hidden from player-facing screens
- **Delete (✕)**: Removes clone with confirmation
- **Duplicate prevention**: Cannot clone same source game twice
- **openCatchGameView()**: Displays catch game cards in Game View (read-only for now)

### Catch the Double — Gameplay (implemented)
- Static enlarged card on left side; falling cards on right side
- Start with 2 falling cards, gradually increase to max 4
- Cards fall with slight horizontal drift + ±10° tilt animation
- Speed increases as player progresses through rounds
- Scoring: correct catch = 1 coin, wrong tap = lose 1 coin, 10 coins = 1 gem with glin-glin sound
- 3 misses (double falls off screen) = game over
- Same card/domino data as "Find the Doubles" game
- Key commits: `5e1654f`, `5c81f4a`, `c43aece`

## April 2 Session Notes — Navigation, Coins, Fonts

### Page Name Labels (temporary dev aid)
- **All screens labeled**: Both `index.html` (GP prefix) and `pm-studio-DrV.html` (A prefix) have editable page name labels
- **Label IDs**: Each label has a stable HTML `id` for localStorage persistence (e.g., `welcome-page-label`, `a-card-maker-label`)
- **localStorage keys**: `pageNameLabels_gp2` (game player), `pageNameLabels_admin` (admin) — separate from each other
- **Dynamic naming**: Board pages auto-generate names like "GP F21 Board" or "GP C32 Board" based on game type, domino count, player count
- **Admin dynamic labels**: Game View shows "A GC Find" or "A GC Catch" depending on game type

### Navigation Flow
- **GP 0** → **GP F Setup / GP C Setup** → **GP Fnm Start** (player names) → **GP Fnm Board** (gameplay)
- **Back button**: Returns to previous page (e.g., Board → Start, Start → Setup, Setup → GP 0)
- **Home button**: Goes directly to GP 0 from any page
- **Catch overlay navigation**: Back button saves `_pendingCatchGameIndex`, calls `_catchCleanup()`, restores pending index, shows Start screen
- **Context-aware back on game-screen**: Capture-phase listener checks if player-names visible → go to setup or intro
- **`_resetSetupPanel()`**: Restores hidden setup elements (`.setup-columns`, `.game-level-select`, `.player-select`) after back navigation

### Coin/Gem System in Catch the Double
- **Same visual system as Find the Double**: Gold disk coins (`.gold-disk`), two columns of 5, gem conversion at 10 coins
- **`_catchAddCoins(n)`**: Adds coins, triggers gem exchange at 10 coins; uses `game.active` check (not round number) for timeout staleness
- **`_catchRenderCoins()`**: Renders gold disks and gems in HUD with pop-in/fall/gem animations
- **`_catchRemoveCoin()`**: Removes 1 coin on wrong click; gem-to-coins conversion when no coins left
- **`_catchPlayGlinGlin()`**: Sound effect for gem conversion
- **`_catchGameOver()`**: Shows gems and coins visually instead of text score

### Google Fonts for Cards
- **Full font list loaded**: All Google Fonts from Card Maker's font picker loaded in both `index.html` and `pm-studio-DrV.html` via `<link>` tag
- **Purpose**: Ensures cards render correctly on all devices (iPad, etc.) regardless of installed fonts
- **Page UI unchanged**: All page elements keep Segoe UI / system fonts; Google Fonts only used by card SVG rendering
- **Lazy loading**: Google Fonts only downloads actual font files when text uses them, so minimal performance impact

### Key Technical Details
- **Catch overlay is dynamic**: Created in `openCatchPlayModal()` (~line 1057 of index.html), not a static screen
- **`_pendingCatchGameIndex` lifecycle**: Set when catch game selected, consumed (reset to -1) on launch; must be saved/restored for back navigation
- **Capture-phase event listeners**: Used for back-arrow-btn on game-screen and Start Game button intercept for catch games
- **Catch overlay z-index**: 10000 for overlay, 10001 for buttons/labels (position: fixed)

### Backup
- **Local tag**: `backup-before-math-editor-20260402` — marks state before math equation editor work
- **Restore command**: `git checkout backup-before-math-editor-20260402`
- **Remote push blocked**: Tag push returns 403 error; tag exists locally only

### Pending
- **Math equation editor**: Cards need words, math equations (+−×÷), fractions, parentheses, braces. Proposed WYSIWYG math toolbar approach. Not yet implemented.
- **Childish UI for Catch the Double**: Background/fonts for young children (mentioned but not yet addressed)
- **Remove trial timestamps**: Still present as temporary dev aids
- **Remove page name labels**: Temporary dev aids, to be removed eventually
- **Cleaning drag changes**: Fix stuck drag-over class, fix multiple cards appearing selected during drag
- **Remove diagnostic console.logs**: `[addVariation]`, `[saveCustomCards]`, `[AddCard]` lines

## April 12 Session Notes — Catch Mouse Mode, MPP Catch, Rotation Fix

### Catch Game Fixes
- **Square card flash fix**: Pre-apply circle/custom shape immediately in `openCatchPlayModal()` before the 600ms timeout, so the card never briefly shows as square
- **Page label prefixes**: Catch game labels now use GPt (touch) / GPm (mouse) prefixes instead of generic GP
- **Title**: "MathGrain Domino" → "MathGrain Games" on setup page
- **Page name label position**: Moved next to home button (`top: 20px; left: 100px`)

### Catch Mouse Mode (GP Cm Setup)
- **Single-player setup**: In mouse mode, skips "How many players?" — shows single-player icon+name+Start directly
- **No GPC21 intermediate page**: Start button goes directly to game
- **Heading**: "The Level of Difficulty:" instead of "Choose your game"
- **Bubble icons**: Level selector buttons show bubble SVGs instead of domino SVGs (2/3/4 bubbles)
- **Labels**: "2 bubbles", "3 bubbles", "4 bubbles" instead of "dominos"
- **Game options row preserved**: Only the "How many players?" h3 is hidden, not the entire options row
- **`_resetSetupPanel()`**: Restores original labels ("dominos") and original domino SVGs when leaving mouse mode
- **`_bubbleSVGs`**: Inline SVG objects with circle/triangle/star keys for each level

### MPP for Catch Games
- **`openMppForCurrentView()`**: Wrapper that detects Find vs Catch using `_getCurrentViewGame()`, sets `mppGameType`
- **`mppGameType`**: Module-level variable — 'find' or 'catch'
- **Bubble-based editor**: One large bubble + 2/3/4 smaller bubbles per level, with circle-clipped card images
- **`_bubblePos`**: Module-level object with circle/triangle/star keys defining bubble positions and radii
- **`applyMppConfigToClone()`**: Catch branch renders card images inside circles with white background, clip-path, and border
- **Storage**: Catch MPP config loads/saves from `savedCatchGames[].mppConfig` instead of `savedCustomGames`
- **Hint text**: "Click a bubble, then click a card" for catch mode

### AGC Scroll Fix
- **`#game-view-content`**: `display: flex; flex-direction: column; overflow: hidden;` — titles stay fixed
- **`#game-view-cards`**: `flex: 1; overflow-y: auto; min-height: 0;` — only cards scroll
- **CSS cache busting**: Version bumped to `style.css?v=agc-scroll-cards-1`

### Rotation Bug Fix ("28" rotated 90°)
- **Root cause**: Card SVG data can contain top-level `<g transform="rotate(...)">` wrappers from the variation toolbar or loupe rotate tool. These rotations get baked into `svgMarkup` and cannot be undone.
- **Auto-strip**: Added `_stripRotationWrapper(svg)` helper to both files — detects single top-level `<g>` with pure rotation transform and unwraps it. Applied in `getGameCardSVG()` and `getGameCardSVGWithFallback()`. Only strips rotations, not reflections or other transforms.
- **Undoable loupe rotate**: `loupeTransformInPlace()` now adds `<g>` wrapper to `drawHistory` with `data-loupeTransform` marker. `drawUndo()` detects these markers and unwraps children instead of just deleting.
- **Removed stale variation loading**: Player page `startCustomGame()` no longer loads `cardMakerVariations` from localStorage (admin page migrated away from this system; stale data could add unwanted rotated versions to SVG pools).

### Key Technical Details
- **Dual-file architecture**: `index.html` (player) and `pm-studio-DrV.html` (admin) have SEPARATE copies of Catch game code; changes must be applied to BOTH
- **`_getCurrentViewGame()`**: Returns `{game, games, type, index}` abstracting Find vs Catch game access
- **`_catchGame` state**: Runtime game state including `inputMode`, `gameCardShape`, `gameCardCornerR`, `gameCardScale`
- **`_catchInputMode`**: Global variable 'touch' or 'mouse'
- **`_showSetupLabel()`** in game.js: Now checks `_pendingCatchGameIndex` and `_catchInputMode` to set correct GPt/GPm label
- **`createVariationSVG()`**: Wraps SVG children in `<g transform="..." data-variation-transform="1">` — the `data-variation-transform` attribute marks variation-created wrappers

## April 15 Session Notes — Card Identity Architecture (stableId)

### Card Data Architecture Redesign
- **Goal**: Move from fragile label+uid system to stable IDs with bidirectional game references
- **stableId format**: `timestamp_setName_label_randomSuffix` (e.g., `1776225831421_Multiplyby4_I8_zsw5`)
- **Migration strategy**: Additive — new fields added alongside old ones, nothing removed, rollback possible at any time

### Step 1: stableId Generation for New Cards (DONE)
- `generateStableId(label, cardSet)` and `getCurrentCardSetName()` added (~line 2258)
- Applied to all card creation paths: `addCopyCard()`, `addNewDrawnCard()`, `addVariation()`, `copyCardInRow()`
- All 4 serialization blocks in `saveCustomCards()` include stableId/origin fields
- `dataset.origin` tracks creation method: 'copy', 'draw', 'var'

### Step 2: Migrate Existing Cards (DONE)
- Migration code in `buildNumbersCardSet()`, `buildCustomCardSet()`, `buildAbcCardSet()`
- Generates stableId on first load, saves migrated data back to localStorage
- Only runs when Card Maker editor is opened (build functions trigger on "Edit" click)

### Step 3: Link Game Cards to stableId Source (DONE)
- `buildGameViewCard()` copies stableId from Card Maker DOM or localStorage to game card data
- `_findStableIdFromStorage()` 3-pass matching: (1) UID across ALL sets, (2) SVG content match, (3) label match with cardSet preference
- `_migrateAllGameStableIds()` runs after each build function via debounced `_scheduleGameStableIdMigration()`
- Game Maker card selection and `confirmAddCards()` now include stableId

### Firebase Backup Fix
- Card backup was exceeding Firestore's 1MB document limit (all SVG data in one doc)
- Fixed: `_pushCardBackup()` now splits JSON into ~800KB chunks (same as main sync)
- `syncRestoreCardBackup()` handles both old single-doc and new chunked formats
- Old backup cleanup properly deletes chunk subcollections

### Step 4: Reverse Lookup — stableId to Games (DONE)
- `findGamesUsingCard(stableId, label, svgMarkup)` — scans Find and Catch games
- Returns `[{name, type, index}]` with matching priority: stableId > SVG content > label

### Step 5: Delete-with-Games-Check Dialog (DONE)
- `confirmDeleteCard()` checks `findGamesUsingCard()` before deleting
- `_showDeleteCardDialog()` shows overlay with game list and action buttons
- `_removeCardFromAllGames(stableId)` filters out cards from all Find and Catch games

### Step 6: Safe Haven Card Set (DONE)
- `_ensureSafeHavenExists()` — auto-creates "Safe Haven" set in savedCardSets if missing
- `_moveCardToSafeHaven(card)` — serializes card DOM data, adds to `customDrawnCards_Safe Haven`, removes from current set
- `_isInSafeHaven()` — checks if active card set is Safe Haven
- Delete dialog changes:
  - Card NOT in games, NOT in Safe Haven → "Move to Safe Haven" (green) / "Delete permanently" (red) / "Cancel"
  - Card IN games, NOT in Safe Haven → "Move to Safe Haven" (green) / "Delete from Card Maker and all games" (red) / "Cancel"
  - Card IN games, IN Safe Haven → "Delete from Safe Haven and all games" (red) / "Cancel"
  - Card NOT in games, IN Safe Haven → simple confirm to permanently delete
- Safe Haven in Library: shield icon, green text, no delete/move/rename buttons, rendered first in unfiled list
- `deleteCardSet()` and `renameCardSet()` block Safe Haven from being deleted or renamed
- Cards keep their stableId when moved to Safe Haven, so game references remain valid
- `movedFrom` field tracks original card set name
- **Move button** (green ↷, bottom-right): Replaces "Restore" button — lets user move card from Safe Haven to any card set
- `_showRestoreCardDialog(card)` — dialog lists all card sets; original set highlighted in green with "(original)" label
- `_restoreCardToSet(card, targetSetName)` — direct localStorage writes (bypasses DOM save chain to prevent data overwrites)
- `_nextBottomRowLabel(storageKey)` — assigns unused bottom-row label to avoid collisions when moving cards
- **Bugfix**: `_moveCardToSafeHaven` no longer calls `deleteCard()` (which removed card from games); uses direct DOM removal instead
- **Bugfix**: `_restoreCardToSet` bypasses `saveVariations()` → `saveCustomCards()` chain which was overwriting the target set's localStorage

### Step 7: stableId-First Lookup (DONE)
- `_findCardDataByStableId(stableId)` — searches ALL card storage keys for matching stableId
- `buildGameViewCard()` rewritten with 3-tier pipeline:
  1. PRIMARY: `_findCardDataByStableId(cardInfo.stableId)` → build from `storedCard.svgContent`
  2. MIGRATION: DOM lookup by label/uid → get stableId → retry; or `_findStableIdFromStorage()` → retry
  3. LAST RESORT: `buildCardFromMarkup(cardInfo)` using stored svgMarkup snapshot
- `getGameCardSVGWithFallback()` updated similarly: stableId lookup → DOM → svgMarkup

### Step 8: Stop Storing svgMarkup Snapshots (DONE)
- **WRITE side** — 3 locations conditionally skip svgMarkup when stableId present:
  - Game Maker card selection (~line 4647): `if (!info.stableId && cardSvgEl) info.svgMarkup = ...`
  - Game Maker re-selection (~line 7031): same conditional
  - `confirmAddCards()` (~line 7674): `if (!hasStableId) cardEntry.svgMarkup = markup`
- **READ side** — all rendering paths updated for stableId-first:
  - SVG pools builder: uses `getGameCardSVGWithFallback()` (stableId → DOM → svgMarkup)
  - `_catchBuildCardSVG()`: stableId lookup added before svgMarkup/DOM fallback
  - `syncAllCardsToGames()`: skips svgMarkup writes for stableId cards (regular + catch games)
  - `syncABCCardsToGame()`: skips svgMarkup writes for stableId cards
  - `migrateAllGameSvgMarkup()`: proactively deletes old svgMarkup from stableId cards on page load (regular + catch)
- **Result**: Game data is significantly smaller in localStorage; games always show latest card artwork via live stableId lookup

### Key Functions Added
- `generateStableId(label, cardSet)` — creates stable ID for new cards
- `getCurrentCardSetName()` — returns proper set name for active card set
- `_findStableIdFromStorage(label, uid, cardSet, svgMarkup)` — 3-pass lookup from localStorage
- `_getAllCardStorageKeys()` — collects all card storage keys
- `_migrateAllGameStableIds()` — migration for all game cards (called after build functions)
- `_scheduleGameStableIdMigration()` — debounced 3s wrapper to avoid Firebase rate limiting
- `findGamesUsingCard(stableId, label, svgMarkup)` — reverse lookup: card → games
- `_removeCardFromAllGames(stableId)` — remove card from all games by stableId
- `_ensureSafeHavenExists()` — auto-create Safe Haven card set
- `_moveCardToSafeHaven(card)` — move card from current set to Safe Haven
- `_isInSafeHaven()` — check if current set is Safe Haven
- `_showSimpleDeleteDialog(card, labelText)` — delete dialog for cards not in games
- `_showDeleteCardDialog(card, labelText, stableId, gamesUsing)` — delete dialog for cards in games
- `_findCardDataByStableId(stableId)` — searches ALL card storage keys for matching stableId (Step 7)
- `_showRestoreCardDialog(card)` — dialog to move card from Safe Haven to any card set
- `_restoreCardToSet(card, targetSetName)` — move card between sets via direct localStorage writes
- `_nextBottomRowLabel(storageKey)` — find unused bottom-row label for moved cards

## April 17 Session Notes — Text-Marker Labels, Word Import, Row Letters

### Text-Marker Auto-Relabeling (DONE)
- Cards auto-relabeled on Card Maker exit based on actual DOM position + text content
- Format: `A2_5+3` (row letter + position number + underscore + text from SVG `<text>` elements)
- `_extractTextMarker(card)` — extracts text from SVG, replaces ÷→/, ×→x, √→sqrt, truncates at 20 chars
- `_relabelAllCards()` — batch relabels all cards, runs in `leaveCardMaker()` and `saveAndLeaveCardMaker()`
- `_isAutoLabel(label)` — detects auto-generated labels (pattern `^[A-Z]\d+(_.*)?$`) vs user-named
- `_updateGameLabelsAfterRelabel(relabelPlan)` — updates game card labels via stableId match (Find + Catch games)
- User-named cards prompt before auto-renaming
- Row naming plan: A-Z, then a-z (52 rows max; more than enough)

### Import from Word (.docx) — Stage 1 (DONE)
- Blue "W" button in Card Maker toolbar opens file picker for .docx upload
- Uses JSZip CDN to unzip .docx, parses `word/document.xml` for table data
- `_handleDocxImport(input)` — reads .docx, extracts XML, triggers preview
- `_parseDocxTableXml(xmlStr)` — parses Word XML, extracts table rows/cells as plain text
- `_extractCellText(cell)` — extracts text from `<w:r>` / `<w:t>` elements
- `_showImportPreview(tableData)` — preview dialog: shows rows found, card count, card texts
- `_buildImportCardSVG(text)` — creates SVG with auto-sized centered text (font size adjusts by text length)
- `_createCardsFromImport(rowSummaries)` — batch-creates cards via `addNewDrawnCard()`
- **Table format**: First column = row letter (A, B, C...), other columns = card text. Empty cells skipped.
- Cards append to end of existing rows; new rows created as needed

### Import from Word — Remaining Stages (planned)
- **Stage 2**: Parse Word equation editor (OMML) for fractions — render as SVG with numerator, bar, denominator
- **Stage 3**: Extended math — square roots (`<m:rad>`), parentheses (`<m:d>`), superscripts/subscripts (`<m:sup>`, `<m:sub>`)

### Persistent Row Letter Labels (DONE)
- Row letters (A, B, C...) now always visible in Card Maker as small gold text at left edge of each row
- CSS `::before` pseudo-element on `[data-row-letter]`, no JS needed
- Empty rows retain larger letter styling
- Visible in both normal and compact view

## April 18 Session Notes — Group Edit Mode

### Group Edit Mode (DONE)
- Purple "GE" button in Card Maker toolbar enters Group Edit mode
- Click cards to select (blue highlight), right-click (desktop) or long-press (mobile) to set reference card (gold highlight + star)
- Floating toolbar at bottom with 5 independent actions:
  1. **Center** — centers text horizontally (`x=30`, `text-anchor=middle`), no reference needed
  2. **Aa Size** — copies `font-size` from reference card's text to all selected
  3. **Bottom** — aligns text baseline (`y` attribute) to match reference card
  4. **F Font** — copies `font-family`, `font-weight`, `font-size`, `font-style` from reference
  5. **Color** — copies `fill` attribute from reference card's text to all selected
- Select Row and Select All convenience buttons
- Actions are independent: apply any combination in any order
- Green flash toast confirms each action
- Mode blocks other modes (Game Maker, Shape Mode) and vice versa
- Auto-exits when leaving Card Maker
- Help popup updated with GE description
- **Erase Group**: Deletes selected cards; cards used in games are protected with warning listing game names
- **Reference card interaction**: Right-click (desktop) or double-tap (mobile) sets reference card
- Button label: "Gr" (changed from "GE")

### Desktop-First Studio Proposals (APPROVED — implementation status below)
User selected these items from the organized checklist. All items below are approved.

**COMPLETED:**
- **U1**: Global undo/redo system — snapshot-based, captures all card-related localStorage keys before each save. Ctrl+Z / Ctrl+Shift+Z wired globally. Loupe draw redo via `drawRedoStack`. Swap-in-place entries work for both undo and redo.
- **K1**: Esc exits mode — priority: context menu → overlay → loupe → Group Edit → Shape Mode → passive selection.
- **K2**: Delete/Backspace deletes selected cards — works with both Group Edit and passive (shift-click) selection. Game-usage protection preserved.
- **K3**: Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo — global + loupe draw level. Redo stacks cleared on new mutations.
- **K4**: Cmd/Ctrl+C/V copy/paste — in-memory `_cardClipboard` array. Paste is batch-undoable (single Ctrl+Z undoes entire paste).
- **K5**: Cmd/Ctrl+A select all — enters Group Edit if not active, then selects all visible cards.
- **K6**: Arrow key nudging in loupe — 1 grid cell per press, Shift+arrow = 10 grid cells. Coalesced undo (500ms pause = new undo step). Guarded against text-input focus and open inline text editor.
- **S1**: Shift+click multi-select — passive selection outside Group Edit. Reuses `groupEditSelected[]` and `.ge-selected` CSS class. K2/K4/K5 work on passive selection.
- **S2**: Right-click context menu — Normal mode: Edit in Loupe, Copy, Delete, Move to… (row submenu), Set as Reference, Properties dialog. Group Edit mode: Set as Reference, Select All, Copy/Delete Selected, Exit Group Edit. Esc/click-away/scroll closes.
- **S3**: Drag-and-drop files from OS — drop SVG or raster image files onto Card Maker. SVGs compressed + parsed; rasters embedded as data-URL `<image>` in 60x60 SVG wrapper. Drop zone overlay during dragover. Multi-file batch-undoable.
- **L1**: Denser toolbars for desktop — `@media (min-width:1025px)` block in `css/style.css` reduces padding/gap/button-size for `.zoom-btn`, `.draw-tool-btn`, `.var-tool-btn`, `.zoom-panel`, `.variation-toolbar`, etc. Mobile/tablet untouched.
- **L4 (Option B)**: Resizable loupe — right edge / bottom edge / SE-corner drag handles resize `#loupe-card-container`. Min 200px, max fills viewport (minus 60px toolbar). Double-click any handle snaps back to default size + zoom=1 via `_loupeResetSize()`. Drawing coords already use `getBoundingClientRect()`, so no `loupeCoords()` update needed. Handles live in `#loupe-overlay` (NOT inside the container — container has `overflow:hidden`+`border-radius:50%` for circle cards which would clip them); positions tracked via `ResizeObserver` and repositioned on window resize. Faint gold tint (`rgba(196,164,90,0.18)`) makes them discoverable; brightens to `0.55` on hover. Hidden on coarse-pointer devices via `@media (hover:none) and (pointer:coarse)`.
  - **Handle semantics** (H=1 unit always per user spec):
    - **Bottom edge / SE corner** = proportional **zoom**. Container w and h scale together via single `_loupeZoom` factor. Persisted via `localStorage.loupeZoom_v1`. Double-click clears.
    - **Right edge** = **shape change** (modifies the card's W:H aspect ratio). Live updates `currentCardWidth`; converts `currentCardShape` to `'rect'` if it wasn't already. NOT persisted via localStorage — commits via existing `drawSave()` → `_saveCardShapeToCard()` flow on Save. Closing without save discards (next open reads stored shape via `_loadCardShapeFromCard`).
  - Key helpers: `_ensureLoupeResizeHandles()`, `_attachLoupeResizeHandles()`, `_positionLoupeResizeHandles()`, `_computeLoupeDefaultSize()`, `_loupeResetSize()`, `_wireLoupeResizeHandle()`, `_applyLoupeZoom()`, `_load/_save/_clearLoupeZoom()`.
- **Loupe `++` button removed**: Double-click on any card is the sole way to open the Card Editor (loupe + draw mode). Removed `#loupe-mode-btn` HTML; `toggleLoupeMode()` reduced to an inert shim; `loupeMode` var kept as `false` stub so any stale `if (loupeMode)` branches never fire. Replaced button in `#zoom-panel` with a placeholder `zoom-panel-btn`. Known issue: if you drag to a non-square aspect ratio on square/circle cards, the card SVG letterboxes (grid only covers the SVG, not the beige bands). Fix deferred pending decision on aspect-ratio lock.

**NOT YET STARTED:**
- **L2**: Multi-column card display in Card Maker (toggle between row view and grid view)
- **L3**: Dockable/collapsible panels (loupe, tools — floating panels with drag handles)
- **C1**: Remove mobile-only touch handlers from Studio page

### Implementation Phases (final plan)
**Phase 1 — Foundation ✅ DONE**
- **U1**: ✅ Global undo/redo system — snapshot-based with swap-in-place entries.
- **C1**: Not yet started (lower priority cleanup).

**Phase 2 — Keyboard Shortcuts ✅ DONE**
- **K1–K5**: ✅ All implemented. Batch undo for Group Edit delete + paste.
- **K6**: ✅ Arrow key nudging in loupe — 1 grid cell / Shift = 10 grid cells. Coalesced undo. Guarded against text-input focus.

**Phase 3 — Selection & Input ✅ DONE**
- **S1**: ✅ Shift+click multi-select (passive selection outside Group Edit).
- **S2**: ✅ Right-click context menus with Properties dialog.
- **S3**: ✅ Drag-and-drop files from OS (SVGs + rasters).

**Phase 4 — Layout (L1 + L3 + L4 done; L2 deferred)**
- **L1**: ✅ Desktop-denser toolbars via `@media (min-width:1025px)` in `css/style.css`.
- **L4**: ✅ Resizable loupe (right edge, bottom edge, SE corner). Double-click a handle resets to default size.
- **L2**: Deferred — toggle was implemented then reverted (commit `395f7ed`) because with typical per-letter card counts (3-5 cards) row view and grid view looked identical. Revisit if card sets grow large enough to need wrapping.
- **L3**: ✅ Draggable floating panels (draw-tools panel + variation toolbar). 3-dot grip handles at the top of each panel; click-drag to move; double-click to reset to CSS default. Positions persist in `localStorage.drawToolsPanelPos_v1` and `localStorage.variationToolbarPos_v1`. `_syncLoupeOverlayPadding` only reserves right-side padding when the draw-tools panel is docked in the right 40% of the viewport, so dragging it left expands the loupe card. Generic helper `_wirePanelDrag(panel, handle, key)` shared by both panels. Light-theme CSS variant `.panel-drag-handle-light` for the cream-colored variation toolbar.

**C1 (cleanup): ✅ done.** Audit showed no `touchstart/touchmove/touchend` handlers exist in the Studio page — all input is handled via Pointer Events. The actual scope turned out to be desktop-ifying mobile-oriented UX language: 4 UI strings ("tap" → "click", "double-tap" → "right-click") in the Group Edit tooltip, title bar, selection counter, and help popup, plus one code comment. Double-click-to-set-reference handler in Group Edit kept intentionally as a redundant fallback (S2 right-click context menu is the primary gesture). `touch-action: none`, `@media (hover:none) and (pointer:coarse)`, and responsive `@media (max-width: …)` CSS blocks all kept for graceful degradation on touch-capable screens.

## April 19–20 Session — Post-Phase-4 UX Polish

Phase 4 shipped; this session focused on Group Edit refinements, removing
the now-redundant Shape Mode, clickable row letters, duplicate-name
handling for games, and assorted visual cleanup. Current HEAD: `1fbb84c`.

### Group Edit: new 'Shape' action (commit `7f8d59c`)
New 7th button `▢ Shape` between Color and Erase. Copies the reference
card's `cardShape` + `cardShapeW` + `cardShapeH` + `cardCornerR` to every
other selected card. Uses existing `_applyShapeToPreview` +
`saveVariations` pipeline, so thumbnails, Library preview, and game
renders all update through the normal flow. Undo supplied by
`saveVariations()`'s snapshot. Key func: `geActionShape()`.

### Group Edit toolbar redesign (commits `2d96288`, `e8da3d9`, `3cf6000`)
- Reshaped from ~450-px wide bottom-centered bar → 144-px wide, left-docked
  floating box. Default position is computed to sit directly **below the
  Gr button** in the left tool strip (via `_positionGEToolbarBelowGrButton`)
  but respects a user-saved drag position if one exists.
- Action buttons are **icon-only** (`↔ Aa ▂ F ● ▢`) with native tooltip
  labels on hover. CSS grid 2×3 layout; Erase gets its own full-width row;
  nav row (All, Exit) at the bottom.
- Draggable via shared L3 helper: 3-dot grip at the top, position stored
  in `localStorage.groupEditToolbarPos_v1`. Double-click the grip resets
  to the default (under-Gr-button) position.
- Visual polish: action buttons + nav buttons switched to **white**
  borders and text; Erase kept red; Gr button text in the left strip
  changed from purple to white for consistency.

### Clickable row letters + GM Select All/Clear (commit `83a3318`)
- Row letters (A, B, C…) were CSS `::before` pseudo-elements, which can't
  receive mouse events. Replaced with real `<span class="library-row-letter">`
  elements via new helper `_addRowLetterSpan(row)`, called at all four
  `row.dataset.rowLetter = letter` sites (Numbers, ABC, custom, drag-
  and-drop row creation). Legacy `::before` neutralised to
  `content: ''; display: none` so stale rows don't double-render.
- Body classes `.game-maker-active` / `.group-edit-active` toggled via
  new `_syncModeBodyClasses()` helper on every GM/GE transition. CSS
  shows hover affordance (gold tint + pointer cursor) for row letters
  only when one of these modes is active.
- Click a row letter: toggles selection of every card in that row. If any
  card unselected → select all; if all selected → deselect all.
- New shared selection helpers: `_gmAddCard`, `_gmRemoveCard`,
  `_gmSelectAllVisible`, `_gmClearAllVisible`, `_geAddCard`,
  `_geRemoveCard`.
- Game Maker bar gains two buttons: **Select All** (every visible card
  in the active set) and **Clear**.
- Group Edit toolbar's `Row…` prompt button removed — row-letter click is
  the faster replacement.

### Shape Mode removed (commit `62115c5`)
The ⬡ Shape Mode button (left A-CM tool strip) and its `#shape-mode-popup`
are gone — Group Edit's Shape action covers the workflow. Inert stubs
(`enterShapeMode`, `cancelShapeMode`, `shapeModeSelectAll`,
`applyBatchShape`, `applyBatchRectWidth`, `applyBatchCornerRadius`) remain
so existing guards like `if (shapeModeActive) return;` and escape-key
handlers keep compiling. `shapeModeActive` stays `false` forever. Help
popup entry removed.

### Duplicate game-name handling — Option 3 (commit `c121de4`)
When creating a new game or renaming one, if the name collides with
another game in the **same list** (Find and Catch are independent
namespaces), a re-prompt appears with an auto-suffixed suggestion
pre-filled:

> "A game named "Match 0-4" already exists.  
> Save as: `Match 0-4 (2)`"

User can hit OK (accept), edit the name and OK (re-validated), or Cancel.
- Comparison is **case-insensitive** and whitespace-trimmed.
- Suffix starts at `(2)` because the original is implicitly `(1)`.
- Names already ending `" (N)"` have the root extracted so
  `Match (2) (2)` doesn't happen.
- Renaming a game to its own current name is a no-op (self excluded via
  `currentIndex`).
- Wired at three sites: `+ New Game` prompt, Find rename, Catch rename.
- Helpers: `_resolveGameNameCollision`, `_autoSuffixGameName`.

### Misc visual tweaks
- Slider labels in Card Editor: **Aa → Size, r → fine, × → Scale**.
  Also made the three `.draw-size-row` sliders dim to ~28 % opacity and
  non-interactive whenever no element on the card is selected, via new
  `_updateDrawSizeActivation()` helper called at every selection change
  (commit in earlier session, re-noted here for continuity).
- Help "?" button moved to `right: 94px` and switched to `position: fixed`
  so it lines up horizontally with the "Saved" pill and "Vica" user badge
  (earlier commits `1aff11e`, `2e6cbbf`).
- Corner-radius button icon swapped from an ellipse to an L-shaped
  bracket (earlier commit `175a3fb`).
- **W** (Word import) button recoloured from blue (`#64B5F6`) to green
  (`#7eff7e`) so it visually groups with the `+` New Card button (commit
  `1fbb84c`).

### New localStorage keys this session
| Key | Purpose |
|-----|---------|
| `groupEditToolbarPos_v1` | Saved drag position for the Group Edit toolbar |

(`drawToolsPanelPos_v1`, `variationToolbarPos_v1`, `loupeZoom_v1` were
already documented in Phase 4.)

### Recommended next steps
With Phase 4 done and this polish round complete, candidates to scope next:
- **L2 revisit** if card sets grow enough to benefit from grid wrapping.
- **Math equation editor** — mentioned in April 2 pending list; biggest
  remaining feature idea.
- **Retire Shape Mode stubs** — safe to delete once we've verified nothing
  calls them for a while.
- Any new UX tweaks the user surfaces.

### Key technical details for continuity
- **Trial timestamps**: Run `bash scripts/bump-trial.sh` before every commit that touches `index.html` or `pm-studio-DrV.html` — it updates all 5 locations to the current Los Angeles time. The pre-commit hook at `.githooks/pre-commit` does this automatically when enabled (`git config core.hooksPath .githooks`).
- **3-branch push**: Every push goes to `claude/general-session-yVBQq`, `master`, and `claude/review-project-docs-JOOeh`.
- **Undo system**: Snapshot-based (`_undoPushSnapshot()` before mutations). Batch operations use `_undoSuspended = true` to collapse multiple mutations into one undo step.
- **S2 context menu**: Functions `_ctxShow()`, `_ctxClose()`, `_ctxItem()` at ~line 5010 of pm-studio-DrV.html.
- **S3 drag-drop**: IIFE at ~line 5210 of pm-studio-DrV.html. Async file reads with completion counter for batch undo.
- **L1 desktop density**: `@media (min-width:1025px)` block at end of css/style.css (~line 5812+).
- **Loupe functions**: `openLoupe()` at line ~1404, `_isLoupeOpen()` at line ~7121, `drawKeyHandler` at ~line 4000.
- **Card creation**: `addNewDrawnCard(svgEl, cardName)` at ~line 4707. Always uses viewBox `0 0 60 60`.

## April 22–23 Session — Game Settings (Phase A.1 + A.2)

The admin gets a per-game configuration matrix that drives what the
player sees on the setup screens. Cogwheel ⚙ in Game View opens the
modal. Touch / Mouse tabs are independent.

### Phase A.1 — admin-side modal (commits `37e4fae` → `5ec898d`)
- Cogwheel button on Find / Catch Game View.
- Modal with **Touch** and **Mouse** tabs, each holding three axes:
  **Player Options** (1P+timer / 2P / 2P+timer), **Level** (Find only —
  Catch hides this), **Type of Game** (Type 1 / 2 / 3 placeholder).
- Per axis: editable axis label + per-option checkbox + editable label.
- **Timer** field at the top (Find default 20s, Catch default 6s).
- **⎘ Touch → Mouse** button: deep-copies the touch matrix into mouse.
- **⎘ From another game…** picker: clones settings from another
  same-type game.
- **Save** persists `game.setup = { timer, touch, mouse }` onto the game
  record (Find: `findGames`, Catch: `catchGames`).
- **Bug fixed mid-session (`5ec98d`)**: cogwheel click ran but modal was
  invisible — modal was inside a clipped/hidden parent. Fix: relocate the
  overlay to `<body>` level on first show.
- Key functions in `pm-studio-DrV.html` ~line 9250+:
  `_defaultGameSetup`, `_getGameSetup`, `_saveGameSetupToCurrent`,
  `openGameSettingsModal`, `_gsRenderTab`, `_gsCaptureForm`,
  `_gsCopyTouchToMouse`, `_gsOpenCopyFromGame`, `saveGameSettings`.

### Phase A.2 — player-side runtime consumer (commit `3858b5c`)
The player setup screens (GP F Setup / GPt Ct Setup / GPm Cm Setup) now
read `game.setup[currentInputMode]` on game launch and:
- hide deactivated `.player-btn` rows (`display:none`).
- hide deactivated `.level-btn-wrapper` rows (Find only).
- substitute admin-custom labels on player buttons + `.level-label` spans.
- replace the h3 headers ("How many players?", "Choose your game:") with
  the admin's axis labels (defaults match the original strings).
- stash timer on `window._currentGameSetupTimer` for gameplay code (Phase
  A.3 to consume).

Input-mode detection:
- **Catch** → `_catchInputMode` (`'touch'` or `'mouse'`, set by the popup
  on GP 0).
- **Find** → `_hasTouchScreen` (true on iPad, false on Mac/desktop).

Hook sites in `index.html`:
- `// Phase A.2: apply admin's matrix for this catch game` (~line 990)
- `// Phase A.2: apply admin's matrix for this find game` (~line 1152)
- `_resetSetupPanel` (~line 869) — restores original labels + show-all
  on game switch so customizations don't leak between games.

## April 25 Session — Game Settings: lockedOff removed (commit `6303149`)

Yesterday's Phase A.1/A.2 had a hard-coded restriction: in Mouse mode the
2-player rows were locked off (gray, disabled, "(N/A in mouse mode)"
note). User feedback: **the admin decides what's possible, not the
system.** A 2-player turn-taking game can work fine with a mouse. If a
specific game-set genuinely can't support 2P, that should surface as a
creation-time warning (separate, future task).

Changes in `pm-studio-DrV.html`:
- `_defaultGameSetup`: `mouse.players` now uses the same `mkAxis()`
  helper as `touch.players`. All three options on by default.
- Option-row builder (`_gsRenderTab`): dropped the `.locked-off` class,
  the `cb.disabled` flip, and the "(N/A in mouse mode)" note. Every
  option is now editable.
- `_gsCopyTouchToMouse`: plain deep-copy of touch → mouse (no
  flag-preservation pass).
- `_getGameSetup`: strips any legacy `lockedOff:true` from stored saves
  on load — games saved between Apr 23 and Apr 25 self-heal on next open.

CSS: dropped the dead `.gs-option-row.locked-off` and `.gs-locked-note`
rules from `css/style.css`.

## April 25 Session (cont.) — Uniform 3-axis console + UC badges + dynamic options (commit `4e1ab3d`)

The Game Settings modal is now identical for Find and Catch: three axes
(**Player Options**, **Level**, **Type of Game**) plus the timer.

### `_defaultGameSetup` changes (`pm-studio-DrV.html` ~line 9250)
- `mkAxis(labels, axisName, defaultOn)` — new third param. Default `true`.
- **Level axis always present for both game types.** Catch defaults all
  Level options to `on: false` so visible player behavior is identical to
  before (Phase A.2 hides any axis with all-unchecked options).
- **Type of Game axis defaults all-off** for both game types (no player
  picker exists yet; nothing would happen if they were on).
- Touch and Mouse blocks are now symmetric — same three axes each.

### Dynamic option count
- Per-axis **+ Add option** button appended to `.gs-options` container.
  Adds a new option `{ id: 'opt<n+1>', label: 'Option <n+1>', on: false }`
  and re-renders.
- Per-row **✕** remove button. Disabled when only one option remains
  (min-1 enforced). Form values are captured first so in-progress edits
  on other rows aren't lost on re-render.
- Helpers: `_gsAddOption(axis)`, `_gsRemoveOption(axis, idx)`.

### "🚧 Under construction" badges
- Helper `_gsIsAxisUC(gameType, axis)` returns true when:
  - `axis === 'types'` (both game types — no player picker)
  - `axis === 'levels' && gameType === 'catch'` (no Catch level UI)
- Timer field gets a permanent UC badge until Phase A.3 wires it to
  gameplay. Static HTML span `#gs-timer-uc-badge` is always shown by
  `_gsRenderForm`.
- CSS: `.gs-uc-badge` — small orange pill with tooltip "Admin can edit
  this, but no runtime/player code uses it yet."

### Player-side constraint (important to remember)
- `index.html` hardcodes **3 `.level-btn-wrapper` rows** (line 79, 104,
  138) for Find, each tied to a specific `data-level` enum
  (`circle` / `triangle` / `star`) consumed by gameplay code. Adding a
  4th Level option in the admin matrix **saves fine** (localStorage has
  no row count limit) but **does not render a 4th button** on the player
  side. The UC badge on "Level (Catch)" and "Type (both)" covers
  axis-wide cosmetic behaviour; per-option "beyond-N" warnings on the
  Find-Level axis are a future refinement if the discrepancy becomes
  confusing.

### Modal template HTML changes
- `gs-timer-row` gained `<span class="gs-uc-badge" id="gs-timer-uc-badge">`.
- Axis section templates unchanged — `.gs-options` container gets the
  add-button appended dynamically by `_gsRenderForm`.

### CSS additions (`css/style.css` ~line 2593)
- `.gs-axis-label-row` became flex so the badge sits next to the axis
  label input.
- New: `.gs-uc-badge`, `.gs-add-option-btn`, `.gs-remove-option-btn`
  (with `:disabled` and `:hover:not(:disabled)` states).

### Phase A.3 — NOT YET DONE (DEFERRED, UC badge stays)
Per April 26 user direction: "timer is a very long and hard issue.
Put the symbol 'under construction' on timer and lets move to the next
item." — A.3 is parked. Timer field permanently shows the 🚧 badge until
revisited.
- When eventually picked back up: wire `window._currentGameSetupTimer`
  into actual gameplay:
  - **Find / Xeno timer**: hardcoded 20s in `js/game.js` should read the
    admin override (3 sites: lines 135, 1260, 3419).
  - **Catch fall-duration**: hardcoded 6s should read the admin override.
- Decide what to do when admin's timer is 0 / blank (treat as "use
  hardcoded default"?).

## April 26 Session — Apply to… (commit `3224e4a`)

A new **"Apply to…"** button in the Game Settings modal footer opens a
picker overlay that propagates the current matrix to other games.

### Two independent selectors
**What to apply** (4 checkboxes, all-checked by default — Granularity A
per user choice):
- ☑ Timer value
- ☑ Player Options axis (Touch + Mouse together)
- ☑ Level axis (Touch + Mouse together)
- ☑ Type of Game axis (Touch + Mouse together)

**Where to apply** (5 radios):
- ⦿ This game only (default — same effect as Save)
- ◯ All Find games
- ◯ All Catch games
- ◯ All games (Find + Catch)
- ◯ Pick specific games… → reveals a scrollable
  `[Find] / [Catch]`-prefixed checklist of every game

### Implementation (`pm-studio-DrV.html`)
- New helpers: `_gsOpenApplyTo`, `_gsCloseApplyTo`,
  `_gsApplyScopeChanged`, `_gsResolveTargets`, `_gsApplyToConfirm`.
- `_gsCaptureForm()` runs on Open and again on Confirm so any
  in-progress edits in the main modal are included.
- Apply button label updates live: "Apply" for ≤1 target,
  "Apply to N games" otherwise. Bulk applies (≥2 targets) get a
  `confirm()` dialog before write.
- Per-target write only touches checked sections; unchecked sections
  stay untouched in target games.
- Find writes go through `localStorage.setItem('savedCustomGames', …)`;
  Catch writes go through `saveCatchGames(…)`. Loads buffer once, write
  once per type.
- New overlay HTML `#gs-apply-overlay` with `z-index: 20100` so it
  stacks above the main `#game-settings-overlay`.
- New CSS: `.gs-btn-apply-to`, `.gs-apply-overlay`, `.gs-apply-section`,
  `.gs-apply-h`, `.gs-apply-check`, `.gs-apply-radio`,
  `.gs-apply-game-list`, `.gs-apply-game-row`.

## April 26 Session (cont.) — Prefix labels + current-game marker (commit `d7a895d`)

### Prefix labels for Levels and Type
Levels and Type-of-Game rows now render a **non-editable "Level N" /
"Type N" prefix** to the LEFT of the editable text box. Prefix is
computed live from row index — auto-renumbers when rows are
added/removed. Player Options stays free-form (no prefix).

Visual: `☑  [Level N]   [editable suffix]   ✕`

### Storage = suffix only
Stored labels are SUFFIX-ONLY for prefix-bearing axes. Migration regex in
`_getGameSetup`:
```
/^(Level|Type)\s+\d+\s*[—–-]\s*(.+)$/i
```
Strips prefix iff there's a separator + content after.
- `"Level 1 — 2 dominos"` → `"2 dominos"` ✓
- `"Type 1"` → no match, stays `"Type 1"` ✓
- `"Easy"` → no match, stays `"Easy"` ✓ (legacy Catch labels preserved)

Helper `_gsStripStoredPrefix(label)` does the strip; called inside the
schema-repair loop (alongside the lockedOff strip).

### Default suffix for fresh games
- Find-Level: `"2 dominos"`, `"3 dominos"`, `"4 dominos"`
- **Catch-Level: empty `""`** (per user spec — "I prefer start from
  numerical levels since there can be more than 3 levels of difficulty.
  but I can change to the words at any moment"). Old `"Easy/Medium/Hard"`
  hardcoded defaults dropped.
- Type: `"Type 1"`, `"Type 2"`, `"Type 3"` (matches prefix per user spec
  — visual reads `Type 1 [Type 1]` until renamed).

### Default suffix for "+ Add option" rows
- Find-Level / Catch-Level: empty
- Type: `"Type N"` matching prefix
- Player Options: `"Option N"` (legacy free-form)
Logic in `_gsAddOption(axis)`.

### Render helper
`_gsOptionPrefix(axis, idx)`:
- `'levels'` → `"Level " + (idx + 1)`
- `'types'`  → `"Type "  + (idx + 1)`
- else        → `""` (no prefix span rendered)

### Apply-to picker: current-game marker
The current game now appears in the "Pick specific games…" list with:
- `(current)` suffix on the name
- Faint gold tint (`.gs-apply-game-row-current`)
- Pre-checked checkbox

Admin can uncheck to "apply to others, leave this one alone" — but the
default scope still includes the current game, matching the other
"Where to apply" scopes.

### No player-side change needed
`index.html` `.level-label` spans already display the suffix only
(`"2 dominos"`, etc.). Phase A.2's label-substitution code in
`index.html` reads `axisData.options[i].label` directly, which is now
the suffix — exactly what the player should see.

### Future / deferred (open spec questions)
Each of these, when shipped, removes a UC badge from the Game Settings
modal:
- **Phase A.3 — timer wiring** → removes Timer UC badge. See above.
- **Dynamic player-side level rendering** (Find) — generate
  `.level-btn-wrapper` rows from the matrix instead of hardcoding 3 →
  admin's 4th+ Level option actually renders. Gameplay needs to define
  card counts for whatever levels are added.
- **Catch-Level player UI** — build a level picker into the Catch setup
  flow → removes Catch-Level UC badge.
- **Type of Game player picker** — build a picker into player setup that
  reads `game.setup[mode].types.options` → removes Type-of-Game UC badge
  for both game types. Need a spec on what "Type 1" / "Type 2" actually
  change in gameplay.
- **Creation-time warning** when a new game-set genuinely can't support
  2P, so the admin sees the constraint at creation rather than running
  into it after editing the matrix.

## April 26 Session (cont.) — Game-view edits: delete + copy + Cmd+Z (commits `384f106` … `a29e089`)

Parallel session in a different chat. Started on a fresh
`claude/fix-card-deletion-bug-ElUcy` branch (now deleted) before
switching to the standard 3-branch flow. **Lesson**: read
`docs/MEMORY.md` *first thing* on every session — this session burned
hours pushing fixes only to `claude/review-project-docs-JOOeh` because
the 3-branch rule wasn't read until the user pointed it out.

### Bugs fixed

- **Card deletion in game view didn't persist visually**.
  `_removeCardFromThisGame` (the × button handler in game view) called
  `openCustomGameView(...)` — a function that doesn't exist. The
  `ReferenceError` aborted the post-save re-render after
  `savedCustomGames` had already been written, so the card stayed on
  screen even though it was gone in storage. **Fix**: rename the call
  to `openGameView` (the actual function — the catch branch right
  above already used the correct `openCatchGameView` name).

- **Copy in Catch view created a square tile and was not persisted**.
  `copyCardInRow`'s "in Game View" persistence block was gated on
  `currentGameViewIndex >= 0`, which is only set for Find games. In
  Catch view (`currentCatchGameViewIndex >= 0`,
  `currentGameViewIndex === -1`) the entire block was skipped — the
  copy lived in DOM only and didn't get the game-level shape. Worse,
  any later × delete in the Catch view re-rendered from
  `savedCatchGames`, which still had only the original, so all unsaved
  copies vanished and looked like deletion bugs. **Fix**: replace the
  Find-only check with parallel Find/Catch handling that loads the
  right store, splices the new `cardInfo` (carrying `stableId`,
  `uid`, and shape attributes), and saves through
  `localStorage.setItem('savedCustomGames', …)` or `saveCatchGames(…)`
  as appropriate.

- **Deleting one of two same-labeled copies removed both**. The ×
  handler's filter fell back to `c.label === labelText` matching when
  `cardEl.dataset.stableId` was empty. The clicked tile had no
  `stableId` because `buildCardFromMarkup` wasn't writing
  `cardInfo.stableId` / `cardInfo.uid` onto the rendered tile's
  dataset, and `_buildGameViewCardInner` wasn't passing `stableId`
  into `freshInfo`. **Fix**: persist `stableId` / `uid` to dataset in
  `buildCardFromMarkup`; carry `stableId` through all three
  `_buildGameViewCardInner` lookup paths.

- **New copy looked square inside a row of round/rect tiles**. Game
  shape is applied per-render via a container sweep in
  `applyGameShapeOverride` — a freshly-inserted DOM tile is missed
  until the next view rebuild. Calling the sweep right after copy was
  associated with destructive-side-effect reports earlier in the
  session, so we apply the same shape math (border-radius, preview
  width/height, SVG viewBox/transform) to **just the new tile** rather
  than sweeping every card. Wrapped in try/catch so a styling error
  never blocks the copy.

### Cmd+Z (Mac) / Ctrl+Z scope expanded into game-view

The desktop-only undo/redo system (`_undoStack`, `_undoPushSnapshot`,
`globalUndo`) already snapshotted `savedCustomGames` and
`savedCatchGames` in its key list, but no Find/Catch game-view
mutation pushed a snapshot before saving — so undo covered Card Maker
work but did nothing for game-view edits.

- `_undoPushSnapshot(force)`: added a `force` flag that bypasses the
  `_cardMakerBuilt` guard. Card Maker callers keep `force=undefined`
  (existing behaviour); game-view callers pass `force=true` since they
  may run before Card Maker is ever built.
- `_saveCurrentViewGames(info)`: pushes a snapshot at the top, so
  `deleteCard`'s game-view branch, `saveMCardGroups`, and
  `applyGameShape` all get an undo entry for free.
- `_removeCardFromThisGame`: pushes a snapshot inside the on-confirm
  callback (this helper writes to localStorage directly — bypassing
  `_saveCurrentViewGames`).
- `copyCardInRow` game-view block: pushes a snapshot before splicing
  the new card.
- `_undoApplySnapshot`: now calls `_reopenCurrentView()` if
  `#game-view-screen` is visible so a restored snapshot becomes
  visible immediately (was rebuilding Card Maker DOM only — undo
  silently restored data but the view never re-rendered).

Result: in game view, deleting a card → Cmd+Z brings it back; copying
a card → Cmd+Z removes the copy. Find and Catch both supported.

### GP (player) fixes

- **GP showed math-expression dominos for "Match 0-4"**. Root cause:
  GP rendered cards from `cardInfo.svgMarkup` (the snapshot baked into
  `game.cards` at add-time), while Studio re-resolves SVG content from
  card-set storage by `stableId` on every render. Editing a card in
  Card Maker after it's been added to a game updated card-set storage
  but not the `game.cards` snapshot, so Studio showed the new content
  and GP showed the stale math expressions.
  **Fix**: ported the `stableId` resolver into GP. New helpers
  `_gpAllCardStorageKeys()`, `_gpResolveBySid(stableId)`,
  `_gpInvalidateCardCache()`. `getGameCardSVG` prefers the freshest
  `svgContent` by stableId before falling back to `cardInfo.svgMarkup`.
  Cache is invalidated at the top of each `startCustomGame`.

- **GP domino count and pairings differed from Studio**. Studio's
  `rebuildGameViewDominos` runs cards through `buildEffectiveCards`
  which collapses `mGroups` (Match-style groups) into one effective
  slot per group. GP's `startCustomGame` paired every distinct card
  label, generating many more dominos with the wrong pairings.
  **Fix**: mirror Studio's grouping in GP — build effective groups via
  `mGroups`, iterate pairs of groups, pool every group member's SVG
  so `randomPick` rotates variants per render. Pass group
  representatives (not raw `origCards`) into `updateLevelDominoIcons`.

- **GP intro buttons could load the wrong game** if Studio mutated the
  list while GP stayed open (closures captured a stale array index).
  **Fix**: `populateIntroGames()` is now re-run when the home button
  is clicked, so the next click resolves the right game.

### Process (the `docs/MEMORY.md` rules I missed early)

- **3-branch push**: every push must hit `master`,
  `claude/general-session-yVBQq`, and `claude/review-project-docs-JOOeh`.
  Pages deploys from JOOeh. Caught the violation mid-session and
  merged the parallel session's `4c92a63` (MEMORY.md April 26 update)
  before pushing all three to a common tip.
- **Trial timestamp** in **both** `index.html` and `pm-studio-DrV.html`
  must be bumped on every push. The user verifies which build is
  loaded by reading the stamp.

### Recovery / undo gaps still open

- `_undoStack` is in-memory only — page refresh wipes history. User
  affected during an unrelated bad-state earlier in the session;
  cloud-backup restore was offered, only 4 backups available, all
  post-corruption. Deferred items (user said "discuss later"):
  - **(c)** Persist `_undoStack` to localStorage so Cmd+Z survives a
    refresh.
  - **(d)** Extend the cloud backup writer (`_pushCardBackup`) to
    include `savedCustomGames` and `savedCatchGames` so a future
    catch-game corruption is recoverable from cloud (today's
    "Restore Cards from Cloud" only covers `customDrawnCards_*`).

### Known game-view mutations still NOT undoable

These older code paths bypass both `_saveCurrentViewGames` and
`_removeCardFromThisGame`, so they don't snapshot:
- `confirmAddCards` (the + overlay that adds cards from a card set)
- Game rename / description edit
- Drag-reorder via `saveGameViewOrder`
- Combine games / clone-to-catch / delete entire game / copy game
- Direct `localStorage.setItem('savedCustomGames', …)` callers (~22)
- Direct `saveCatchGames(…)` callers (~10)

Audit-and-wire pass deferred. Easiest path is probably to add the
snapshot push to `saveCatchGames` itself and to a wrapper around
`localStorage.setItem('savedCustomGames', …)`, then delete it from the
two places I already added it (`_saveCurrentViewGames`,
`_removeCardFromThisGame`).

## April 26 Session (cont.) — Non-stop type-of-game

Wires the Type axis into the player runtime for Find games. Slow-pace
(current behaviour) keeps the manual Play Again click. Non-stop plays
the existing celebration / lost feedback, then the Play Again button
counts down 3 → 2 → 1 in place and auto-triggers `playAgain()`.
Tapping the button at any point during the countdown (including over
the celebration) skips ahead immediately; idle for 60 s leaves the
user on the end-game screen so the game doesn't run unattended.

### Per-Type `behavior` field (admin)
- `_defaultGameSetup` now seeds every Type option with
  `behavior: 'manual'` via a new `mkTypesAxis` helper.
- `_getGameSetup` schema-repairs older saves: any Type option whose
  `behavior` isn't exactly `'nonstop'` is forced back to `'manual'`.
- `_gsRenderForm` adds a small `<select class="gs-option-behavior">`
  ("manual" / "non-stop") next to each Type row's text input. New CSS
  in `.gs-option-row select.gs-option-behavior` keeps it inline.
- `_gsCaptureForm` reads the dropdown back into the option.
- `_gsAddOption` seeds new Type rows with `behavior: 'manual'`.

### Player-side picker (Find only)
- New `#setup-types-row` block in `index.html`'s start-screen, hidden
  until the active game has 2+ enabled Type options. Header label
  comes from `axisData.axisLabel`.
- `_renderTypesPicker(gameType, conf)` (called by
  `_applyGameSetupToPlayerScreen`) builds one `<button.setup-type-btn>`
  per enabled option, label = `"Type N — " + suffix`. Default
  selection: first enabled option.
- The selected option's behavior is stashed on
  `window._currentTypeBehavior` ('manual' or 'nonstop') and the label
  on `window._currentTypeLabel`. game.js reads the behavior on
  end-of-round; the label is reserved for future Type-specific
  gameplay variants.
- Catch is excluded — no Type axis runtime support there yet.

### Non-stop end-of-round in `js/game.js`
- `showEndGameButtons` keeps the Play Again button as before, but
  when `window._currentTypeBehavior === 'nonstop'` (and we're not in
  a combined-game stage transition or final celebration) it calls
  `_startNonstopCountdown(playAgainBtn)`.
- `_startNonstopCountdown(btn)` replaces the button text with `⏵ N`
  and ticks down once per second from 3 to 0. Adds capture-phase
  pointer/key/touch listeners to track activity, plus a
  `visibilitychange` listener that pauses the timer when the tab is
  hidden and resumes (with a fresh idle stamp) when shown again.
- After the count reaches 0, `playAgain()` fires. Idle for 60 s
  cancels the countdown and leaves the screen as in manual mode.
- Tapping the button is a deliberate skip-ahead: the click handler
  calls `_stopNonstopCountdown()` then `playAgain()`. This means a
  tap during the celebration / lost sound does start the next round
  early, by design (engaged players want pace).
- `_stopNonstopCountdown()` is called from `playAgain` and
  `resetToSetup` so the countdown can never outlive its context.
- New CSS `.end-game-btn.nonstop-countdown` adds a 1 s `nonstop-tick`
  pulse animation so the count visibly ticks.

### Identifier choice — explicit `behavior` field, not label substring
We considered matching `/non[-\s]?stop/i` against the editable suffix.
Rejected — admin spelling and translation can break it. The dropdown
makes the choice explicit and survives renames.

### Catch end-of-round wiring (added later same session)
The Type picker is also rendered for Catch, but in a different slot
than for Find. On the Catch setup screen (GP Cm / Ct Setup), the
existing right-column "Choose domino style" panel is hidden when the
active Catch game has 1+ Type options, replaced with
"Choose the game type:" plus a vertical list of `.setup-type-line`
radio rows. The user clicks a row to flip
`window._currentTypeBehavior` (and `_currentTypeLabel`).

`_renderTypesPicker` initially branched by `gameType` (Find = top-of-
panel button picker; Catch = right-column radio list). Per a later
user request, it was unified — **both Find and Catch now use the
right-column radio list.** The legacy `#setup-types-row` at the top
of the panel is left in the DOM but always hidden (harmless; kept so
nothing referencing it breaks). The right-column header reads
"Choose the game type:" and the four domino-style SVGs are hidden
whenever the active game has 1+ enabled Type options. Games with
zero Type options keep the original "Choose domino style" SVG panel.

`_catchGameOver` (in BOTH `index.html` and `pm-studio-DrV.html`,
since admin can also test Catch from Studio) now hijacks the Play
Again button into the same 3-second countdown when
`_currentTypeBehavior === 'nonstop'`. Helpers
`_startCatchNonstopCountdown` / `_stopCatchNonstopCountdown` mirror
game.js's pattern: capture-phase activity listeners,
`visibilitychange` pause/resume, 60 s idle cancel, tap-to-skip-ahead.
Cleanup also fires from the Exit button.

New CSS `.catch-gameover-btn.nonstop-countdown` reuses the
`nonstop-tick` keyframes defined for the Find button.

### Type axis is mode-agnostic — `_gsCaptureForm` mirrors edits
Game Settings keeps separate per-mode (`touch` / `mouse`)
configurations of the Players, Levels, and Types axes. That made
sense for Players ("1 player + timer" might apply only to one input
mode) and Levels (Catch has no levels), but **Type of Game is
device-independent** ("Slow Pace" reads the same on touch and
mouse). The original implementation captured form values into the
visible tab only — an admin who edited the touch tab and tested in
a desktop browser saved enabled Types into `setup.touch` while the
player read `setup.mouse` (still default-all-off), so the player-side
Type picker silently showed nothing.

`_gsCaptureForm` now mirrors the captured types axis to the OTHER
mode immediately after capture (`JSON.parse(JSON.stringify(conf.types))`).
Players and Levels keep per-mode edits.

### `_gsIsAxisUC` no longer reports types as UC
Now that the player picker exists for Find + Catch and the runtime
honors the behavior choice, the "🚧 Under construction" badge for
the Type axis section is removed. `_gsIsAxisUC` only flags
`levels` for `catch` (Catch has no level UI) and nothing else.

### Temporary on-screen probe (still live)
A small yellow box pinned to the top-left of GP Setup prints
`gameType / mode / types.options / enabled` so the user can verify
which mode the player reads and how many enabled Types reached the
picker. Tap to dismiss. To remove once the picker is verified
working in the user's environment.

### Open follow-ups
- Type label (`window._currentTypeLabel`) currently has no gameplay
  consequence. Once the runtime defines what "Type 2" actually
  changes (e.g., "Voiced Answer"), swap the manual/nonstop dropdown
  for a richer behavior config or a separate per-Type ruleset.
- The countdown shows the Play Again button doing the counting. If
  the celebration overlay covers the button, tapping the overlay
  doesn't currently skip ahead — only tapping the button does. If
  this is a problem in practice, hoist the click to the overlay too.
- Remove the temporary yellow GP-Setup probe once the picker
  rendering is verified working.

## April 26 Session (cont.) — Voice input v1 (Find, 1-player, EN/ES/RU)

Wires Web Speech API recognition to "Find the Doubles" so a 1-player
round can be answered by voice ("the first" / "second" / "third" /
"fourth") in addition to clicks. Decoupled audio-source layer so
2-player can plug in later (separate mics, push-to-talk, or speaker
fingerprint) without touching the routing.

### Per-Type `voiceInput` + `voiceLang` (admin)
- `_defaultGameSetup`'s `mkTypesAxis` seeds each option with
  `voiceInput: false`, `voiceLang: 'en'` alongside the existing
  `behavior` field.
- `_getGameSetup` schema-repairs both fields (older saves get
  `voiceInput: false`, `voiceLang: 'en'`).
- Game Settings option-row UI gains a 🎤 checkbox + EN/ES/RU language
  dropdown next to the manual/non-stop dropdown. The lang select is
  disabled when the checkbox is off (visual quietness for the common
  case). New CSS `.gs-option-voice` and `.gs-option-voice-lang`.
- Voice is a separate dimension from behavior, per user direction —
  any combination is allowed (manual + voice, non-stop + voice).

### `js/voice.js` — stand-alone `VoiceInput` module
- Wraps `SpeechRecognition` / `webkitSpeechRecognition`.
- Continuous + interim results, with auto-restart on `onend` because
  Safari kills the recognizer after each utterance even with
  `continuous: true`.
- Phrase parser: normalize transcript (lowercase, strip articles
  the / el / la / los / las, strip punctuation), tokenize, match
  against per-language synonym tables. Includes common mishears
  (e.g., "forth" for "fourth").
- `LANG_CODES`: `en-US` / `es-ES` / `ru-RU`. Region is best-effort —
  Mac Safari speaking es-MX still hits the es-ES recognizer well.
- 700 ms cooldown per fired phrase so the recognizer's chain of
  partials doesn't double-fire.
- `onerror` handles `not-allowed` / `service-not-allowed` (permission
  denied) by clearing `_wantOn` so we don't retry-loop.
- API: `new VoiceInput({ language, maxPosition, onPhrase, onError,
  onListeningChange })`, `.start()`, `.stop()`, `.setLanguage()`,
  `.setMaxPosition()`, `VoiceInput.isSupported()`. Loaded by both
  `index.html` and `pm-studio-DrV.html` before `game.js`.

### Player picker stash + game.js round lifecycle
- `_renderTypesPicker` now stashes `window._currentVoiceInput` and
  `window._currentVoiceLang` alongside `_currentTypeBehavior` /
  `_currentTypeLabel`. Each setup-type-line shows a 🎤 suffix when
  the option has voice on.
- `Game.startSunLevelGame()` calls `_startVoiceForRound()` after
  layout is ready: skips if `!_currentVoiceInput`, skips for 2+
  player matches (1-player only for v1), shows the unsupported
  notice if `VoiceInput.isSupported()` returns false, otherwise
  creates / re-tunes the recognizer and starts.
- `_onVoicePhrase` ignores phrases unless `gamePhase === 'sunLevel'`
  (so celebrations and lost-sounds don't trigger fire), then routes
  the position into the same `handleSunLevelCardClick(card,
  playerIndex, cardIndex)` a click would call.
- `Game.startPlayAreaDim()` and `Game.resetToSetup()` both call
  `_stopVoice()` so the recognizer isn't running during the win/loss
  feedback or after a quit.

### UI
- `#voice-mic-indicator` corner badge (top-right): 🎤 plus the last
  heard transcript. CSS classes `idle` / `listening` / `error`. The
  `listening` state pulses red via `voice-mic-pulse` keyframes —
  echoes the browser's own tab-record indicator.
- `_showLastHeard(raw)` shows the transcript that fired the position
  for ~2 seconds, then clears.
- `.voice-notice` toast: shown once per session if the browser
  doesn't support Web Speech API, or if the user denies the mic
  permission. Tap to dismiss; auto-removes after 6 s.
- The Type-line in the right-column picker gets a 🎤 suffix so the
  player can tell which Type uses voice before they pick.

### Open follow-ups (voice)
- 2-player. Three viable paths documented in the explanation above
  this session (separate mics / push-to-talk per player / speaker
  fingerprint with a wasm model). v1 design keeps voice routing in
  `_onVoicePhrase` decoupled from speaker identity, so the audio
  source layer is the only thing that changes when 2P ships.
- Combined-game multi-stage: voice should keep working across stage
  transitions; not yet verified.
- Push-to-talk variant: not built. Always-listening per the user's
  direction.
- Browser caveats: Firefox doesn't support Web Speech API at all;
  Safari occasionally drops `continuous` (handled by auto-restart);
  Chrome/Edge are the smooth path.

### Voice v1.1 — per-Type editable synonym tables (commit pending)

Per-game-type editor on top of v1. Each voice-enabled Type option now
carries a `voiceSynonyms` field; admin sees a 3-column EN/ES/RU table
inline under the option row in Game Settings and can add or remove
phrases per position. The matcher honours single-word and multi-word
entries.

**Why per-Type, not per-game**: a single game can offer multiple
teaching modes — e.g., Type 3 = ordinals only ("first / the first"),
Type 4 = cardinals for younger kids ("one"), Type 5 = both. Per-game
would force cloning the whole game three times.

### voice.js extensions
- `_normalizeKeep(s)` added alongside `_normalize(s)`. Strip variant
  removes articles `the / el / la / los / las`; keep variant doesn't.
- `_matchPosition` now takes `(text, table, maxPosition)` — table is
  the active language's `{1:[...], 2:[...], 3:[...], 4:[...]}` lifted
  from `_activeTable()`.
- Per-position match: walks 1→maxPosition, first match wins. For each
  entry: if it contains a space, **substring match** against the
  article-keeping normalised transcript (so "the first" entry
  matches "the first one"). If single-word, **token match** against
  the article-stripped tokens (so "first" entry matches "the first
  one"). Empty entries are ignored.
- New `VoiceInput.prototype.setSynonyms(s)` — runtime override, no
  recognizer restart needed.
- Constructor now accepts `opts.synonyms`. Stored as `this.synonyms`,
  used by `_activeTable()`. Falls back to internal `SYNONYMS` if
  missing or empty for the active language.
- `VoiceInput.DEFAULT_SYNONYMS` exposed as a deep clone — the editor
  reads it for "Reset" and for the initial seed of fresh editor
  panels.

### Game Settings — inline per-Type editor (pm-studio-DrV.html)
- New `voiceSynonyms` field per Type option. Stored shape:
  `{ en: { 1:[…], 2:[…], 3:[…], 4:[…] }, es: {…}, ru: {…} }`.
- `null`/missing means "use defaults at runtime". Once admin opens
  the editor and saves, it becomes a concrete object (the editor
  seeds it with current defaults on first open). After that, defaults
  no longer apply — admin's authority is total. Empty position list
  = no voice trigger for that position (the user's pedagogical
  example: "the answer is never first; the kid must say second/
  third/fourth").
- Schema repair only normalises type: leaves `null` alone, coerces
  non-object values to `null`. Existing `voiceSynonyms` objects
  pass through untouched.
- `_gsAddOption` seeds new Type rows with `voiceSynonyms: null`.
- New `✎ words` button in the option row, next to the EN/ES/RU
  language select. Disabled when `voiceInput` is off (the
  checkbox-change handler now also closes any open editor).
- `_gsBuildVoiceEditor(idx, optionRef, defaults)` builds the inline
  panel: 3 flex columns (English / Español / Русский), each with a
  "↺" reset-to-defaults-for-this-language button and 4 rows (1st /
  2nd / 3rd / 4th) of comma-separated text inputs. Live `oninput`
  writes to the option's `voiceSynonyms`; `_gsCaptureForm` re-reads
  open editors on save as a defensive guard.
- New CSS in `css/style.css` for `.gs-voice-editor`, `.gs-voice-cols`,
  `.gs-voice-col`, `.gs-voice-row`, `.gs-voice-reset-lang-btn`,
  `.gs-voice-hint`, plus the `.gs-voice-edit-btn` row button.

### Player picker → game.js wiring
- `_renderTypesPicker` now stashes `window._currentVoiceSynonyms`
  alongside the existing language / behavior / label. Set to the
  active option's `voiceSynonyms` (object) or `null` (defaults).
- `Game._startVoiceForRound()` passes `synonyms:
  window._currentVoiceSynonyms` to `new VoiceInput(...)`. Re-tunes
  the existing `_voice` instance via `setSynonyms()` on subsequent
  rounds — no recognizer restart needed.

### Rollback recipe (revised)
v1 stable baseline is still commit `3f2d799`. The editor work is
strictly additive on top — same revert recipe applies:

```sh
git revert --no-commit 3f2d799..HEAD
git commit -m "Revert per-Type voice editor; restore v1 baseline"
git push origin master
git push origin master:claude/general-session-yVBQq
git push origin master:claude/review-project-docs-JOOeh
```

`option.voiceSynonyms` is unread by v1's matcher, so games saved
while the editor was active still load fine after a revert.

### Voice v1.1 + lifecycle-race fix — current stable point

**Stable target as of 07:55 PM PDT today**: commit `8bd44b8` (`Voice:
stale-recognizer guards so round 2+ doesn't go silent`). User
confirmed voice works across rounds in actual gameplay. Builds on
top of voice v1.1 (per-Type editor, `97ade1f`), v1 (`3f2d799`), and
the mic-check diagnostic panel (`a709fa3`, `97ade1f`).

Key reliability tricks now live in `js/voice.js`:
- Every event handler in `_make()` bails via `_isCurrent()` if it
  fires after the recognizer has been replaced. Without this,
  round-1's onend was overriding round-2's listening state and
  trying to auto-restart a dead recognizer alongside the new one.
- `start()` always recreates the recognizer (rather than reusing
  one across rounds). Predictable lifecycle regardless of which
  order Chrome fires onend/onstart in.
- `setLanguage` no-ops when language unchanged.

### Voice polish (commits `347dbaf`, `25deffd`)

- **Yellow setup probe removed** (`347dbaf`). The on-screen
  diagnostic that printed `Setup: gameType=… mode=… types.options=…
  enabled=…` in the corner of GP setup was no longer needed once
  the per-mode mirror-on-save was in place.
- **`continuous: false`** (`25deffd`). With `continuous: true`,
  Chrome occasionally batched two pause-separated utterances into
  one delayed transcript ("first first" instead of two "first"s),
  making the first attempt feel unresponsive. With `continuous:
  false`, each utterance is its own short session that ends ~0.5 s
  after the user stops; `onend`'s 80 ms auto-restart spins up a
  fresh session — de-facto continuous listening, no batching.
- **Mic indicator only during voice rounds** (`25deffd`).
  `_startVoiceForRound`'s early-return path now stops any prior
  voice instance and removes the indicator div before bailing, so
  non-voice rounds start with a clean screen. The unsupported-
  browser notice fires only when voice was wanted (1-player +
  voiceInput=true) but the browser doesn't support
  SpeechRecognition.
- **"Test mic" button visibility tracks the selected type**
  (`25deffd`). `_renderTypesPicker` builds one button per render
  and exposes a `_refreshTestMicVisibility()` helper that each
  setup-type-line click calls after `_stashTypeChoice`. Pick a
  voice type → button appears. Pick a non-voice type → button
  hides.

### Mishears workflow (no code, just process)

Chrome's English speech recognizer occasionally misheards "first"
or "one" in user-specific ways (heard as "fast", "thirst", "won",
"juan", etc.). The corner mic indicator's `hearing: <text>` line
shows what Chrome actually transcribed. Workflow when a user wants
to extend recognition:

1. Play a round, watch what `hearing: …` shows when a word fails
   to match (it'll have a `?` prefix and the heard transcript).
2. Open Studio → Game Settings → that voice Type → `✎ words`.
3. Add the mishear to the appropriate position's comma-separated
   list (e.g., position 1: `first, the first, fast, thirst`).
4. Save the game.

Defaults in `js/voice.js` are intentionally conservative — extending
them globally risks false positives across all voices. Per-Type
editor lets each game tune to its actual users.

### Mic-check panel: synonym table display (commit `16e59fc`)

Added a "Words this game listens for (Lang)" section to
`VoiceInput.openMicCheck()`. Reads `window._currentVoiceSynonyms` /
`_currentVoiceLang` and shows position 1-4 lists as little code
chips, with a "custom (from Game Settings)" / "default (no per-Type
override)" annotation. Diagnoses whether an admin's per-Type editor
edit actually reached the player runtime — when a user added
"whatever" to position 1 but voice didn't fire, this section
showed they hadn't clicked the parent Game Settings dialog's main
Save button (the inline editor's writes only persist when the
parent saves).

### Voice indicator leak fixes (commits `1ba4a45`, `50723e5`,
`aac8c73`, `ca08a4c`)

Series of fixes addressing "the listening indicator stays visible
after returning from a voice round". Issue ran through several
layers:

- **`1ba4a45`** — added `Game._cleanupVoiceUI()` helper and wired it
  into `_goHome` and the `back-to-intro-btn` click handler. Also
  added it to the catch-overlay home button in `index.html`. Stops
  any active recognizer, removes the indicator div, closes any
  open mic-check panel.
- **`50723e5`** — belt-and-suspenders: `_renderTypesPicker` now
  calls `_cleanupVoiceUI()` at the top so any path that lands on
  the setup screen gets a clean slate, regardless of how the
  navigation happened.
- **`aac8c73`** — CSS-level safety net. The indicator's visibility
  is now gated on `body.voice-round-active`. Default
  `display: none`; `body.voice-round-active .voice-mic-indicator`
  flips to `display: grid`. `_ensureMicIndicator` adds the class,
  `_stopVoice` and `_cleanupVoiceUI` remove it. So even if some
  path leaves the indicator div in the DOM, CSS keeps it invisible
  until a real voice round explicitly turns the class back on.
  `_cleanupVoiceUI` also switched to a `querySelectorAll` sweep
  in case orphaned elements lost their id.
- **`ca08a4c`** — final fix: each `.setup-type-line` click handler
  now calls a new free helper `_killVoiceUI()` (defined in the
  same inline script as `_renderTypesPicker`, doesn't depend on
  `window.game` being instantiated). Removes body class, sweeps
  indicator divs, closes diagnostic panel, calls game-side
  cleanup if available. So tapping any type immediately wipes the
  indicator — the user-visible "I picked Type 1, indicator should
  go away" expectation works.

**Current voice-stable point: commit `ca08a4c`** (user verified
"yes, it works now"). Builds on top of `8bd44b8` (lifecycle race),
`97ade1f` (mic-check panel), `3f2d799` (voice v1 baseline).

## Pause / Resume v1 — kid-friendly mid-round freeze

**Use case**: kids 6-8 playing Find the Doubles need to suddenly step
away (bathroom, distraction) without losing their place or progress.
The kid taps Pause → game freezes mid-round → kid comes back → taps
the overlay → game resumes from exactly where it was.

**Available for ALL game types** (slow-pace, non-stop, voiced) —
not gated on the non-stop type. The kid-safety rationale applies to
every type since every type runs the Xeno timer.

### What "freeze everything" means

- **Xeno timer**: stopped at pause, remaining seconds saved, restarted
  from the saved value on resume. (`Game._pauseGame` reads the visible
  timer-display value as the freshest source of truth.)
- **Voice recognizer**: stopped at pause; restarted on resume if it
  was on. `_pausedVoiceWasOn` remembers the prior state.
- **CSS animations under #game-screen**: paused via
  `body.game-paused { animation-play-state: paused }`.
- **Click / touch handlers**: `handleSunLevelCardClick` and
  `_onVoicePhrase` both early-return when `this._isPaused`. So sibling
  pokes at the screen do nothing while paused.
- **Input is strictly blocked** (per user direction): the overlay
  sits at `z-index: 13500` and consumes taps; the only thing that
  resumes is a tap on the overlay itself.

### What we don't pause (v1 simplifications)

- **Web Audio fire-and-forget oscillator sounds** (the lost wah-wah
  ~0.3 s, the celebration jingle ~1 s). Each is created with its own
  `AudioContext` and started/stopped at known offsets — pausing them
  mid-flight would mean tracking every active context. They're short
  enough to play out before the kid is back.
- **The 10 s sun-level dim animation** between win and end-game-buttons.
  Already a brief locked-in cinematic; pause is unavailable during
  this window (`_canPause()` returns false unless `gamePhase === 'sunLevel'`).
- **Persistence across page reloads** — paused state is in-memory only.
  Future: when player names + scores are persisted, save paused-state
  to localStorage and offer a "Resume your paused game?" prompt on
  page load. Tracked as a deferred upgrade.

### UI

- **Pause button** (top-right corner, 40 × 40 round button with white
  ⏸ icon). Visible only when `body.game-round-running` is set —
  toggled on by `startSunLevelTimer`, off by `stopSunLevelTimer` /
  `startPlayAreaDim` / `resetToSetup` / `_cleanupVoiceUI` /
  `_pauseGame`. Defined in both `index.html` and `pm-studio-DrV.html`
  (admin can also test rounds in Studio).
- **Pause overlay** (full-screen translucent dark, blurred backdrop,
  centered card with ▶ icon, "Game paused", "Tap anywhere to
  continue"). Tap anywhere on the overlay calls `_resumeGame()`.

### Lifecycle notes

- **Tab hidden mid-round** auto-pauses (visibilitychange listener in
  the Game constructor). On return, **stays paused** — kid must
  explicitly tap to resume.
- **End of round** (correct answer or timer hits 0) — `startPlayAreaDim`
  clears pause state (round is over, pause is meaningless).
- **Home / back-to-intro** during a paused round — `_cleanupVoiceUI`
  also clears pause state. Pause is round-scoped and dies with the
  round.
- **Non-stop countdown** (between-round 3 → 2 → 1) is NOT pause-able
  in v1. The countdown has its own visibility-pause and idle-cancel
  built in. If you need to pause between rounds, just don't tap the
  countdown — it stops at idle for 60 s.

### Files touched

- `index.html` + `pm-studio-DrV.html`: pause button inside
  `#game-screen`, pause overlay before `</body>`.
- `css/style.css`: `.game-pause-btn` + `.game-pause-overlay` /
  `.game-pause-card` / `body.game-paused` / `body.game-round-running`
  rules.
- `js/game.js`: constructor wires the pause button click and
  visibilitychange listener; `Game._canPause()`, `_pauseGame()`,
  `_resumeGame()` methods near `_cleanupVoiceUI`; pause guard added
  to `handleSunLevelCardClick` and `_onVoicePhrase`;
  `body.game-round-running` toggled on in `startSunLevelTimer`, off
  in `stopSunLevelTimer` / `startPlayAreaDim` / `resetToSetup` /
  `_cleanupVoiceUI`.

## Pause / Resume v1 — kid-friendly mid-round freeze

**Use case**: kids 6-8 playing Find the Doubles need to suddenly step
away (bathroom, distraction) without losing their place or progress.
The kid taps Pause → game freezes mid-round → kid comes back → taps
the overlay → game resumes from exactly where it was.

**Available for ALL game types** (slow-pace, non-stop, voiced) —
not gated on the non-stop type. The kid-safety rationale applies to
every type since every type runs the Xeno timer.

### What "freeze everything" means

- **Xeno timer**: stopped at pause, remaining seconds saved, restarted
  from the saved value on resume. (`Game._pauseGame` reads the visible
  timer-display value as the freshest source of truth.)
- **Voice recognizer**: stopped at pause; restarted on resume if it
  was on. `_pausedVoiceWasOn` remembers the prior state.
- **CSS animations under #game-screen**: paused via
  `body.game-paused { animation-play-state: paused }`.
- **Click / touch handlers**: `handleSunLevelCardClick` and
  `_onVoicePhrase` both early-return when `this._isPaused`. So sibling
  pokes at the screen do nothing while paused.
- **Input is strictly blocked** (per user direction): the overlay
  sits at `z-index: 13500` and consumes taps; the only thing that
  resumes is a tap on the overlay itself.

### What we don't pause (v1 simplifications)

- **Web Audio fire-and-forget oscillator sounds** (the lost wah-wah
  ~0.3 s, the celebration jingle ~1 s). Each is created with its own
  `AudioContext` and started/stopped at known offsets — pausing them
  mid-flight would mean tracking every active context. They're short
  enough to play out before the kid is back.
- **The 10 s sun-level dim animation** between win and end-game-buttons.
  Pause IS available during this window (per user feedback), but it
  freezes the celebration animation; cancels any non-stop auto-restart
  countdown. Resuming doesn't auto-restart the cancelled countdown —
  user clicks Play Again manually if needed.
- **Persistence across page reloads** — paused state is in-memory only.
  Future: when player names + scores are persisted, save paused-state
  to localStorage and offer a "Resume your paused game?" prompt on
  page load. Tracked as a deferred upgrade.

### UI placement journey (button position)

The pause button moved several times during the session in response
to user feedback:
- `e024cfd` — initial: top-right (`right:12px`). Conflict: the
  listening indicator (also top-right) covered it.
- `024fe2a` — top-center (`left:50% translateX(-50%)`). Conflict:
  overlapped the gold-bordered status bar ("Press or say…") in the
  middle of the title row.
- `cf0e718` — top-left cluster, after back-arrow + home (`left:98px`).
  Conflict: overlapped the start of the centered "MathGrain Domino"
  title text on typical screen widths.
- `30b1340` — top-right, dropped 60 px (`top:60px right:12px`).
  Conflict: still in the title-bar zone, looked cramped.
- **`3eca894` (current)** — bottom-right (`bottom:24px right:24px`).
  Empty area below the timer panel, clear of every gameplay element,
  easy thumb reach on tablet. **User confirmed: "It does works now."**

### Lifecycle

- `body.game-round-running` is set inside `startSunLevelGame` (the
  universal round-entry point — earlier versions tied it to
  `startSunLevelTimer` which only fires when the player options
  include the Xeno timer, so pause was invisible for no-timer
  configs). Removed only on `resetToSetup` and `_cleanupVoiceUI`.
  Stays through the whole round + celebration.
- **Tab hidden mid-round** auto-pauses (visibilitychange listener in
  the Game constructor). On return, **stays paused** — kid must
  explicitly tap to resume.
- **End of round** (correct answer or timer hits 0) — `startPlayAreaDim`
  no longer removes `game-round-running` (stays through celebration).
  Clears any active pause state since the round is now in the win
  phase.
- **Home / back-to-intro** during a paused round — `_cleanupVoiceUI`
  also clears pause state. Pause is round-scoped and dies with the
  round.
- **Non-stop countdown** (between-round 3 → 2 → 1) is cancelled on
  pause; not auto-restored on resume.
- **`_canPause()`** allows pause during BOTH `gamePhase === 'sunLevel'`
  AND `gamePhase === 'sunLevelWon'` (the celebration window) so a
  kid can pause the auto-restart countdown after a win.

### Files touched

- `index.html` + `pm-studio-DrV.html`: pause button inside
  `#game-screen`, pause overlay before `</body>`.
- `css/style.css`: `.game-pause-btn` + `.game-pause-overlay` /
  `.game-pause-card` / `body.game-paused` / `body.game-round-running`
  rules.
- `js/game.js`: constructor wires the pause button click and
  visibilitychange listener; `Game._canPause()`, `_pauseGame()`,
  `_resumeGame()` methods near `_cleanupVoiceUI`; pause guard added
  to `handleSunLevelCardClick` and `_onVoicePhrase`;
  `body.game-round-running` toggled on in `startSunLevelGame`, off
  only in `resetToSetup` / `_cleanupVoiceUI`.

## Round cleanup on navigate-away (commit `5e3d9e2`)

User reported: "When i navigate out of game page to Game types page
or even to choose game page - game is keep running, i can hear sounds
of timer finished…". Cause: Home / back-to-intro just toggled screen
visibility but left the round's `setInterval (sunLevelTimer)` ticking;
when it hit zero, `sunLevelTimeUp` fired the loss sound from the
hidden `#game-screen`.

Fix in `_cleanupVoiceUI` (which already fires on Home / back-to-intro
/ catch-overlay-home and on every `_renderTypesPicker` call):
- `clearInterval(this.sunLevelTimer)` and null it.
- `clearTimeout(this.playAreaDimTimeout)` and null it (the post-win
  10 s dim that hides the players area would also fire from the
  intro page if not cleared).
- Set `this.gamePhase = 'navigatedAway'` if it was sunLevel /
  sunLevelWon, so any in-flight callback that escaped the
  clearInterval early-returns on the gamePhase guard inside
  `sunLevelTimeUp` and `handleSunLevelCardClick`.

### Voice v1 stable point — rollback marker

If you want to skip ALL the post-v1 voice work (per-Type editor,
mic-check panel, lifecycle guards, indicator leak fixes), **revert
to the v1 baseline at commit `3f2d799`** (`Voice input v1 — Find
game, 1-player, EN/ES/RU`). The synonym tables there are hardcoded
inside `js/voice.js` and admin has only the 🎤 checkbox + EN/ES/RU
language dropdown per Type — no editor.

To roll back:

```sh
git revert <new-editor-commit-hash>   # creates a clean revert
# or, if multiple new commits stacked on top:
git revert --no-commit 3f2d799..HEAD
git commit -m "Revert per-Type voice editor; restore v1 baseline"
git push origin master
git push origin master:claude/general-session-yVBQq
git push origin master:claude/review-project-docs-JOOeh
```

The data shape change is additive (`option.voiceSynonyms` is a new
optional field); games saved while the editor was active still load
under v1 because v1's matcher ignores the field. So no data migration
needed in either direction.

## Branch landscape (as of April 25)

**Three branches kept in sync** (every push goes to all three):
| Branch | Role |
|---|---|
| `master` | Primary work branch |
| `claude/general-session-yVBQq` | Push target #2 |
| `claude/review-project-docs-JOOeh` | **GitHub Pages deploy** — site lives here |

**Stale/abandoned branches** (per-session auto-named, never cleaned up):
`main` (305 behind, abandoned Mar 31), `claude/review-project-docs-QNagl`,
`claude/fix-image-upload-cnMr5`, `claude/clarify-task-1NM0X`,
`claude/read-todays-notes-zfR1g`, `claude/review-daily-progress-4qGJy`,
`claude/review-vica-domino-notes-vxyYf`, `find-the-double`,
`Resizing-for-different-hardware`. Safe to delete on GitHub when
convenient. **Note**: ignore the auto-generated branch name when a new
Claude session starts — switch to `master` first thing.

## Session-recovery lessons (April 25)
- **Claude has no cross-session memory.** Anything not committed before a
  session crash is gone. Treat this MEMORY.md (and STATUS_NOTES.md) as
  the only durable record between sessions.
- **Large image uploads can crash a session** with
  `cache_control cannot be set for empty text blocks`. Workaround:
  downscale screenshots to ~1024px wide before attaching, or describe
  what's on screen in text.
- **First thing in a new session**: check `git log --all --since=...` for
  recent commits + read MEMORY.md tail to see where the previous session
  left off. The branch the session opens on is auto-generated and rarely
  the right one.

### Mobile Player Proposals (DEFERRED — discuss later)
- **T1**: Touch-optimized card selection (larger tap targets, swipe gestures)
- **T2**: Pinch-to-zoom on game board
- **T3**: Haptic feedback on card selection (if device supports)
- **T4**: Swipe navigation between screens
- **M1**: Bottom navigation bar for mobile player
- **M2**: Full-screen game mode (hide browser chrome)
- **M3**: Landscape/portrait responsive layouts for gameplay
- **M4**: Card size auto-scaling based on screen dimensions
- **P1**: PWA manifest for home screen install
- **P2**: Offline play capability (service worker caching)
- **P3**: Push notifications for multiplayer turns
- **P4**: App-like splash screen
- **F1**: Visual feedback on all touch interactions (ripple effects)
- **F2**: Loading skeletons instead of blank screens
- **F3**: Animated transitions between screens
- **R1**: Reduce initial load time (lazy load card sets)
- **R2**: Optimize SVG rendering for mobile GPUs
- **R3**: Minimize localStorage reads during gameplay
- **X1**: Shared component library between Studio and Player
- **X2**: Feature flag system for gradual rollout
- **X3**: Analytics/telemetry for usage patterns
