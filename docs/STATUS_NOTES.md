# Vica Domino - Project Status Notes
**Date**: May 28, 2026 — Prob Options ported to Catch + dot button retired
**Branch**: `claude/review-project-docs-JOOeh`
**Total Commits**: 640+
**Codebase Size**: ~18,000 lines across 4 main files

---

## May 28, 2026 — Catch Prob Options + color columns replace the dot button

### Zone columns color-coded + directional brackets (Studio)
`.gv-zone[data-row-zone]` (inline CSS, pm-studio) now shows the zone via
colored rails: outer edges faint white, inner boundary lines coloured —
red `]` bracket on the red/neutral edge (prongs point LEFT), green `[`
on neutral/green (prongs point RIGHT). Prongs are `::before`/`::after`
(8px; `display:block` to beat the legacy `[data-row-letter]::before
{display:none}`; z-index 5). Red `rgba(255,110,110,0.85)` 2px, green
`rgba(60,200,90,0.9)` 2px. Shared layout → Find AND Catch.

### Red/green DOT button + on-card dots retired (Find + Catch) — `cbef723`
- `game-view-freeze-btn` kept hidden in `openGameView` + `openCatchGameView`;
  `_freezeModeActive` forced off.
- `renderFreezeIndicators()` → no-op (clears only). No dots drawn.
- `_freezeState` data + drag-between-columns UNCHANGED, so zones / probs /
  deck+spawn untouched.

### Prob Options ported to Catch (was Find-only)
| Stage | What | Commit |
|---|---|---|
| 1 | Catch **editor** parity: chip strip / p-badges / weight badges / dimming / p-mode / per-Prob exclusions un-gated via `_getCurrentViewGame()`+`_saveCurrentViewGames()`; `openCatchGameView` runs `_migrateGroupProbsToCards`+`_migrateGameToProbOptions`; `_autosaveActiveProbForGame(game,index)` runs for both types; `_activeProbForExcluded` generalized | `a56dcf1` |
| 2 | Catch **Player** prob-aware spawn: `openCatchPlayModal`→`_gpApplySelectedProb`; new `_catchRedProb`/`_catchGreenProb`/`_catchPickWeighted`/`_catchSampleWeighted`; `_catchStartRound`+`_catch2pStartRound` weight static/match/distractor + drop 0-prob (0 = never); `_renderPlayerProbSelector(idx,type)` + "Frequency" selector on Catch setup | `b60219a` |

Catch prob model = identical to Find (red=static, green=falling, neutral
=both). Backward compatible (un-opened Catch games default 100/50).

**Fix `2995d6a`:** the Frequency picker (`#player-prob-select`) lives
inside `#setup-timer-col`, which was hidden wholesale for Catch — so it
never showed. Now `_applyTimerSwitchForGameType` hides only the timer
heading + toggle for Catch, and `_renderPlayerProbSelector` reveals the
column when it shows the picker.

### Studio custom hover tooltips — `febff38`
`#studio-tip` instant bubble (native `title` doesn't render in the preview
pane); event-delegated, sourced from each control's `title`→`data-tip`.

### Open follow-ups
- Player cards-library legend still shows red/green freeze STRIPS — not
  touched by the dot retirement (Studio-only).
- Player has no "?" page help (tooltips only) — user's call.

---

## May 28, 2026 — Two-channel probability + help/tooltip pass

### Two-channel (LEFT/RIGHT) per-card probability
Every card now stores BOTH halves of its frequency, homogeneously, so
all cards in a column store the same way regardless of dot state:
- `_probRed`   — LEFT / top-half weight (0–100)
- `_probGreen` — RIGHT / bottom-half weight (0–100)

Both channels are ALWAYS present (0 = "off in that zone"); the migration
never deletes a channel. `_freezeState` decides which channel(s) are
live: `frozen` → top/red only, `floating` → bottom/green only,
undefined (no-dot / neutral) → both.

- **Group = convenience only.** A group (`mGroups[] = {id, name?, members[]}`)
  exists so the user can edit one probability and apply it to every
  member at once, and to give that set a name. The old `group.probability`
  field is **deprecated** — `_migrateGroupProbsToCards(game)` pushes any
  legacy group prob down into each member's card channels once, then
  `delete g.probability`. Idempotent; runs in `openGameView` after
  `_migrateGroupsAndProbabilities`.
- **Editor popup** (`_showGroupPopup`): neutral card shows two controls
  (LEFT + RIGHT) built by `_buildProbControl(sideLabel, initVal)`;
  red/green card shows one. Range is 0–100. Save writes `_probRed` /
  `_probGreen` onto ALL members + `_autosaveActiveProbForGame`.
- **Deck builder** (`_computeCardZoneInstancesStudio` / Player
  `_computeCardZoneInstances`): group-prob override REMOVED — reads
  per-card channels, GCD-reduces instances per (row, zone). Match 0-4
  deck went 11090 → 1258 (correct, not a regression).
- **Weight badge** (`applyMWeightBadges`, shown when 1/M is ON): label
  is `pr` (frozen) / `pg` (floating) / `pr/pg` neutral (e.g. `70/30`),
  suffixed `×N` (copies in deck). Click opens `_editSingleCardProb`.
- **Dimming** (`_applyZeroProbDimming`): reads card channels directly —
  frozen→pr===0, floating→pg===0, neutral→both 0.

### p-mode marker only recolours when edited
`_applyPModeFlags()` `.pmode-flag` now matches `.mcard-badge` geometry
EXACTLY (`top:13px; right:-2px; font-size:8px; padding:1px 3px;
border-radius:3px;` + same text-shadow). Un-edited = neutral grey
`rgba(120,120,140,0.92)`; once edited it becomes a palette-coloured
badge in the SAME spot/size. Editing no longer makes the marker jump
corners or resize — only the colour changes. (`70166be`)

### Help / tooltip audit
- `_helpContent.gameview` rewritten to match the CURRENT toolbar and
  cover probability: stale `MPP`→`IC`, `M`→`p`; new entries for the
  `p` / `p1,p2` badges, the LEFT/RIGHT editor, the `70/30 ×N` weight
  badge, and the `BasicS / Prob1 / +Prob` chip strip.
- Added missing hover tooltips: Library `+` (new card set) and the
  delete-mode button (Studio); the Player "Frequency" heading + preset
  chips (`index.html`).
- Player (`index.html`) still has **no "?" page-help system** — only
  hover tooltips. Flagged as an open choice (build one or not).

---

## May 27, 2026 — Prob Options (9 stages, Find only)

Per-game **probability presets** ("Probs"). Admin authors several in
Studio; player picks one in the Game Previewer ("Frequency" selector)
and the gameplay deck rebuilds from it. Find only for v1.

### Data shape
```
game.probOptions[] = { id, name?, cardZones{}, cardProbs{}, mGroups[], excludedDominos[] }
game.activeProbOptionId
```
Key resolves uid > stableId > label. Per-Prob: zones/probs/mGroups/
excludedDominos. Per-game: setup matrix + the card set.

### Stage table
| # | What | Commit |
|---|---|---|
| 1 | Data model + idempotent migration (`_migrateGameToProbOptions`) | `650f529` |
| 2+3 | Editor chip strip `[BasicS][Prob1*][+Prob]` + switching + autosave | `50b7398` |
| 4 | Probability = 0 allowed + dim zero-prob cards + deck skips 0-pairs | `543f0da`,`7a1df2c` |
| 5 | Delete-card 3-option dialog (delete-all / zero-in-active / cancel) | `2db0915` |
| 6+7 | mGroups per-Prob (via mirror) + excluded dominoes per-Prob | `e765b95` |
| 8a | Player deck honors selected Prob (`_gpApplySelectedProb`) | `45eff50` |
| 8b | Player "Frequency" chip selector on setup screen | `7704a7f` |
| 9 | Docs (this) | — |

### Key names (grep)
`_migrateGameToProbOptions`, `_getActiveProb`, `_materializeProbIntoCards`,
`_writeActiveProb`, `_snapshotProbFromCurrent`, `_renderProbChipStrip`,
`_switchActiveProb`, `_createNewProb`, `_resetToBasicS`,
`_autosaveActiveProbForGame`, `_applyZeroProbDimming`,
`_purgeCardFromAllProbs`, `_activeProbForExcluded`, `_groupDisplayLabel`,
`_applyPModeFlags`, `_editSingleCardProb` (Studio);
`_gpApplySelectedProb`, `_gpProbCardKey`, `_renderPlayerProbSelector`
(Player).

### Badge rename
`M1/M2` → single card `p`, group `p1/p2`; Prob chips `Prob1/Prob2`;
toolbar `M` button → `p`. (`d72488e`, `96b63cd`)

### Deprecation (Stage 9)
`game.mGroups` + `excludedDominos_<idx>` localStorage **kept** as
fallbacks for no-Prob / Catch games and the Player mirror — NOT
removed. Active Prob is source of truth in the Studio editor.

### Files
- `pm-studio-DrV.html` — editor stages, helpers, chip strip, dialogs
- `index.html` — Player deck materialization + Frequency selector
- `css/style.css` — `.prob-chip-*`, `.player-prob-*`, `.prob-zero-card`

### Known follow-ups
- Catch games (probOptions parallel) — deferred.
- Stale orphan mGroups in some games (members referencing deleted
  cards) — harmless, ignored everywhere; a cleanup pass would tidy.
- ~~No-dot two-number editing UI (red≠green)~~ — DONE May 28 via the
  two-channel refactor (LEFT/RIGHT controls). See top section.

---

## May 26, 2026 (evening) — header & library polish

Short post-Stage-8 pass. 5 small commits, all pushed to the 3 mirror
branches. One CSS file edit → cache buster bumped twice in this set.

| Commit | What |
|---|---|
| `e06b53b` | **Disable Pub/Unpub toggle, show all games in Game Previewer.** Pub button no longer rendered on Library rows; 4 `published === false` filters removed across both files; `published` field kept on disk for future re-enable. |
| `0b2b96b` | **AGC label: shrink 10%, bottom-align with game name.** `#a-game-view-label` font-size 28→25.2px + line-height 1; new `_alignAGCLabelToGameNameBottom()` runtime-sets `top` so `label.bottom === gameName.bottom`. Wired into both openGameView paths. Cache buster `icon-fallback-title-1 → agc-label-shrink-1`. |
| `7fdd6b0` | **GP 0 title row shifted 15pt down** so "MathGrain Game Preview" h1 + TOUCH/MOUSE toggle clear the top-right Sync indicator. `margin-top: 15pt` on `.intro-title-row`. Cache buster `→ gp0-title-shift-1`. |
| `7c8f15c` | **Drop "TRIAL" prefix from deploy-time banner.** Stripped from all 5 banner sites. `scripts/bump-trial.sh` now writes bare time and matches the legacy `TRIAL `-prefixed form for in-place migration. |
| `77a1f93` | **A-L Library timestamp font 20% smaller** (36 → 28.8px inline). Other 4 banner sites left at their existing sizes. |

### Files touched

- `pm-studio-DrV.html` — library rows, AGC aligner JS, banner sites, library inline-style font, cache busters
- `index.html` — intro `published` filters, banner sites, cache busters
- `css/style.css` — `#a-game-view-label` override, `.intro-title-row` margin
- `scripts/bump-trial.sh` — bare-time format + permissive regex
- `docs/MEMORY.md`, `docs/STATUS_NOTES.md` — this entry

### Key code names (for future grep)

`_alignAGCLabelToGameNameBottom`, `_FALLBACK_PLAYER_IDS` (still used
as last-resort), `.publish-toggle-btn` (now never rendered),
`.intro-title-row` (15pt margin-top), bare deploy-time banner.

---

## May 26, 2026 — 8-stage probability rework + critical Player fix

Multi-day session. 8-stage rework of M-group / probability semantics:
groups become a UI shortcut for bulk probability editing; each card
carries an independent prob (1–100) that biases its representation
in the gameplay deck. ~30 commits, all pushed to the 3 mirror
branches. No JS/CSS file edits → no cache-buster bumps.

### The 8 stages

| # | Title | Key deliverable |
|---|---|---|
| 1 | Data model migration | `_migrateGroupsAndProbabilities`: per-card `_probRed`/`_probGreen` + mGroups `{id, name?, probability, members}` schema |
| 2 | 3-column row layout | CSS Grid per row: separator + letter + red/no-dot/green zones, drag between zones resets freeze + probs |
| 3 | Group / probability popup | `_showGroupPopup` — name, prob 1–100, quick-pick, Ungroup-all. **No auto-merge on matching prob** (user rule). |
| 4 | `P%×N` badge in 1/M view | `applyMWeightBadges` paints top-right pill; percent number click-edits inline via `_editWeightBadgePct` → `_setCardProbability` |
| 5 | Deck builder GCD instances | `_computeCardZoneInstances` + `_computeCardZoneInstancesStudio` produce `(topInst, botInst)` per card after GCD per `(row, zone)`; pair-emit multiplies by both |
| 6 | `×N` count badge on Show Dominos | `buildGameViewDomino` reads `domino._copies` (set by Stage 5) and appends `.domino-copies-badge` when > 1 |
| 7 | Cross-row color consistency | Verified structurally + at runtime. Bonus: palette extended 8→12 (M9 used to wrap to yellow). |
| 8 | Docs update | This entry. |

### 3 significant bugs fixed mid-rework

**CRITICAL — Player deck always empty (`46d5953`)**. User saw
instant Game Over. Cause: `index.html` `startCustomGame` filter
`if (!c.svgMarkup || !c.svgMarkup.trim()) return;` dropped every
card (post-Stage-1 cards have no inline svgMarkup; they resolve via
stableId → card-set store, which `getGameCardSVG` already supports).
Fix: `if (!getGameCardSVG(c)) return;`. Pre-existing bug, not
caused by Stage 5.

**Card-delete sweeping siblings (`aa208c5`)**. Deleting one 4-dot
card removed all cards sharing its `stableId`. `Array.filter` was
removing all matches; replaced with `_findRemoveIdx` + `splice`.

**Test 1 / legacy games showed 6 player buttons (`2259ede`,
`9bb8f41`)**. Games without a `setup` field bailed early from
`_applyGameSetupToPlayerScreen`, leaving all 6 static HTML buttons
visible. Fix: hardcoded 4-button fallback first, then upgraded to
clone the setup from `DEFAULT_FIND_GAME_TEMPLATE = 'Match 0-4'`
runtime.

### Polish

- **M2/M6 same red (`614bea4`, `9ae7421`)**: pink `#F50057` at index
  5 read as red. Replaced with `#D500F9` (Material purple A400).
- **Size-1 groups (`fab2284`)**: single cards can now have a name
  and probability via the same popup. Group button renames to "Edit",
  destructive action renames to "Clear" when size=1.
- **Copy-game preserves all (`9bb8f41`)**: `copyGame` / `copyGameAndEdit`
  switched to `JSON.parse(JSON.stringify(game))` like `copyCatchGame`
  has always done. No more silently-dropped `setup` field on copies.
- **No auto-merge on matching probability (`a902c78`)**: removed the
  "M-N has the same probability — merge?" confirm dialog from
  `_showGroupPopup`'s save handler. Groups are only created by
  explicit user action.
- **Palette extension 8→12 (`74ce8c2`)**: added indigo/lime/hot-pink/
  brown at slots M9–M12. Wrap still happens at M13.

### Files touched

- `pm-studio-DrV.html` — primary (most stages + popups + palette + copy-game)
- `index.html` — Player deck builder (Stage 5), palette sync, setup fallback, svgMarkup filter fix
- `docs/MEMORY.md`, `docs/STATUS_NOTES.md` — this entry

### Key code names (for future grep)

`_computeCardZoneInstances`, `_computeCardZoneInstancesStudio`,
`applyMWeightBadges`, `_editWeightBadgePct`, `_setCardProbability`,
`_loadDefaultFindGameSetup`, `_applyFallbackPlayerButtons`,
`DEFAULT_FIND_GAME_TEMPLATE`, `_findRemoveIdx`, `_mGroupColors`
(12 entries), `_CARDS_LIBRARY_M_COLORS` (12 entries).

---

## May 24, 2026 — M-card semantics overhaul + Game Creator polish

Major session, 18 commits. Started with Game Creator row/icon polish,
ended deep in the domino pair generator after a duplicate-domino bug
surfaced a chain of label-based identity assumptions. No JS/CSS files
modified, no cache-buster bumps. All commits pushed to the 3 mirror
branches.

### Per-area summary

**Times 2_ up to 7 row repair** — `_autoPromoteAddedCards`,
`_sortRowsAlphabetically`, `_appendAddRowAffordance` in
`pm-studio-DrV.html`. Cards with `_addedToGame: true` no longer
park in a single "+" staging row; promotion + alphabetical sort runs
on every view open and persists. Empty rows kept via
`game.emptyRows`. The "+" affordance sits under the row letter column
(verified at the same x-position as `.library-row-letter`).

**Game Creator title swap** — "Game Creator" H1 moved to the left
edge (was indented 40px); game-name H1 measured-and-aligned with the
white-caps "FIND THE DOUBLES" / "CATCH THE MATCHING BUBBLE" indicator
via `_alignGameNameToGameTypeIndicator()` inside rAF.

**Freeze/float duplicate-label fix** — `buildGameViewCard(cardInfo,
cardIdxInGame)` now tags DOM with `data-game-card-idx`. Both
`handleFreezeCardClick` and `renderFreezeIndicators` prefer idx over
label. Audit found two more sites of the same bug class:
`saveGameViewOrder` (drag-reorder, replaced splice-while-iter with a
Set-based `_consumedIdx`) and `deleteCard` (game-view propagation,
prefers idx ahead of stableId/uid chain). Both re-tag surviving DOM
cards after the mutation so subsequent ops use fresh indices.

**M-card UX** — M1/M2/… badges directly clickable for whole-group
ungroup with confirm. Tooltip + status text updated to mention both
paths (badge-click and in-mode + Ungroup button).

**M-group visual cleanup** — Bottom border 3→6px. Palette swap to
remove purple (`#7c4dff` was invisible on the purple page bg): now
starts with vivid yellow. Text-shadow on white badge text for legibility
on bright backgrounds. M-mode selection outline switched from 3px purple
to 4px white + outline-offset:2px + box-shadow glow + border-radius:9px.

**M-card identity (label → uid)** — Stored identifiers are now
`"u:<uid>"` for new groups; bare labels remain as legacy backward-
compat. Helpers: `_getCardIdentFromEl`, `_cardMatchesIdent`,
`_findCardByMGroupIdent`, `_isCardInMGroup`.
`_migrateMGroupsToUidForm(game)` runs on every open and persists —
converts each label entry to the uid of the FIRST matching card,
dropping duplicate-label siblings that were getting auto-included.
Both Studio and `index.html` gameplay paths updated to consume the
new format.

**Drag-end guard added to Find click handler** — Catch had `if
(_gvDragJustEnded) return;` but Find didn't. A drag in M-mode would
silently fire as a click on the drop target, toggling group selection
on whatever card was under the pointer. Mirrored the guard.

**Domino pair generator — three independent fixes:**

1. **stableId dedup** added to `buildEffectiveCards` (Studio) and the
   gameplay `origCards` builder. Two cards with different labels but
   same `stableId` (same source card) used to pass the label dedup
   and produce visually-identical duplicate dominos. Now collapse to
   one effective entry.

2. **Red×red and green×green filtered.** Added
   `_groupCanGoOnHalf(group, half)` helper. Applied in all three pair
   generators (two in pm-studio: Show Dominos area + rebuild; one in
   index.html: gameplay deck builder). Skips pair when neither
   orientation satisfies the freeze constraints; swaps orientation
   when only the mirror is valid.

3. **M-group decoupled from deck size.** User clarified intent:
   M-groups should be a visual tag + probability-weighting mechanism,
   NOT a deck collapse. Removed the group-folding loop from
   `buildEffectiveCards` and the mirror in `startCustomGame`. Each
   unique card (post stableId/label dedup) is now its own deck slot.
   For Match 0-4: 22 effective → 43 effective → 330 pairs (was 231
   raw / less after color filter).

### Open thread
User reconsidering whether M-grouping should happen at the **domino**
level (current: no card-level collapse, each card pairs with each)
vs the **card** level (previous: M-group collapses to one slot,
random face per draw). Decision deferred ("I need to think").

### Commit list

```
5b0fa20  fix: auto-promote Added cards into letter rows + "+" row affordance
b1a9ef4  polish: alphabetical row sort + cleaner title + aligned +row affordance
76ce1c1  fix: freeze/float dots support duplicate-label cards
423bb6c  fix: drag-reorder + deletion respect per-card index (duplicate labels)
4ea8375  ux: make M-badge click directly ungroup (discoverability)
c8d0ef1  ux: thicken M-group bottom border from 3px to 6px
4595e07  ux: swap M-group palette to non-purple high-contrast hues
9a4fb02  ux: swap title row indentation in Game Creator
d53e30a  ux: M-group ring around whole card + white outer band      (REVERTED)
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

---

## May 21, 2026 — Setup polish + loupe path support + Card→Icon copy

Single session, all six fixes shipped in one commit. Files touched:
`index.html` (148 lines changed), `pm-studio-DrV.html` (356 lines
changed). No JS/CSS changes → no cache-buster bump needed.

### Items in commit order

1. **Game Types delete confirm + ID-collision fix**
   `pm-studio-DrV.html` `_gsAddOption` / `_gsRemoveOption` (~12172,
   12200). `confirm()` before splicing (mentions label + warns on
   voice-input loss). Next ID = `max(existing numeric suffixes)+1`
   instead of `length+1` (prevents post-delete collisions).

2. **Voice button shrunk**: `'✎ words'` → `'✎'` in `_gsRenderForm`
   (~12563) to make room for the per-row `✕` on Type rows.

3. **"Copy to icons…" cascading menu** in Card Maker. Context-menu
   entry `◎ Copy to icons…` at ~6890 opens a 2-level cascade
   (`Find the Double (L1)` auto-copies; `Catch the Bubble…` opens
   size-class picker L1-S3). Always scoped to the active card set.
   `_copyCardToIconSlot` at ~8326 builds a fresh user icon
   (`_isTemplate:false`, fresh uid/stableId) cloning the target
   template's geometry + carrying the source card's svgContent
   verbatim. No SVG transformation — the icon renderer's fixed
   `viewBox="0 0 60 60"` handles auto-fit; the loupe's
   `_openIconForEdit` canvas promotion restores 60-unit editing.
   Hidden in Safe Haven. Multi-select-aware.

   Two submenu positioning bugs caught + fixed mid-development:
   (a) parent rect captured AFTER removing `_ctxSub` collapsed
   to (0,0) — fixed by capturing first; (b) wide visible gap
   between cascade levels because the offset was from item-right
   (with menu padding making it 15-25px visible) AND L3 destroyed
   L2 on open — fixed by docking against parent-menu-right with
   +2px and keeping L2 visible via `sub._parentSub` chain that
   `_ctxClose` walks back through.

4. **Loupe `<path>` drag + scale**. Symptom: user couldn't drag/
   resize a particular "3" card (Numbers D2). Root cause:
   `getElementPos`/`setElementPos` (3725-3781) only handled
   circle/text/g. Path was selectable but the position helpers
   silently no-op'd. Same for `applySizeToElement` — no path
   branch at all.

   Fix: split into 3 element classes —
   - `circle`/`ellipse` via `cx`/`cy`
   - `text`/`rect`/`image`/`use` via `x`/`y`
   - `path`/`line`/`polygon`/`polyline` via outer `translate(x,y)
     <data-base-transform>` (intrinsic transform captured once
     into `data-base-transform`, never overwritten)

   Added scale branch for path-like via scale-around-bbox-center
   chain (`translate(cx,cy) scale(s) translate(-cx,-cy)`) inserted
   INSIDE base. Bbox center captured once from `getBBox()` into
   `data-scale-cx`/`data-scale-cy`. User scale stored in
   `data-user-scale`. Baseline: slider `sz=30` ↔ 1x.

   Single source of truth: `_rebuildPathTransform(el)` composes
   position + base + scale every call. `populatePropsFromElement`
   got matching path branch for slider sync on re-select. Undo
   capture extended with all new attrs (4941, 5029, plus the
   size-history capture at ~4138).

   Verified with synthetic D2-shaped paths: 2x doubles bbox,
   0.5x halves, center holds across scales, drag-only moves by
   exact px, drag+scale composes correctly, slider syncs to 60
   after scale to 60.

5. **Card audit (read-only, one-off)**. Walked 698 cards across
   14 sets. Zero genuinely broken cards. 8 placeholder empties
   (intentional). 2 strict-XML warnings (xlink namespace on PNG
   stamps) — browser-side rendering / editing fine. Script not
   retained.

6. **Player Types/Levels visible count = configured count**.
   `index.html` `_applyGameSetupToPlayerScreen` (1655-1764) and
   `_renderTypesPicker` (1832).

   - Types: dropped the `.on` filter (one line). Renderer was
     already dynamic.
   - Levels: dynamic rebuild. Original 3 hand-crafted
     `.level-btn-wrapper` elements cached as templates the first
     time the renderer runs; rebuilt every call from
     `conf.levels.options`. Slots beyond 3 reuse the "star"
     SVG + get unique `data-level` tokens (`L4`, `L5`, …).
     Also dropped `.on` filter for parity.
   - Preserved: single-option → static text, zero-options →
     column hidden, selection-fallback when previous token
     disappears from the new set.

### Open follow-ups (intentionally NOT in this commit)

- **Gameplay engine for L4+ levels**: `js/game.js:1252, 1262, 1777`
  hardcodes `circle`/`triangle`/`star` → 2/3/4 dominos. Levels
  beyond #3 visually render but mechanically fall through to the
  4-domino branch. Same for Catch's `_fillCatchLevelBubbles:2666`.
- **No-op `.on` checkbox**: still present per row in Game Setup
  for Types + Levels but no longer affects the player. Either
  remove it from admin UI or repurpose (e.g. "default selection").
- **Path Size slider baseline**: arbitrary `sz=30 ↔ 1x`. Could
  tune if a different reading proves more natural.

---

## May 19–20, 2026 — IC (Icons' Creator) system: end-to-end, all phases ✅

A multi-day arc replacing the old "MPP" (Main Page Pictures) flow
with a dedicated icon authoring + assignment pipeline. Background:
multiple earlier attempts to render arbitrary Card-Maker cards
inside circular Catch bubbles kept fighting `viewBox` / `clipPath`
math; the user got fed up and proposed a new architecture where
icons are first-class assets purpose-built for the round bubbles,
authored separately from regular cards.

### Final architecture

**Storage**
- Icons live in `customDrawnIcons_<setName>` per card set
  (parallel to `customDrawnCards_*`). Each icon is a card-shaped
  record `{uid, sizeClass, gameType, cardShape, cardShapeW/H,
  cardCornerR, svgContent, …}`.
- Games hold an explicit pool of icon refs: `game.icons =
  [{uid, setName, sizeClass}, …]`. Per-game-per-size cap of **4**
  for every L1/L2/L3/S1/S2/S3 → 24 icons total per game.
- IC slot assignments live on `game.mainPageDominos.<level>[idx]`
  alongside the card-based fields:
  - Catch: `slot.icon = {uid, setName, svgContent, sizeClass, …}`
  - Find:  `slot.iconTop` / `slot.iconBottom` (per half)

**Size classes (`ICON_SIZE_CLASSES`, `cardShapeW` units → ~px)**
```
L1: 42 (~49 px)    S1: 25 (~29 px)
L2: 36 (~42 px)    S2: 21 (~25 px)
L3: 30 (~35 px)    S3: 17 (~20 px)
```
Find icons are rounded squares (`cardShape:'square'`, cornerR:15).
Catch icons are circles (cornerR: round(w/2)). Width is the
SOURCE OF TRUTH derived from `sizeClass` at render time — stored
`cardShapeW` is fallback only. Migration `_migrateIconSizes` snaps
any stale sizes back on load.

**Card Maker UI (top of every card set)**
- "Icons" row with two subsections: "Find the Double" + "Catch
  the Bubble". Collapsible. New `IC` toolbar button toggles all
  sections.
- 7 seeded templates per set (1 Find + 6 Catch). Versioned via
  `ICON_TEMPLATE_VERSION = 3`; bumps swap templates on next open
  while preserving user icons.
- Templates: gold dashed border + size-class pill in centre +
  "template" caption.
- User icons: solid cyan border + size-class caption underneath
  + actual artwork visible (no overlay).
- Per-card buttons (hover-reveal, hug the preview corners):
  - Green ⧉ copy (every icon)
  - Red ✕ delete → moves to Safe Haven (user icons only)
  - Blue →G send-to-game (user icons only)
  - In Safe Haven: green ↷ restore + red ✕ permanent-delete

**Icon Editor** — reuses the existing loupe + draw-mode pipeline,
NOT a separate modal (user vetoed the modal). Adapters:
- `_openIconForEdit(card)` normalizes the icon to 60×60 for the
  loupe, calls `openLoupe(card)` + `toggleDrawMode()`.
- `closeLoupe` icon-hook restores the icon's authored shape +
  size class before saving (the loupe would otherwise clobber
  them with its working 60×60 values), then writes `svgContent`
  back to `customDrawnIcons_<setName>`.
- Editor toolbar customizations during icon edit:
  - `#draw-shape-row` hidden (shape locked by size class).
  - Real-size preview docked as first child of `#draw-tools-panel`
    (dashed gold border, mirrors the loupe canvas live via
    `MutationObserver`). Travels with the toolbar as one drag unit.

**Icon-to-Game migration**
- Blue →G button on user icons opens a small popup anchored to
  the button.
- Lists eligible games (matching gameType). Each row shows
  `Game Name · L1 2/4` (current pool count / cap). Rows are
  disabled with explanatory suffix when this exact icon is
  already in the game (`✓ this exact icon already in game`) or
  the size-class pool is full (`L1 pool is full (4/4)`).
- Footer hint reminds the user: "Need more L1 candidates? Copy
  the L1 template (green ⧉) to make another, then click →G again."

**IC panel (Game Creator)**
- Renamed from "Main Page Pictures" to "IC — Icons' Creator".
- Renders `game.icons` (NOT inferred from card sets) as a row of
  thumbnails, sized to match Card-Maker sizes (L1 49 px → S3
  20 px), bottom-aligned, sorted L1 → S3.
- Each thumbnail has a × remove button that strips the ref from
  `game.icons` and clears any IC slot currently using that icon.
- Size-class enforcement: clicking a slot dims thumbnails that
  don't match the slot's size class (`L1` bubble → only L1 icons
  clickable). Mismatched click → 350 ms red ring flash, no-op.
- Slot assignment writes a self-contained icon descriptor
  (svgContent + shape + size) so the start page can render
  without re-resolving the source icon.

**Start-page rendering** — four renderers updated in `index.html`:
- `_introCatchIconSVG` (game tile, 2 bubbles)
- `_introFindIconSVG` (game tile, 2 dominos × top/bottom)
- `_fillCatchLevelBubbles` (level-selection screen, all bubbles)
- `updateLevelDominoIcons` (Find level-selection, all dominos)
All four prefer `slot.icon` / `slot.iconTop` / `slot.iconBottom`
over the card-based path. Icons render with a LOCAL clipPath
(circle at 30,30 r=30 inside the icon's own 0–60 viewBox) to
avoid the off-center clipping bug that chopped icon tops when
the bubble's outer-coords clipPath got reinterpreted in inner-
SVG coords.

**Safe Haven for icons**
- Soft-delete: `_deleteIcon` flips `_trashed=true` + sets
  `_trashedFrom`. Icon stays at the same `{uid, setName}` so
  `game.icons` refs keep resolving (but are filtered out
  everywhere a "live" icon would render).
- Safe Haven card set renders a special "Icons Trash" row that
  gathers `_trashed` icons across every set via
  `_gatherTrashedIcons()`.
- ↷ restore clears the flag; ✕ purge permanent-deletes AND
  strips orphan refs from every `game.icons` array.

### What was explicitly skipped
- **Phase 3 (loupe inset preview)** — superseded by the real-size
  preview docked in the draw toolbar during icon edit.
- **Voice names on icons** — user said not needed.
- **Cross-device export** — `game.icons` refs are local; a slot's
  full descriptor on `mainPageDominos` does travel.

### Decisions worth remembering

1. **One editor, not two.** Earliest Phase 2.2 cut shipped a
   standalone modal for icons. User pushed back; we deleted the
   modal and adapted the existing loupe. Lesson: when the user's
   intuition says "we already have a thing for this", trust it
   and find the integration cost, even if it looks higher.

2. **`sizeClass` is the source of truth at render time.** Stored
   `cardShapeW` is a hint that can go stale (and did, multiple
   times, across buggy save paths). `_buildIconCardElement` now
   derives dimensions from `ICON_SIZE_CLASSES[sizeClass]` directly.

3. **Inner-SVG clipPaths must use inner coords.** The bubble's
   pre-existing clipPath uses outer-SVG user space (e.g. cx=35
   for big circle slot 0). Applying it to a nested `<svg>` with
   its own `0 0 60 60` viewBox re-interprets `(35, 40)` as inner
   coords — off-center from `(30, 30)`. Always define a local
   `<defs><clipPath>` inside the nested SVG.

4. **Explicit migration > implicit inference.** First IC-panel
   cut auto-pulled icons from every card set the game touched.
   User: "without transferring icons from card maker to game
   creator, the cards should not be moving here." Replaced with
   the explicit `→G` button + `game.icons` pool.

5. **Defensive guards beat hunt-the-bug.** Last task of the arc
   was the "Start Game button missing on GPt C42" report.
   Couldn't pinpoint the upstream culprit; instead added
   `_ensureStartButton` to every render path of the player
   setup, including the idempotency early-return + a final
   safety net at the end of `_applyGameSetupToPlayerScreen`.
   Plus moved the Catch interceptor to document-level
   delegation so recreations don't lose the click handler.

### Commit highlights (May 19–20, in order)

```
bb10bec  Game Creator: row letters + +Row button
122393d  freeze: honor red/green dot placement always
2bb8ad5  rename Freeze/Float to Red/Green dot
…  (multiple MPP-rendering attempts, all rolled into the IC rewrite)
fb60a6e  feat(card-maker): add Icons row foundation [Phase 1.1]
7c2ad9f  fix(icons): templates shaped + sized correctly, labels readable
560a8ce  fix(icons): force-show icon labels in compact-view
a59f306  fix(icons): 70% size, full game names, size label inside card
9500aaa  feat(icons): copy + delete on icon cards [Phase 2.1]
f7c4f86  fix(icons): user icons show size class below, no overlay pill
afe0d13  feat(icons): Icon Editor modal — text + stamp [Phase 2.2]
6e3a22b  refactor(icons): reuse the regular Card editor (modal deleted)
2650c0d  fix(icons): normalize to 60x60 in loupe; restore size on close
bcb9a98  fix(icons): migrate user-icon shapes back to size-class dims
6e4694f  fix(icons): size from sizeClass at render time
38dc12d  fix(icons): exclude icon previews from applyLibZoom
e6724f1  feat(ic): icons in IC panel + Catch bubble assignment [Phase 4.1]
e615262  fix(ic): inner-local clipPath for icon-in-bubble (no top crop)
a17d677  fix(ic): scope to game's card sets + size thumbnails by sizeClass
b6e0c23  feat(ic): size-class enforcement [Phase 4.2]
25247c9  feat(ic): explicit icon→game migration via send button + game.icons
2d40103  feat(start-page): render assigned icons in real bubbles [Phase 4.3]
b757485  fix(ic): render iconTop/iconBottom in Find panel
55347af  feat(ic): disable shape controls during icon edit
a2d70aa  feat(ic): real-size preview pinned to loupe during icon edit
2ed8aef  feat(ic): per-game-per-size-class icon caps (L=3, S=4)
0b513c9  fix(ic): caps total 24; clearer 'already added' messaging
6ba03e9  feat(ic): dock real-size preview at top of toolbar; hide shape row
6d242c5  feat(ic): Safe Haven for icons (soft-delete + restore + purge)
b8a4452  fix(setup): defensive _ensureStartButton — Start Game never missing
f2b70e6  fix(setup): ensure Start Game on every render path
```

### Cache-buster trail
- CSS: `icons-row-1` → `icons-row-2` → `icons-row-3` → `icons-row-4`
  → `icons-p2-1` → … → `icons-p4-12` → `icons-p5-1`
- `js/game.js`: `lock-halves-1` → `ensure-start-1` → `ensure-start-2`

### Files touched
- `pm-studio-DrV.html` — bulk of new code: templates, storage,
  icon row, picker popup, IC panel icons section, Safe Haven
  rendering, `_iconAddToGame` / `_iconRestoreFromSafeHaven` /
  `_purgeIcon` / `_gameIconCountBySize` etc.
- `index.html` — start-page icon renderers (4 places), Catch
  interceptor delegation, `_applyGameSetupToPlayerScreen` safety
  net, cache busters.
- `js/game.js` — `_ensureStartButton` + hooks in
  `renderInlinePlayerNames` and `selectPlayerCount`.
- `css/style.css` — entire `.icon-card`, `.icon-real-size-*`,
  `.icon-game-picker`, `.mpp-icons-*`, `.mpp-icon-thumb-*`,
  `.icon-send-btn`, `.icon-restore-btn`, `.icon-purge-btn`
  blocks.

---

## May 19, 2026 — Phase 2.2 revised: reuse the regular Card editor for icons

The first cut of Phase 2.2 shipped a standalone modal editor for
icons. The user pushed back — rightly — pointing out that we
already have a perfectly capable card editor (loupe + draw mode)
and shouldn't maintain two. This refactor deletes the modal and
makes icon edit reuse the existing editor end-to-end.

Two tiny adapters do the bridging without touching the editor's
internals:

1. **`_openIconForEdit(card)`** (~10 lines) — calls the existing
   `openLoupe(card)` + `toggleDrawMode()`. openLoupe just queries
   for an `<svg>` child, so icon cards qualify natively. The
   card's setName is stashed on its dataset (`iconEditSet`) so the
   close hook knows where to write back.

2. **closeLoupe hook** — if `loupeSourceCard.dataset.icon === 'true'`,
   sync the (already updated) svgContent to
   `customDrawnIcons_<setName>` via `saveIconsForSet` and re-render
   the Icons row. The existing `saveCustomCards` call inside
   `toggleDrawMode` continues to skip icons (they don't have
   `.library-card`), so there's no risk of icon SVG bleeding into
   regular-card storage.

Removed:
- `_openIconEditor`, `_iconEditorTextSVG`, `_iconEditorStampSVG`,
  `ICON_EDITOR_COLORS` (~190 lines of JS).
- `.icon-editor-*` CSS rules (~140 lines).

What this gives users:
- Full pencil/line/stamp/text/color toolbar — the same one cards use.
- Magnified loupe canvas instead of a 200 px modal.
- Undo / redo, grid overlay, resize handles, ruler — all just work.
- One editor to learn, one to maintain.

Cache buster bumped to `?v=icons-p2-4`.

---

## May 19, 2026 — Phase 2.2: Icon Editor (text + stamp) — SUPERSEDED

User icons are now authorable. Double-click any user icon (templates
remain non-editable) to open a modal editor that replaces the icon's
svgContent. Two design modes:

1. **Text** — type up to 3 characters; pick font size (10–54) and
   color; preview live at 200×200.
2. **Stamp** — grid of the 10 existing `stampSVGs` (sun, alien, cat,
   dog, etc.) auto-scaled from 100×100 to fit the 60×60 icon viewBox.

Helpers:
- `_iconEditorTextSVG(text, size, color)` — centred text payload with
  baseline-offset y so the glyph sits visually centred.
- `_iconEditorStampSVG(stampKey)` — wraps the chosen stamp in a
  `<g transform="scale(0.6)">` to fit the icon viewBox.

UX:
- Shared color swatches (8 colors) drive both text fill and (later)
  stamp tint.
- Clear button empties the icon to start over.
- Cancel / Esc / overlay-click discards without writing.
- Save commits the new svgContent to localStorage and re-renders the
  Icons row, preserving its open state.

The editor REPLACES content rather than supporting layered freehand
drawing. That's enough for first-pass icons; a freehand mode can
come later if needed.

### Files touched
- `pm-studio-DrV.html` — `_openIconEditor` + helpers, dblclick wiring
  on user icon cards.
- `css/style.css` — `.icon-editor-*` (overlay, panel, tabs, stamp
  grid, swatches, buttons). Cache buster `?v=icons-p2-3`.
- `index.html` — cache buster only.

---

## May 19, 2026 — Phase 2.1: Icon copy + delete

Icons row is no longer read-only. Adds the first interaction layer:
the user can spawn editable icons from templates, then remove them.

### What shipped
1. **Copy button on every icon card** — green ⧉ in the top-left of the
   bubble; visible on hover. Calls `_copyIcon(sourceCard)` which clones
   the source's shape/size/svgContent into a new icon (fresh uid,
   `_isTemplate: false`, desc `icon`), inserts it directly after the
   source in `customDrawnIcons_<setName>`, and re-renders the section.
2. **Delete button on user icons only** — red ✕ in the top-right.
   Templates are permanent (no button rendered); user icons can be
   removed via `_deleteIcon(card)` which drops by uid and re-renders.
3. **Buttons anchored to preview wrap, not card** — new
   `.icon-preview-wrap` is a non-clipping `position:relative` shell
   around `.domino-half-preview`. The buttons sit on the bubble's
   corners regardless of icon size (templates are 49 px down to 20 px).
4. **User-icon styling** — solid cyan border + cyan italic desc reading
   "icon" instead of the dashed-gold "template" look.
5. **Section state preserved across re-render** — `_rerenderIconsForCard`
   remembers whether the section was open/collapsed before mutating
   storage and restores it after, so the user doesn't lose their
   place.

### Files touched
- `pm-studio-DrV.html` — buttons, copy/delete handlers, preview wrap.
- `css/style.css` — `.icon-preview-wrap`, `.icon-copy-btn`,
  `.icon-delete-btn`, user-icon colour differentiation. Cache buster
  `?v=icons-p2-1`.
- `index.html` — cache buster only.

### Still queued
- Icon editor / drawing (Phase 2.2): double-click a user icon to draw
  on it. Could reuse the existing card edit machinery or open a
  dedicated magnified editor.
- Loupe inset preview (Phase 3).
- Game Creator slot filter + L1→L1-only drop rule (Phase 4).

---

## May 19, 2026 — Phase 1.1: Icons row (IC system) foundation

After many failed attempts to make Catch MPP bubbles render arbitrary
Card-Maker cards cleanly inside a circle, we pivoted to a dedicated
**Icons** (IC — Icons' Creator) layer: users design icons specifically
sized for the round bubbles, instead of forcing arbitrary cards in.

### What shipped (Phase 1.1)

1. **Hardcoded templates** — `_defaultIconTemplates()` returns 1 Find
   template (FT-L1, big circle) + 6 Catch templates (CT-L1/L2/L3 big
   circle/triangle/star at r=28/26/24, plus CT-S1/S2/S3 small
   versions at r=18/16/14). Templates are stroked dashed-yellow
   outlines on the standard 60×60 viewBox.
2. **Per-set icon storage** — new `customDrawnIcons_<setName>`
   localStorage key (separate from `customDrawnCards_*`).
   `loadIconsForSet`, `saveIconsForSet`, `ensureIconTemplates`
   (first-load seeding) provide the storage layer.
3. **Icons row rendered above row A** — every `buildNumbersCardSet`,
   `buildAbcCardSet`, `buildCustomCardSet` now calls
   `renderIconsRow(container, setName)` first. The row contains two
   subsections (Find / Catch) and is collapsible. Default state:
   collapsed.
4. **Icon cards are isolated from existing card logic** — `.icon-card`
   does **not** include `.library-card`, so every existing selector
   that iterates `.library-card` (save, arrange, drag, copy,
   group-edit, …) skips them automatically. Icon cards live inside
   `.library-icons-section` rather than `.library-row`.
5. **Toolbar** — `MPP` button in Game Creator renamed to **IC** (same
   handler, new wording). A new **IC** button in the Card Maker
   toolbar (between `+` and `GM`) toggles the visibility of all
   Icons sections on the page via `toggleIconsRow()`.
6. **CSS** — `.library-icons-section`, `.library-icons-header`,
   `.icons-subsection[data-game-type]`, `.icon-card` (rendered at
   `transform: scale(0.5)` with negative margins so neighbours don't
   overlap), `.icon-size-badge` (top-left, size class), and
   `.icon-template-badge` (top-right, "template" tag).

### Files touched
- `pm-studio-DrV.html` — IC button, MPP→IC rename, template + storage
  layer, `renderIconsRow`, hooks in three build functions.
- `css/style.css` — new Icons row styles (cache buster
  `?v=icons-row-1`).
- `index.html` — cache buster only.

### Not in Phase 1.1 (deferred)
- Drag/copy/scale of template → user icon (Phase 2)
- Loupe inset preview for icons (Phase 3)
- Game Creator size-class slot filter (Phase 4)
- IC slot drag-and-drop (only L1→L1, etc.) (Phase 4)

---

## May 17–18, 2026 — Game Creator: row letters, +Row, Red/Green dot rename + always-on

Two short sessions back-to-back. Internal identifiers (`_freezeState`,
`freezeEnabled`, etc.) stayed put; the changes are user-facing
behavior + wording.

### What shipped

1. **Row letter chips in Game Creator** — `#game-view-screen` now
   stamps every row with its A/B/C/+ letter span via
   `_addRowLetterSpan`, matching Card Maker. The bottom "Added" row
   gets a `+` chip.
2. **+Row toolbar button** — new `addEmptyGameRow()` prompts for an
   A–Z letter (suggests the next unused one), pushes it to
   `game.emptyRows[]`, and renders an empty drop-target row with a
   "(empty — drag cards here)" hint. Survives re-renders. Auto-
   clears from `emptyRows[]` once a real card lands in it
   (`saveGameViewOrder` prunes + syncs with the DOM).
3. **Cross-letter drag fix** — `saveGameViewOrder` now prefers
   `row.dataset.rowLetter` over the first card's first char, so
   dragging an A-card into row B stores `_gameValue: 'B'` instead
   of `'A'`. Backward compatible because all rendered rows get
   `dataset.rowLetter` stamped at render time.
4. **Empty / Added rows no longer auto-deleted on drag-out** —
   guarded on `dataset.emptyRow` / `dataset.addedRow`. Placeholder
   hint reappears when the last card leaves an explicit empty row.
5. **Red dot / Green dot rule honored always (no enable-toggle
   gate)** — the dot is a per-card contract. Whenever
   `_freezeState` is set, the live game's `topPools` /
   `bottomPools` and Studio's "Show Dominos" preview both respect
   it. `freezeEnabled` is now purely a UI flag: it controls the
   Studio assign-mode and visible dot indicators, nothing else.
6. **Wording: Freeze/Float → Red dot / Green dot** — toolbar
   tooltip, on/off button states, per-dot tooltips, and a new
   gameview help entry now use "Red dot / Green dot" with a
   per-game meaning line:
   - **Find the Double**: red = TOP half forced, green = BOTTOM half
   - **Catch**: red = static (anchored), green = falling
   - No dot = either side / any role
   Game-type-aware composition driven by `_currentGameViewType()`.
7. **Live dot-click rebuild** — `handleFreezeCardClick` now triggers
   `rebuildGameViewDominos()` when the Show Dominos panel is open
   in Find, so dots take effect immediately in the preview without
   re-toggling Show Dominos.

### Files touched

- `pm-studio-DrV.html` — Game Creator render path (row letters,
  empty rows), `+Row` button, `addEmptyGameRow()`, dot-rename in
  button/tooltips/help, placement helper `_pickGameViewRep`,
  `rebuildGameViewDominos` ungated, `handleFreezeCardClick` triggers
  rebuild, `saveGameViewOrder` letter-priority + `emptyRows[]` sync.
- `index.html` — `startCustomGame` pool builder ungated:
  `topPools` / `bottomPools` always filter by `_freezeState`.

### Operational

- Cache-busters left as-is (no `css/style.css` or `js/game.js`
  changes; all edits were inline in the HTML files).
- Internal identifiers (`_freezeState`, `freezeEnabled`,
  `toggleFreezeMode`, `freeze-indicator`) intentionally NOT
  renamed — purely user-facing rename.

### Heads-up for next session

- If Victoria wants Red/Green dots to mean something in **Match**
  or other future game types, define the per-half pool logic in
  `index.html` (the Match game uses a separate render path) and
  branch `_currentGameViewType()` cases in the tooltip composer
  in `updateFreezeBtnState` / `renderFreezeIndicators`.
- `game.emptyRows` is opaque to older clients — if cloud sync
  pushes an older game version back, the empty-row entries
  vanish. Not a data loss issue (just visual rows), but worth
  knowing.

---

## May 13, 2026 evening — First local-Mac session: toolchain + 3 ships + ABC migration

First-ever session running locally on Victoria's Mac instead of
the Anthropic cloud sandbox. Toolchain bootstrap + 3 small ships
+ one browser-data fix.

### What shipped (chronological)

- `41c6d35` `studio: seed A1/B1 placeholder cards with stableIds`.
  `_createNamedSet` (line 14861) now stamps a fresh stableId on
  each of the two placeholder cards it seeds into every new
  card set. Closes the last code path that violated the stableId
  contract. Static + preview-browser verified.

- `aa6ab60` `chore: gitignore .claude/ session config`. One-line
  add to `.gitignore`. Stops Claude Code's per-machine session
  config (`settings.local.json`, `launch.json`) from showing as
  untracked.

- `b1efa14` `studio: auto-show Group Edit toolbar on Shift+click`.
  **Closes P2** from the May 11 plan. New helper
  `_updateGEToolbarVisibility()` makes the Gr toolbar appear
  whenever `groupEditSelected.length >= 1`, even without
  toggling Gr mode. Wired into 3 passive-selection lifecycle
  points (Shift+click toggle line 5527, non-shift click clear
  line 5540, Esc clear line 8611). Logic verified via preview
  browser; behavior verified by user in Chrome.

### Browser-side data fix (no commit)

- 15 stableless cards in `customDrawnCards_abc` got stableIds
  via a console snippet that mirrors `buildAbcCardSet`'s
  built-in migration. Game-side propagation scheduled. Result:
  all 15 cards now carry stableIds matching shape
  `<ts>_ABC_<label>_<rand4>`. `sync.js` will upload to
  Firestore on its next budget window.

### Toolchain set up on the Mac (one-time per machine)

- Repo cloned to `~/CLAUDE CODE/Domino`. Two false starts (Claude
  Code's auto-created `.claude/` stub, Finder's `.DS_Store`)
  blocked the clone; resolved by deleting stubs and retrying.
- Git identity configured globally:
  `Victoria Kofman <66704482+vkofman56@users.noreply.github.com>`
  — uses the GitHub noreply alias, not the auto-derived
  `hostname@local-ip` address that would leak the home IP into
  the public commit log.
- Pre-commit hook activated (`git config core.hooksPath
  .githooks`). Confirmed working — banner auto-stamped on both
  code commits tonight.
- GitHub auth via `gh` CLI (installed Homebrew first, then
  `brew install gh`, then `gh auth login` web-browser flow).
  Future pushes from this Mac are silent.
- Preview-browser test pipeline stood up via `.claude/launch.json`
  (gitignored). Lets Claude drive a headless Chrome via
  `mcp__Claude_Preview__*` tools for behavioral verification
  without asking Victoria to click through manually.

### Insights surfaced

- **"15 stableless cards" was a coverage gap, not stale paperwork.**
  The migration at `buildAbcCardSet:15634` only fires when the
  user opens the ABC tab inside the Card Maker. A fresh browser
  that hydrates from Firebase but never navigates into ABC keeps
  the 15 cards stableless. Once any browser triggers the
  migration, `sync.js` uploads the fixed array and all other
  browsers pull it down. Self-healing, but with a precondition
  the docs hadn't captured.
- **Firestore `resource-exhausted` errors observed in user's
  console.** Sync.js queued more writes than its budget allowed
  during a heavy save burst. Backed off automatically; not
  blocking, but suggests `sync.js` may be aggressive on bulk
  writes. Worth keeping in mind.

### Still open

- Repo housekeeping: 9 old branches on origin awaiting deletion
  (May 12 audit list). User-side action via terminal — not
  Claude.
- Optional polish: wire `_updateGEToolbarVisibility()` after
  right-click batch op completions (Move/Copy to set/row at
  lines 5789+). Toolbar currently lingers briefly with stale
  state after such ops; cheap follow-up if it proves annoying
  in practice.

## May 13, 2026 — Card-group operations complete + submenu hover fix

Closes the four-feature card-group operations plan from May 11.
After today every right-click action on a multi-selected group
in the Card Maker behaves consistently: Delete, Copy, Copy to
row, Move to row, Copy to set, Move to set — all loop the
operation across `groupEditSelected` in a single undo entry, all
show their counts in menu labels, all flash a status when the
batch lands.

### What shipped (chronological)

- `1b8f54c` Right-click **Copy** (multi-aware in-place duplicate)
  + new **Copy to…** submenu listing rows. Closes (d).
- `17b2506` Right-click **Move to set…** submenu. Closes (b).
  Extracted `_moveCardToSet` from `_moveCardToSafeHaven`.
- `0a885a3` Diagnostic logs added to chase the next bug
  (later removed in 2a148a6).
- `2a148a6` Fixed the "sibling submenu kills the new one" race
  by capturing `guardedSub` at each parent's mouseleave time and
  only removing on identity match.
- `140d5f2` Right-click **Copy to set…** submenu. Closes (c).
  `_copyCardToSet` writes fresh-stableId copies; source DOM is
  untouched.
- `5b7a8cd` Cross-set move/copy batches now pack into **one new
  row** in the target (E1, E2, E3, E4) instead of one row per
  card. Optional `optLabel` arg on the two per-card functions,
  wrapper precomputes the batch row letter before the loop.
  Status flash names the destination row.
- `b488c10` Submenu hover handoff: submenu now has its own
  `mouseenter` that cancels the pending close timer
  (`sub._pendingClose`), and its own `mouseleave` that
  schedules a fresh close. Slow hovering across the gap no
  longer kills the submenu.
- `439e7ca` Restored an 8px gap between parent and submenu after
  b488c10's flush positioning blocked the parent items below.

### Right-click menu state (passive / non-Group-Edit mode)

```
Edit in Loupe
Copy (N)            ← in-place duplicate
Copy to…            → row submenu (current set)
Copy to set…        → cross-set submenu (other sets)
Delete (N)
─────
Move N to…          → row submenu (current set)
Move N to set…      → cross-set submenu (other sets)
Set as Reference
Properties
```

Count in `(N)` / `N to…` only shows when right-clicking a card
that is part of a 2+ multi-selection. Single-card right-click
keeps the original labels.

### Still open

- P2 — auto-show Gr toolbar on Shift+click.
- `_createNamedSet` seeds (A1 / B1 stableless placeholders).
- 15 stableless cards in `customDrawnCards_abc` legacy seed.
- 9 old branches on origin awaiting user-side deletion.

## May 12, 2026 evening — Right-click multi-selection actions

Three Card Maker polish ships building on yesterday's design plan
for card-group operations.

- **f7c655d / 4e30329** — New `Shift+click` entry in the Card
  Maker help map (`pm-studio-DrV.html:12560`) so multi-select is
  discoverable. Wording is plain "Shift+click" — matches what the
  handler at line 5514 keys off (`e.shiftKey`).

- **4bf956a** — Right-click → **Delete** honors multi-selection.
  When the right-clicked card is part of a 2+ Shift-selected
  group, dispatches to `geActionErase()` instead of opening the
  single-card "Delete permanently" dialog. Single-card right-click
  unchanged.

- **934b3b6** — Right-click → **Move to…** honors multi-selection.
  New `_ctxMoveCardOrSelectionToRow(card, targetRow)` wrapper
  loops the move across `groupEditSelected` in a single undo
  entry; cards already in the target row are skipped. Menu
  labels show the count: "Delete (4)" / "Move 4 to…" when
  right-clicking a card that's part of the selection.

- **786d0f1** — Restored Safe Haven option on the group path.
  4bf956a routed right-click multi-Delete to `geActionErase`,
  which used a plain `confirm("Erase N cards?")` — the Safe
  Haven choice from the single-card flow was no longer
  reachable for a multi-selection. Replaced the confirm with a
  three-button dialog: 🛡️ Move N to Safe Haven (green, always
  available, works for game-used cards too since stableIds are
  preserved) / Delete N permanently (red, only shown if a safe
  subset exists, label spells out how many game-used cards
  will be skipped) / Cancel. Yellow warning panel lists game-
  blocked cards when present. Affects all four callers (Gr-bar
  Erase, Group Edit ctx menu, right-click multi Delete, Delete
  key).

The right-click menu's **Copy** item is still single-card —
user explicitly held off on group-copy. That maps to the larger
"copy group to another set / row" features from yesterday's plan,
which are still pending (see MEMORY.md for the four-feature
breakdown and current status).

## May 12, 2026 morning — Remote-branch audit (action pending)

User asked for a full audit of every branch on `origin`. Result: 9
branches recommended for deletion, 2 to keep, plus the 3 live ones.
**Nothing was deleted from origin** — user wants to read this report
and decide. I pruned local tracking refs to keep the sandbox clean
(remote unchanged; refetch with `git fetch --all`).

### Repo topology

Only `origin/master` (merge-base `570f9d8`, the PR #6 merge from
May 9) shares history with our HEAD at `21319a4`. Every other
branch on origin has an **independent history** (no common
ancestor), from earlier imports/forks. That's why huge diff sizes
(30K–50K lines) for those branches are misleading — they're not
"missing work" we should pull in, they're parallel universes.

### Branches to DELETE (9)

```
Tier A — fully merged into HEAD's history (0 ahead, 67 behind):
  claude/catch-bubble-pictograms-fix

Tier B — abandoned/superseded experiments, spot-checked clean:
  Resizing-for-different-hardware            (2026-01-04, predates Studio)
  find-the-double                            (2026-01-31, predates Studio; PR #1 already merged its essence to main)
  claude/review-vica-domino-notes-vxyYf      (2026-02-07, old card art tweaks)
  claude/review-daily-progress-4qGJy         (2026-02-14, coins/gems experiment, predates Studio)
  claude/read-todays-notes-zfR1g             (2026-02-28, old cardArrangement / ABC infrastructure)
  claude/review-project-docs-QNagl           (2026-03-29, features superseded; PRs #3+#4 closed)
  claude/clarify-task-1NM0X                  (2026-04-19, draw-slider exploration, doesn't match current Studio)
  claude/fix-card-deletion-bug-ElUcy         (2026-04-26, card-deletion code has been rewritten since)
```

### Branches to KEEP

- `master` — GitHub default branch, holds PR #6 merge (May 9).
  Canonical record. Our 21 commits since the merge are not in
  master yet; bringing master forward would be a manual step from
  user's laptop.
- `main` — Has **open PR #5** (`master → main`). Until that PR is
  closed/merged, main is the longer-term "approved" branch. Last
  touched March 31; content stale, but the open PR keeps it
  nominally relevant. Don't delete until the PR is resolved.
- The three live branches: `claude/review-project-docs-JOOeh`,
  `claude/general-session-yVBQq`, `claude/resume-vica-domin-UOJun`.

### Action plan (for user, when ready)

**Phase 1.** Delete the 9 Tier A + B branches via GitHub web UI
(Settings → Branches → trash) or from user's laptop:
`git push origin --delete <branch>`. Don't do it from this sandbox
— branch deletions usually work but doing it from the laptop
avoids any proxy weirdness.

**Phase 2.** Resolve open PR #5 (`master → main`): either merge it
(brings main up to master's state) or close-without-merge. Then
decide whether `main` itself should stay — grep-check first that
nothing external (GitHub Pages config, README links) references
it.

**Phase 3.** Once user picks `master` or `main` as the canonical
branch, fold the deploy-source branch (`claude/review-project-
docs-JOOeh`) into it from laptop. Shrink the three-branch dance to
two-branch (deploy + mirror).

## May 10-11, 2026 — Levels-as-column UX + card-set bugfixes + loupe copy/paste

Long single session, four threads. All three branches end at `0d1dbfb`.

### Theme 1: GP Setup level picker rebuilt to mirror Game Type column

Player-facing GP Setup right column has a vertical list of bordered
Game Type rows (.setup-right-types / .setup-type-line). User wanted
the Levels column to look identical.

End state on the left column (`pm-studio-DrV.html:140-200`,
`index.html:93-200`, `css/style.css:3520-3600`):
- `.game-level-select` is a flex column-reverse stack with
  highest-level-icon on top, lowest on bottom.
- Each `.level-btn-wrapper` is a full-width bordered box (1.5px
  /0.18α border, 10px radius, 10×14 padding) — identical values to
  `.setup-type-line`. Icon on left, label on right.
- Inner `.level-btn` is now transparent/borderless — wrapper carries
  the visual box.
- Selected state lives on `.level-btn` via JS (`initGameLevelSelector`
  in js/game.js:384-408 toggles `.selected` on the button), then the
  wrapper picks it up via CSS `:has(> .level-btn.selected)` for the
  gold highlight.
- Click handler attached to the wrapper, not the button, so the
  whole row is clickable.
- h3 title sits as a sibling above `.game-level-select` inside
  `.setup-left`. `.setup-left { text-align: center }` centers it
  above the column.

Path getting there had three intermediate forms (column-reverse flex
with labels-right at b649e4d, then a 2-col CSS grid at 8c0b20e
trying to align the title with only the icons, then the current
box-row form at 6bd2268). Three JS restore paths (`js/game.js:3746`,
`js/game.js:4189`, `index.html:1266`) clobbered the grid layout by
hardcoding `display: flex` / `'flex'` on `.game-level-select` /
`.level-btn-wrapper`; all three now use `style.display = ''` so the
stylesheet wins (90783d9, 7ebf2d5, fixed inline-html restore in the
6bd2268 commit).

Other axis polish on the same screen:
- "Choose the icon" / "Type your name" labels above per-player rows
  removed everywhere they were rendered (9ec49ad).
- Trailing `":"` after the Type-of-Game axis label dropped (0e4f748).

### Theme 2: Card-set bugfix series

User reported false-positive "card is used in a game" warning when
trying to erase a card in a copied card set. Two compounding bugs:

1. `_doCopySet` (`pm-studio-DrV.html:14227`) wrote source cards
   verbatim to the new set's localStorage key, so every card in the
   copy inherited the source's stableId. `_geFindCardUsage`
   (9154-9188) then matched the copy's cards against any game wired
   to the source. **Fixed in 210d271** — per-card `.map` that
   regenerates stableId via `generateStableId(card.label, newName)`.
2. The same usage-check has a label-only fallback at line 9169/9181
   that fires when a card has no stableId. User audit revealed 211
   of 566 cards in the library lacked stableIds. With short labels
   like `A1` appearing in 9 different sets, the fallback cross-
   matched aggressively. Root of the 211 was 6 orphan card-set blobs
   in localStorage (Multiply 1a, Numbers Dots 0-6, Test Set, Copy of
   Test Set, Numbers Dots 3-10, Multiply by 3 — ~1.75 MB total) left
   behind when sets were deleted from the UI but their
   `customDrawnCards_*` keys weren't purged. **All 8 active sets had
   100% proper stableIds** — only the orphans + the legacy
   `customDrawnCards_abc` built-in seed were stableless.

User ran three console-only operations (NOT in repo, one-time
operations against their browser's localStorage):
1. Visual HTML backup of all 6 orphans (1.75 MB) downloaded to
   user's Downloads folder. Initial viewer rendered "(no SVG)"
   placeholders because card `svgContent` strings are SVG fragments
   (`<text x=… y=…>…</text>`), not full `<svg>` elements — fixed by
   wrapping each fragment in
   `<svg viewBox="0 0 60 80" width="100" height="...">` at view time.
2. The 6 orphan localStorage keys deleted; ~1.7 MB freed.
3. Cards from the backup file merged into a user-created `Extras`
   set via a file-picker snippet running in the studio tab:
   - Each card got a fresh stableId via
     `generateStableId(label, 'Extras') + '_n<counter>'`.
   - Labels suffixed with source set name (e.g.
     `A1 (Multiply by 3)`).
   - Empty-svgContent cards skipped.
   - Pre-merge state of Extras stashed to
     `_extrasPreMergeBackup_<ts>` for safety rollback.
   Followed by a cleanup snippet that removed the 2 stableless
   placeholder seeds `_createNamedSet` auto-injects into new sets.
   Final state: Extras has 191 cards, all with proper stableIds,
   no duplicates.

### Theme 3: Studio "+ New card set" UX polish

- **60b06df** — Placeholder count fixed. Was reading
  `.library-set-btn` DOM nodes (over-counted because Recent + folder
  sections double-render each set, gave "12's card set" for a user
  with 8 sets). Now reads `loadCardSets().length + 1` and runs an
  ordinal formatter (1st, 2nd, 3rd, 4th, … with 11th-13th carve-out).
- **680d87f** — `createNewCardSet` toggle bug: after navigating
  into the card maker and back, the first "+" click did nothing
  because the `_addSetMode` module flag was stale-true while
  `.new-set-input` had been wiped by rebuilds. Fixed by reading
  live DOM as the source of truth (`document.querySelector
  ('.new-set-input')` presence) instead of the flag.
- **8da7aea** — Safe Haven excluded from the new-set ordinal count
  via the `isSafeHaven` flag (set at line 7201 when Safe Haven is
  first created).
- **5c8715d / 0d1dbfb** — Defensive self-heal: every "+" click
  removes orphan `.library-set-copy-btn` nodes before adding a fresh
  row, so Copy buttons can no longer pile up if some prior state was
  incomplete. Also tightened `insertBefore` to verify
  `preview.parentNode === col`; falls back to `appendChild`. Added
  two diagnostic console.logs during debugging, then removed once
  the user confirmed the flow worked.

### Theme 4: In-card element copy/paste in the loupe (7343c4f)

New feature. Previously the loupe (card editor) let you select /
move / transform (rotate, reflect in place) / delete an element on
a card, but had no way to duplicate it. User has to drop two text
elements by hand to make "5 5".

- New module-level `_loupeElementClipboard` holds cloned SVG nodes
  across loupe sessions (copy on card A, paste on card B works).
- `loupeCopyElement` clones `getAllSelectedElements`, strips
  selection markers, enables Paste button.
- `loupePasteElement` clones from clipboard, strips ids, applies
  +5,+5 SVG-unit offset on x/y/cx/cy (with transform-translate
  fallback for paths/groups/use), appends to loupe SVG, pushes onto
  `drawHistory` via the legacy-element pattern. Multi-element pastes
  coalesce into one undo entry via `_coalesceLoupeHistory`.
- New Copy / Paste buttons next to Delete in `#draw-tools-panel`.
  Copy mirrors Delete visibility (only shown when selection exists);
  Paste always visible but starts disabled and unlocks on first
  copy.
- Cmd+C / Cmd+V / Cmd+D keyboard shortcuts registered in capture
  phase so they beat the existing card-list-level shortcuts at line
  8061 when the loupe is open — loupe takes precedence.

### Commits this session (chronological)

- `b649e4d` GP setup: stack levels vertically with labels to the right
- `e1104c3` docs: correct push-rule note — three branches, not two
- `9ec49ad` GP setup: drop "Choose the icon" / "Type your name" labels
- `0e4f748` GP setup: drop trailing ":" after the Type-of-Game axis label
- `8c0b20e` GP setup: center "Game level" title above the icon column only
- `052536e` GP setup: match level-icon outline to game-type box outline
- `90783d9` fix: stop JS restore paths from clobbering .game-level-select grid
- `7ebf2d5` fix: stop wrapper-restore loop from clobbering display: contents
- `b0505dc` bump cache-buster on style.css + game.js — level grid fix wasn't reaching browsers
- `7e40dc9` docs: spell out cache-buster requirement in STATUS_NOTES
- `6bd2268` GP setup: levels picker now matches Game Type box-row column
- `210d271` studio: _doCopySet regenerates stableId on every copied card
- `7343c4f` studio: in-card element-level copy/paste in the loupe editor
- `60b06df` studio: fix new-set placeholder count + ordinal grammar
- `680d87f` studio: createNewCardSet uses DOM state, not stale _addSetMode flag
- `8da7aea` studio: exclude Safe Haven from new-set ordinal count
- `5c8715d` studio: self-heal stale Copy buttons + add diagnostic log to createNewCardSet
- `0d1dbfb` studio: drop the createNewCardSet diagnostic console.logs

## May 9, 2026 — GP intro mode popups + GP setup polish

Player-facing setup-flow polish session. Find games now get a TOUCH /
MOUSE popup like Catch (with two follow-ups to make outside-clicks
actually close it). On the GP Setup page itself: dropped the legacy
"Player Options" heading default + the "Type N — " radio prefix, and
replaced the static-text 1-Player-Option button with name/icon inputs
+ Start rendered directly inline. One Studio-side fix landed too —
the Find Game Creator's "Show Dominos" preview now honors per-card
red/green placement via a new `_pickRepForHalf` helper.

Master is intentionally behind: the Anthropic git proxy 403s pushes
to master from the sandbox, so the safety net is three identical
branches. `claude/review-project-docs-JOOeh` is the deploy source;
`claude/general-session-yVBQq` is the mirror; both are at `5c32d42`.

### Commits (chronological, this session)

- `a080804` Find Game Creator: Show Dominos honors red/green placement
- `143a5ba` GP intro: Find games get a TOUCH/MOUSE popup like Catch
- `23d35d7` GP intro: mode popups close on click outside
- `d4035ec` GP intro: mode popups close on any click outside the action buttons
- `570f9d8` GP setup: drop 'Player Options' default heading + 'Type N —' prefix
- `5c32d42` GP setup: inline name/icon + Start when 1 Player Option enabled

### What ships in the live Player

- Find tile click on the GP intro screen anchors a TOUCH / MOUSE
  popup (Catch already had one). Mode picks store in
  `window._findInputMode` and select the corresponding Game
  Settings tab via `_applyGameSetupToPlayerScreen`. Outside-click
  on the popup chrome closes; only TOUCH / MOUSE buttons keep it
  open.
- Brand-new games render no Players heading by default
  (`mkPlayersAxis` axisLabel is `''`). Existing games whose stored
  `axisLabel === 'Player Options'` (the literal old default) get
  swept to `''` on next load by the `_getGameSetup` migration.
  Admin-customized headings survive untouched.
- The Type radio buttons (≥2-enabled branch of `_renderTypesPicker`)
  now show only the admin's text — no more "Type 1 — Slow Pace"
  prefix. Empty admin label falls back to a plain `Type N`
  placeholder (no em dash).
- When admin enables exactly one Player Option, the GP Setup page
  no longer surfaces the static-text player button at all. The
  name/icon inputs + Start button render directly inline on the
  setup page (see `Game.renderInlinePlayerNames`). Levels and
  Types pickers above stay visible so the player can still pick
  those before tapping Start. Re-renders are idempotent — typed
  names survive input-mode switches and Game Settings saves.
- Find Game Creator's "Show Dominos" preview now picks
  representatives that match each card's `_freezeState` polarity
  (when `freezeEnabled` is on), so the preview matches what the
  Player will actually render at gameplay time.

### Operational

- **Three branches must stay identical:**
  `claude/review-project-docs-JOOeh` (deploy source),
  `claude/general-session-yVBQq` (mirror), and
  `claude/resume-vica-domin-UOJun` (per-session). Through 5c32d42
  I was only pushing to the first two; the user caught it on the
  level-stack commit and asked for a back-fill. Push sequence
  after each commit:
      git push -u origin claude/review-project-docs-JOOeh
      git push    origin claude/review-project-docs-JOOeh:claude/general-session-yVBQq
      git push    origin claude/review-project-docs-JOOeh:claude/resume-vica-domin-UOJun
- Master is intentionally behind — the proxy 403s master pushes
  from the sandbox, the user keeps the three identical branches
  as the safety net, and stop-hook complaints about master are
  intentional and to be ignored.
- Develop directly on `review-project-docs-JOOeh`. Don't switch
  to the per-session branch as the working branch — keep it as a
  third mirror.
- All five trial-banner instances bumped to `TRIAL 08:19 PM PDT`
  on 5c32d42.

### Heads-up for tomorrow

- `Game.renderInlinePlayerNames` duplicates ~150 lines from
  `selectPlayerCount`. If we touch the input-building shape again
  (icon size, placeholder rules, Xeno row layout), refactor both
  into a shared `_buildPlayerInputRows` helper rather than letting
  the duplication drift.
- pm-studio-DrV.html's `#start-screen` still uses three hardcoded
  non-catalog player buttons (no `data-id`) and doesn't run
  `_applyGameSetupToPlayerScreen`. If Studio's "preview play"
  ever needs to honor the admin matrix, we'd port the function
  (or its core) into pm-studio-DrV.html too.
- The find-mode popup currently records intent but doesn't change
  Find gameplay behavior. Future per-mode Find behavior should
  key off `window._findInputMode`.

---

## May 5, 2026 — Catch round-trip + cards-library overlay + bump-trial

Closed the Studio→Player loop for Catch: the Match-0-4 board was
rendering 4×6 / 2×14 stragglers from Multiply-by-4 because the only
Catch path still using stale `svgMarkup` snapshots was the live
gameplay renderer. Mirrored Studio's `stableId → live storage`
resolution into the Player. Plus a per-game eye button on the GP
intro screen that gives the user a verification surface, the
freeze/float semantics wired correctly, the × close button replaced
with a real pause, Copy Game added to the Catch Game Creator, the
Player Setup level box now reflects admin's choices, and the trial
banner is now stamped automatically by a pre-commit hook reading the
system clock so it always matches actual deploy time.

Stable triple-push throughout: `master` + `claude/general-session-yVBQq`
+ `claude/review-project-docs-JOOeh`, all at `cc9d0ef` on real GitHub.

### Commits (chronological, this session)

- `03deb40` Catch player: fill level-button bubbles with MPP card pictures
- `5b9b980` Merge claude/catch-bubble-pictograms-fix into master
- `c44c134` GP intro: per-game eye button opens cards-library overlay
- `a50578f` Auto-bump trial banner via scripts/bump-trial.sh
- `dc69dfe` Cards library: show empty cards as blank tiles, not as their label
- `5d1cf04` Catch player runtime: resolve cards by stableId, not snapshot
- `fe462a3` Cards-library overlay: rows by value, M-badges in-row (match Studio)
- `18e1bd1` Cards-library: M-group as border color, drop badges
- `989ad1c` Cards-library: left-edge dot-line for freeze/float per card
- `224e4f6` Catch player: undo wrong freeze-spawn behavior
- `d5dc91c` Catch player: honor _freezeState — frozen=static-only, floating=fall-only
- `69a59cc` Catch: replace × with ⏸ pause; tap-to-continue starts a fresh round
- `836372f` Catch 2P: drop redundant middle-column pause button
- `a21e198` Catch: hide Find pause button while a Catch overlay is open
- `2c5845d` Catch Game Creator: add Copy Game button, mirror Find behavior
- `cc9d0ef` GP setup: hide level box when 0 enabled; warn on reduced choices

### What ships in the live Player

- **Eye button** on every game tile in the intro screen → modal
  with rows-by-value, mGroup-colored borders, left-edge red/green
  dotted strip for freeze/float, blank tiles for intentionally
  empty cards. The visible cards are exactly what GP picks at
  runtime.
- **Catch ⏸ pause** in the round HUD. Click → freeze-in-place +
  "Tap anywhere to continue with a new task" overlay. Resume wipes
  current falling cards and starts a fresh round (lives / score /
  round counter preserved).
- **Find pause button suppressed** during Catch via
  `body.catch-active`, so 1P never sees two pause buttons.
- **Frozen / Floating** behave per spec: frozen cards are eligible
  only as the LEFT static target, floating only as falling tiles,
  unmarked cards play either role.
- **Catch Game Creator Copy Game** button next to Delete Game,
  same UX as Find's. Carries every Catch field including
  `_freezeState`, `mGroups`, `freezeEnabled`, `mainPageDominos`,
  `setup`, shape overrides; drops `sourceName` lineage.
- **Player Setup level box** hides entirely when admin disables
  all levels; auto-selects first visible when admin disables the
  default-selected one. Save shows "You reduced the number of
  choices…" alert when an axis lost enabled options.

### Operational

- **Cache-buster query strings (`?v=…`) on `<link>` and `<script>`
  tags are mandatory for any CSS/JS change that affects rendered
  output.** Without bumping them, browsers serve stale cached
  copies and your fix never reaches the user — wasted today on
  `90783d9` + `7ebf2d5` (level-grid JS restore-path fixes that
  weren't visible until `b0505dc` bumped `css/style.css?v=…` and
  `js/game.js?v=…`). Standard pattern: bump on every meaningful
  CSS/JS edit; pick a short tag tied to the change so the diff
  reads. Files that carry version params (audit with
  `grep -nE '\?v=' index.html pm-studio-DrV.html`):
      css/style.css            (in both HTML files)
      js/firebase-config.js    (in both)
      js/sync.js               (in both)
      js/domino.js             (in both)
      js/voice.js              (in both)
      js/game.js               (in both)
- `scripts/bump-trial.sh` writes the current PDT time into all 5
  banner occurrences. `.githooks/pre-commit` calls it on every
  commit that touches `index.html` or `pm-studio-DrV.html`, then
  re-stages. Activate per clone:
  `git config core.hooksPath .githooks`.
- The temp diagnostic alert from `153230f` (`CATCH LAUNCH
  DIAGNOSTIC` in `pm-studio-DrV.html:16541-16553`) is still in
  place — its commit message tagged it for removal once Match-0-4
  was verified. With the chain now consistent, it can be dropped
  in the next session.

### Heads-up

Existing Catch games whose `levels` axis is at the legacy
all-off-with-blank-labels default will hide the level box on the
Player Setup page until admin enables specific levels in Game
Settings → Levels. No automatic migration shipped because games
where the admin had legitimately disabled all levels would
otherwise be silently re-enabled.

---

## May 1, 2026 — Sand-timer (hourglass) for non-stop games

A new soft-pause for non-stop rounds with no Xeno timer: if neither
player taps / speaks for the admin-configured duration, the game
auto-pauses with a kid-friendly "Are you still there?" overlay.

- **Admin**: Game Settings → "Sand-timer (s):" row (default 60, 0
  disables). Stored at `game.setup.sandTimer` peer of the existing
  `timer` field.
- **Visible**: small white-frame hourglass (top-right, below the
  timer panel) that drains from full to empty over `sandTimer` seconds.
  Hidden unless `body.sand-timer-active`.
- **Resets on**: any pointerdown / keydown / voice phrase (capture-phase
  listener on `#game-screen`) — kid pokes the screen, sand resets.
- **Expires**: triggers `_pauseGame('sand')` which reuses the existing
  pause overlay. Title swaps to "Are you still there?" while the
  manual pause keeps "Game paused". Sub-text is "Tap anywhere to
  continue" in both cases.
- **Resume from sand-pause**: restarts sand-timer from full
  (per design — fresh restart, not a continue-from-partial).
- **Manual pause during sand-timer**: sand-timer suspends; on resume
  it restarts from full.

**Files touched**:
- `pm-studio-DrV.html`: new `gs-sand-timer` admin row, default 60 in
  `_defaultGameSetup`, schema repair in `_getGameSetup`, capture/render
  plumbing in `_gsCaptureForm` / `_gsRenderForm`. Hourglass markup +
  overlay title/sub IDs in the game screen.
- `index.html`: hourglass markup + overlay IDs; apply-setup writes
  `window._currentGameSetupSandTimer`.
- `css/style.css`: `.game-sand-timer` + `.sand-hourglass` with
  CSS-variable-driven scaleY transforms; gated by
  `body.sand-timer-active`.
- `js/game.js`: `_startSandTimer / _stopSandTimer / _resetSandTimer
  / _shouldRunSandTimer / _sandSetProgress` near `_resumeGame`;
  start hook in `startSunLevelGame`; reset hook in `_onVoicePhrase`;
  navigate-away hook in `_cleanupVoiceUI`; pause-reason text swap
  and `_sandWasRunning` save/restore in `_pauseGame`/`_resumeGame`.
  Tick auto-stops if `gamePhase !== 'sunLevel'` to handle round-end
  cleanly.

---

## Project Overview

**Vica Domino** is an educational math game built as a single-page web app under the **Pinky Math Gaming** brand. The primary game is **"Find the Double"** — a domino-based game where players must identify the double card from a dealt hand before time runs out. It supports 1-2 human players plus an optional AI opponent ("Xeno"), custom card creation, and multi-stage game progression.

### Tech Stack
- **Pure HTML/CSS/JavaScript** — no frameworks or build tools
- **SVG-based** card and icon rendering
- **localStorage** for persistence (games, cards, variations, arrangements)
- **Single `index.html`** with inline scripts + external `game.js` and `domino.js`

### File Structure (current)
```
Vica_Domino/
├── index.html          (7,328 lines) - Main UI + inline Card Maker/Library/Game Maker scripts
├── js/
│   ├── game.js         (3,614 lines) - VicaDominoGame class, all gameplay logic
│   └── domino.js       (185 lines)   - Card definitions, utility functions
├── css/
│   └── style.css       (4,737 lines) - All styling, animations, responsive layouts
├── audio/
│   └── select-double.mp3             - Voice instruction audio
├── docs/
│   ├── MEMORY.md                     - Quick-reference project memory
│   ├── project-details.md            - Detailed architecture docs (written Feb 14)
│   └── STATUS_NOTES.md               - This file
└── README.md                         - Project description
```

---

## What Has Been Done (Complete Feature List)

### Core Game Engine
- [x] **Sun Level "Find the Double"** — primary game mode with 3 difficulty levels:
  - Circle/Sun = 2 cards, Triangle/Alien = 3 cards, Star/Sunflower = 4 cards
- [x] **Classic Domino Mode** — traditional domino gameplay with board placement
- [x] **1-2 player support** with player name/icon selection
- [x] **Xeno AI opponent** (pink alien) with simple strategy
- [x] **Adaptive Xeno Timer** — starts at 20s, adjusts based on wins/losses
- [x] **Keyboard controls** — number keys 1-4 (P1) and 7-0 (P2) for card selection
- [x] **W/P keyboard shortcuts** for Play Again / New Game
- [x] **Tie detection** (within 500ms window for 2-player)
- [x] **Anti-repetition system** — prevents same doubles/positions repeating
- [x] **Multi-press detection** — buffered clicks per player (150ms), multi-press = wrong
- [x] **Wrong answer feedback** — shake animation, coin deduction, "Try again"
- [x] **Winning animation** — domino slides up with scale bounce, others slide down

### Tutorial System (1-Player)
- [x] **Progressive tutorial finger** — shows pointing animation, hides after 3 wins
- [x] **"Double" label** — blinking label above the double card for beginners
- [x] **Voice instruction** — "Select a double" audio plays on first game
- [x] **Floating number keys** — key hint labels above dominos
- [x] **Keyboard popup** — miniature SVG keyboard appears on hover/click
- [x] **Progressive disclosure** — tutorial elements hide as player gains experience

### Multiplayer Tutorial
- [x] **Hover keyboard popup** for multiplayer
- [x] **"Press to select" labels** — shown for Win0/Win1, hidden from Win2 onward
- [x] **Number labels under dominos** — hidden from Win2 onward

### Card System
- [x] **Numbers & Dots set** — 5 values (A-E) with 6 representations each (A1-A6, etc.)
- [x] **ABC Card Set** — 25 letter cards (A-Y) with 5 values × 5 representations
- [x] **Picture icons for ABC** — Ant, Brain, Cat, Dog, Egg animal icons
- [x] **Custom card creation** — SVG-based draw tools
- [x] **Card variations** — multiple visual representations per card value
- [x] **Duplicate variation detection** — pixel-based comparison
- [x] **Variation editing in loupe** — double-click variation cards to edit in loupe with inverse transform coordinate conversion
- [x] **Card deletion** — single-click shows delete cross, separate deletion tracking for ABC
- [x] **Predefined library cards** for numbers 7-10 with optical corrections

### Card Maker (Editor)
- [x] **Draw tools** — pencil, eraser, shapes with snap-to-grid
- [x] **Text tool (T button)** with font selector and text submenu
- [x] **Stamps palette** — Sun, Alien, Sunflower + ABC animal icons (Ant, Brain, Cat, Dog, Egg)
- [x] **Stamp resizing** — via radius slider, max = full card size
- [x] **Aa and r sliders** — unified sizing controls (Aa 0-90, r 0-10)
- [x] **Color palette** — in variation box and Loupe editor toolbox
- [x] **Reflect/Rotate** — click-to-pin and transform in place
- [x] **Loupe mode** — magnified card inspection with grid overlay
- [x] **Magnifier/zoom** — +, -, ++ controls
- [x] **Select/move/edit/delete** for card symbols in draw mode
- [x] **New Card (+) button** — shows letter labels for rows
- [x] **Copy button on cards** — duplicate card designs
- [x] **Drag-to-move between rows** — reorganize card assignments
- [x] **Within-row card reordering** via drag-and-drop
- [x] **Card row persistence** — assignments and arrangement saved across reloads
- [x] **Insert SVG from file** — import external SVG files as stamps
- [x] **Over-scale slider (×1–×10)** — scale imported SVGs beyond card boundaries
- [ ] **Crop/pan tool** — reposition oversized imported SVGs within card area (partially working, has drag handler conflicts)
- [x] **Save/cancel prompt** when leaving Card Maker
- [x] **Separate storage** for Numbers and ABC card sets
- [x] **Double-click to edit** cards in Card Maker
- [x] **Variation box** — shown only when clicking "v" button on card corner

### Game Maker
- [x] **Create custom games** — select cards, name games, manage domino pairs
- [x] **Edit/delete games** — full game management
- [x] **Copy game** — duplicate with name prompt
- [x] **Per-game variation exclusions** — different variations per game
- [x] **Domino pair generation** — all card-to-card pairs (cross-value + doubles)
- [x] **Individual domino exclusion** — exclude specific pairs from gameplay
- [x] **UP/DOWN flip mode** per game
- [x] **Game View** — show dominos with card editing, click title/description to edit

### Library System
- [x] **Two-column layout** — Card Sets and Games side by side
- [x] **Card set browsing** — Numbers & Dots and ABC sets
- [x] **All 25 ABC cards** shown in Library preview
- [x] **Inline card previews** — merged Library into single page
- [x] **Dim games** that don't belong to selected card set
- [x] **Custom game buttons** on start screen launch playable games
- [x] ~~**Auto-generate ABC game** from card library on first load~~ (removed March 4 — ABC game no longer auto-recreated after deletion)

### Main Page Pictures (MPP) Editor
- [x] **Custom domino level previews** — assign card images to level buttons
- [x] **Floating draggable panel** — click-to-assign interface
- [x] **Level icon system** — SVG markup stored in game data
- [x] **Unique domino pairs** with different halves in previews
- [x] **Filter out empty cards** from level previews

### Introductory Page
- [x] **Game selection page** before main setup screen
- [x] **Create and Edit** accessible from intro page
- [x] **Combined game loading** from intro page

### Economy & Progression
- [x] **Coin/Gem system** — win = +2 coins, wrong = -1 coin, 5 coins = 1 gem
- [x] **Gold coin visuals** with stacking animation
- [x] **Vertical coin columns** — coins displayed to left of dominos
- [x] **Stage stones** — progression indicator in header
- [x] **Combined Games** — chain multiple games into stages
- [x] **Stage transition** with "Level Up!" overlay
- [x] **Final celebration** with confetti canvas animation

### UI/UX Polish
- [x] **Domino icons** — dot patterns with game image face replacement
- [x] **Winner boxes** — personalized text, side-by-side layout
- [x] **Timer ripple rings** — multi-colored on timer expiry
- [x] **Finger push animation** when pressing number keys
- [x] **Sad wah-wah sound** on 1-player loss
- [x] **Responsive design** — iPad landscape/portrait, tablet, Android
- [x] **Right-click disabled** during gameplay
- [x] **Back button navigation** on all screens

### Bug Fixes (Major ones resolved)
- [x] Card corruption from drag/order persistence — fixed with unified cardArrangement
- [x] ABC cards reappearing after deletion — fixed with separate deletedCards_abc key
- [x] Cards disappearing from Game View — fixed with svgMarkup fallback
- [x] Custom cards not appearing in Numbers set — fixed with cardSet property
- [x] Color palette not persisting on ABC cards
- [x] Card sets mixing in Card Maker
- [x] ABC game showing wrong cards (numbers/dots instead of letters)
- [x] Text editing requiring multiple Enter presses / hanging
- [x] Combined game loading wrong content from intro page
- [x] Dominos disappearing when timer expires
- [x] Duplicate ID `draw-btn` causing conflicts
- [x] `const` redeclaration SyntaxError freezing everything
- [x] Dominos disappearing on second 2-player game
- [x] Xeno timer overlapping game board
- [x] Custom ABC cards beyond row E (F, G, ...) disappearing on reload
- [x] Symbol toggle swapping math operators along with numerals
- [x] Variations disappearing on reload for ABC and custom card sets
- [x] Built-in Numbers and Dots cards accidentally removed and restored
- [x] Custom card set data wiped when previewing in Library
- [x] Game-view × delete didn't visually remove the card (typo: `openCustomGameView` → `openGameView`)
- [x] Copying a card in Catch view created a square tile and wasn't persisted to `savedCatchGames`
- [x] Deleting one of two same-labeled copies removed both (label-only fallback fired because tile dataset lacked `stableId`)
- [x] GP rendered stale math-expression SVGs for cards edited in Card Maker after add (now resolves freshest svgContent by `stableId`)
- [x] GP domino count and pairings differed from Studio (GP now honors `mGroups`)
- [x] GP intro buttons could load the wrong game when localStorage changed in another tab (`populateIntroGames` re-runs on home click)
- [x] Cmd+Z / Ctrl+Z covers game-view edits (delete, copy, shape, M-card group) in both Find and Catch — re-renders the open game view after applying snapshot
- [x] "Add Cards to Game" — set-blind label match no longer hides cross-set cards (label match now scoped by `(label, cardSet)`)
- [x] `getCardsFromStorage` — custom set named "ABC" no longer aliases to the built-in `customDrawnCards_abc` key
- [x] **Non-stop Type of Game (Find)** — admin sets behavior per Type option in Game Settings; player picks Type on level-pick screen; round-end auto-restarts after a 3 s countdown unless user taps the button (skip-ahead) or stays idle for 60 s. `visibilitychange` pauses the countdown when the tab is hidden.
- [x] **Non-stop Type of Game (Catch)** — Type picker rendered as a vertical radio list in the right column of GP Cm/Ct Setup, replacing the "Choose domino style" panel when the active Catch game has 1+ Type options. `_catchGameOver` honors `_currentTypeBehavior` with the same 3 s countdown / idle-cancel / visibility-pause behavior as Find.
- [x] **Find Type picker unified with Catch** — `_renderTypesPicker` no longer branches by game type; both Find and Catch render the same right-column radio list ("Choose the game type:") and hide the domino-style SVGs. Legacy top-of-panel `#setup-types-row` left in DOM but always hidden.
- [x] **Type axis mirrors across touch+mouse on save** — `_gsCaptureForm` now copies the captured types axis to the other mode immediately, so admin can edit either tab and the player picker shows up regardless of input mode.
- [x] **"🚧 Under construction" badge removed** from the Type axis section in Game Settings — picker exists, runtime honors behavior, badge claim was stale.
- [x] **Voice input v1 (Find, 1-player, EN/ES/RU)** — admin enables `voiceInput` per Type option in Game Settings (🎤 checkbox + language dropdown). New stand-alone `js/voice.js` (Web Speech API wrapper, continuous + interim, Safari auto-restart, per-language synonym tables). Player rounds with voice on listen continuously; saying "the first / second / third / fourth" routes through `handleSunLevelCardClick` exactly like a tap. Corner mic indicator pulses red while listening, toast on browser-unsupported / permission-denied. Decoupled audio-source layer so 2-player extension only swaps the source, not the routing.
- [x] **Voice v1.1 — per-Type editable synonym tables.** New `option.voiceSynonyms` field. Game Settings option-row gains a `✎ words` button that opens an inline 3-column EN/ES/RU editor: 4 rows per language (1st/2nd/3rd/4th positions), comma-separated text inputs, "↺" reset-to-defaults per language. Admin authority is total — empty list = no trigger for that position. Matcher in `js/voice.js` extended with substring match for multi-word entries (e.g., "the first") plus the existing token match for single-word entries. `voiceSynonyms` defaults to `null` = use built-in `VoiceInput.DEFAULT_SYNONYMS`; rollback to v1 (commit `3f2d799`) is a clean `git revert` since the field is additive.
- [x] **Voice diagnostic indicator** — corner mic shows `listening (en-US)`, `hearing: <transcript>`, `end → restart`, `err: <code>` so the user can diagnose silent failures without DevTools. Bottom line shows the matched/unmatched transcript with a `?` prefix when no synonym matched.
- [x] **Mic-check panel** — accessible from a "🔧 Test mic" button on GP Setup (only visible when the selected type has voice on) or from tapping the corner mic indicator. Shows browser permission state via `navigator.permissions.query({ name: 'microphone' })`, names the active default mic, lists all mic devices with the system default flagged, and runs a live audio level meter. Click any non-default device to preview its level (only changes the meter, not what the speech engine listens to).
- [x] **Voice recognizer lifecycle race** — round 1's `onend` could fire async during round 2's startup, overriding the new listening indicator and attempting to auto-restart the dead recognizer alongside the new one. Fixed by adding `_isCurrent()` guards on every event handler in `_make()` and making `start()` always recreate the recognizer instead of reusing it across rounds. User verified 4 rounds clean.
- [x] **Voice UX polish** — `continuous: false` (avoids the "first first" transcript-batching that made the first attempt feel unresponsive); mic indicator removed entirely between non-voice rounds; "Test mic" button visibility now tracks the live type selection rather than "any enabled type has voice".
- [x] **Mic-check panel shows the active synonym table** — when an admin adds a custom word in the per-Type editor, the player can open the mic-check panel and verify whether that word actually reached the runtime. Annotates "custom (from Game Settings)" or "default (no per-Type override)". Useful for catching the common gotcha of editing the inline editor but closing Game Settings without clicking its main Save.
- [x] **Voice indicator leak fixed** — listening box was carrying over into the GP setup screen after returning from a voice round. Fixed across four commits: cleanup on Home / Back-to-intro / Catch-overlay-home navigation; cleanup on every setup screen render; CSS-level visibility gated on `body.voice-round-active`; cleanup on every type-line click. Tapping any type now immediately wipes the indicator; it only reappears when a real voice round actually starts.
- [x] **Pause / Resume v1** — kid-friendly mid-round freeze for 6-8 year olds who suddenly need to step away. Pause button bottom-right of the game screen during any active round (all game types — not gated on non-stop). Tap → frozen overlay covers everything; tap overlay anywhere to resume. Freezes the Xeno timer (resumes from the same remaining seconds), the voice recognizer, and CSS animations under #game-screen. Strict input blocking — sibling pokes at dominos do nothing while paused. Tab-hidden auto-pauses; on return stays paused (kid taps to resume). Pause stays visible through the post-win celebration so the kid can cancel a non-stop auto-restart. In-session only for v1; future upgrade to persist across reloads once player names / scores are stored.
- [x] **Round properly stops on navigate-away** — Home / Back-to-intro / Catch-overlay-home no longer leaves the timer ticking in the background. `_cleanupVoiceUI` clears `sunLevelTimer`, `playAreaDimTimeout`, and marks `gamePhase = 'navigatedAway'` so escaped callbacks early-return. No more loss sounds from the intro page after the kid quit a round mid-game.
- [x] **Pause / Resume v1** — kid-friendly mid-round freeze for 6-8 year olds who suddenly need to step away. Pause button top-right of the game screen during any active round (all game types — not gated on non-stop). Tap → frozen overlay covers everything; tap overlay anywhere to resume. Freezes the Xeno timer (resumes from the same remaining seconds), the voice recognizer, and CSS animations under #game-screen. Strict input blocking — sibling pokes at dominos do nothing while paused. Tab-hidden auto-pauses; on return stays paused (kid taps to resume). In-session only for v1; future upgrade to persist across reloads once player names / scores are stored.

---

## What Still Needs To Be Done

### Known Issues / Incomplete Areas

1. **Code Organization**
   - `index.html` is 7,328 lines with significant inline JavaScript — should be extracted into separate JS modules
   - `css/style.css` at 4,737 lines could be split into component-specific files
   - `game.js` at 3,614 lines handles too many concerns (game logic, UI, animations, timer, tutorial)
   - No build system, bundler, or minification

2. **Testing**
   - No automated tests exist (no unit tests, integration tests, or E2E tests)
   - All testing has been manual

3. **ABC Card Set**
   - Only 5 picture icons implemented (Ant, Brain, Cat, Dog, Egg) for letters A-E
   - Remaining 20 letters (F-Y) need picture icons
   - Card designs for letters F-Y are basic/default

4. **Classic Domino Mode**
   - Less polished compared to Sun Level "Find the Double" mode
   - Most recent development focused on Sun Level; classic mode may have edge cases

5. **Mobile/Touch**
   - Responsive layouts exist but may need further testing on actual devices
   - Touch interactions (drag-and-drop for card reordering) may not work smoothly on all touch devices

6. **Accessibility**
   - No ARIA labels or screen reader support
   - No high-contrast mode
   - Color-dependent game elements with no alternative indicators

7. **Audio**
   - Only one audio file (`select-double.mp3`)
   - Wah-wah disapproval sound is generated programmatically (Web Audio API)
   - Could add more audio feedback (win sounds, card click sounds, timer warnings)

8. **Performance**
   - Large single HTML file (6K+ lines) loaded all at once
   - localStorage used extensively — no cleanup/garbage collection of old data
   - No lazy loading of card sets or game data

9. **Multiplayer Enhancements**
   - No online/networked multiplayer — only local same-device
   - No score persistence across sessions
   - No leaderboard or player profiles

10. **Game Content**
    - Limited to "Find the Double" and Classic Domino modes
    - Combined Games feature exists but needs more game variety
    - Card sets limited to Numbers & Dots and ABC

11. **Documentation**
    - Existing docs (`MEMORY.md`, `project-details.md`) cover architecture but are from Feb 14
    - No user-facing documentation/help within the app
    - No in-app tutorial beyond the progressive finger animation

12. **Deployment**
    - No hosting/deployment pipeline
    - No PWA support (offline capability, installable)
    - No service worker for caching

13. **Recovery / undo gaps (deferred from April 26 session)**
    - `_undoStack` is in-memory only — page refresh wipes Cmd+Z history. Persisting it to localStorage was discussed (item "c") and deferred.
    - "Restore Cards from Cloud" only covers `customDrawnCards_*`, not `savedCustomGames` / `savedCatchGames`. A catch-game corruption can't be rolled back from cloud. Extending `_pushCardBackup` was discussed (item "d") and deferred.
    - Game-view mutations still NOT undoable: `confirmAddCards` (the + overlay), game rename / description, drag-reorder via `saveGameViewOrder`, combine games, clone-to-catch, delete entire game, copy game, plus ~22 direct `localStorage.setItem('savedCustomGames', …)` callers and ~10 direct `saveCatchGames(…)` callers. Audit-and-wire pass deferred. Easiest path: add the snapshot push inside `saveCatchGames` itself and a wrapper around savedCustomGames sets, then drop the per-call snapshots from `_saveCurrentViewGames` / `_removeCardFromThisGame`.

---

## Development Timeline Summary

### Phase 1: Core Game (Feb 1-3) — ~26 commits
Basic domino game, Sun Level, player setup, Xeno opponent, keyboard controls

### Phase 2: Polish & Adaptive Timer (Feb 4-6) — ~24 commits
Title changes, two-column layout, adaptive timer, back button, iPad layouts

### Phase 3: Card Library & Design (Feb 7-8) — ~87 commits (most active)
Domino library preview, extensive card design pixel adjustments, zoom/scale

### Phase 4: Card Maker & Game Maker (Feb 9-11) — ~36 commits
Card editing, variation system, Game Maker, custom games, flip mode

### Phase 5: Advanced Tooling (Feb 12-13) — ~22 commits
Magnifier/loupe, draw tools, symbol editing, GM popup improvements

### Phase 6: Economy & Combined Games (Feb 14) — ~5 commits
Coin/gem economy, combined games, gold coin visuals

### Phase 7: UI Overhaul & 1-Player Tutorial (Feb 15-18) — ~50 commits
Level display overhaul, domino icons redesign, 1-player tutorial system (finger, double label, voice, progressive disclosure), timer ripple effects, multiplayer tutorial, coin layout

### Phase 8: Level Icons & MPP Editor (Feb 18-19) — ~12 commits
Main Page Pictures editor, level icon system, domino previews on buttons

### Phase 9: Card Maker Enhancements (Feb 19-22) — ~30 commits
Draw tool reorganization (T/Stamps), color palette, stamp icons, Aa/r sliders, stamp resizing, ABC animal icons, introductory page, ABC game auto-generation, Library redesign

### Phase 10: Advanced Card Management (Feb 22-27) — ~30 commits
Card Maker UX (double-click edit, save/cancel, letter labels), separate ABC storage, reflect/rotate, drag-to-move, copy cards, row reordering, card arrangement persistence, card corruption fixes

---

## localStorage Keys Reference

| Key | Purpose |
|-----|---------|
| `savedCustomGames` | Array of custom game definitions |
| `customCards` | Custom card SVG data (Numbers set) |
| `customCards_abc` | Custom card SVG data (ABC set) |
| `deletedCards_abc` | Tracking deleted ABC cards |
| `cardArrangement` | Unified card row/order persistence |
| `cardVariations` | Card variation definitions |
| `combinedGameConfig` | Combined game stage configuration |
| `_singlePlayerWins` | Tutorial progression counter |

---

---

## March 4, 2026 Session — Card/Game Identity & Deletion Fixes

### Summary
Fixed a cluster of related bugs around game/card identity, cross-set confusion, and deletion not sticking. The root cause was that both card sets (ABC and Numbers & Dots) share the same label format (A1, B1, C1...), and several systems didn't distinguish between them.

### Changes Made (5 commits)

1. **Skip deleted cards when building game deck** (`startCustomGame`)
   - Cards removed from card sets but still stored in saved game data appeared during gameplay
   - Now cards are included only if they have stored `svgMarkup` OR exist in the card library DOM
   - Cards with neither (truly deleted, no fallback) are skipped
   - Key code: `index.html` lines ~5647-5650

2. **Scope `findCardByLabel` to the correct card set**
   - `findCardByLabel(label)` searched the entire DOM and returned the first match — wrong set if ABC appears before Numbers
   - Added optional `cardSet` parameter: `findCardByLabel(label, cardSet)`
   - When `cardSet` is `'ABC'`, searches only `#card-set-abc`; when `'Numbers and Dots'`, searches only `#card-set-numbers`; when omitted, searches everything (backward compatible)
   - Updated all callers that have `cardSet` info: `buildGameViewCard`, `getGameCardSVG`, `getGameVariationSVG`, `startCustomGame`, `buildGameViewVariations`, migration code
   - Callers without `cardSet` (variation restoration) still search all sets

3. **Removed hardcoded "Dots and Numbers" button from intro screen**
   - Line 18 had a hardcoded `<button>` that always showed regardless of user's games
   - Removed the button, the `selectIntroGame('dots-and-numbers')` highlight code, and the `goToMainPage()` branch for it
   - Intro screen now only shows dynamically populated games from `savedCustomGames` and `savedCombinedGames`

4. **Fixed ABC game cards not loading (plain letters instead of SVGs)**
   - The ABC card set DOM (`#card-set-abc`) is only populated when the user opens it in the card maker via `buildAbcCardSet()`
   - When starting a game, `findCardByLabel(label, 'ABC')` found nothing in the empty container
   - Original code skipped all cards → empty SVG map → dominos showed plain text fallback
   - Fixed: card inclusion now checks `hasMarkup || inDom` — cards with stored `svgMarkup` are included even if not in the DOM

5. **Stopped auto-recreating the ABC game on every page load**
   - `ensureAbcGameExists()` ran on every page load and re-created the ABC game if deleted
   - Replaced with `migrateAbcGameMarkup()` — a one-time migration that only backfills missing `svgMarkup` on an *existing* ABC game, never re-creates a deleted one

### Key Architecture Insights

- **Card identity is label + cardSet**: Labels like "A1" are NOT unique across the app. The `cardSet` property (`'ABC'` or `'Numbers and Dots'`) is required to disambiguate.
- **DOM vs stored data**: Card SVGs live in two places: (1) the card library DOM (built lazily per set), and (2) `svgMarkup` stored in `savedCustomGames`. Game loading must try DOM first, then fall back to stored markup.
- **Game data is a snapshot**: When a game is created, card data (including SVG markup) is copied into `savedCustomGames`. Deleting cards from a set doesn't automatically clean up game data — the game uses its stored copy as fallback.
- **ABC DOM is lazy**: `#card-set-abc` starts empty. `buildAbcCardSet()` populates it only when the user opens the ABC set in the card maker. Any code that needs ABC cards at startup must handle the empty-DOM case.

### Potential Follow-up Issues
- **Combined games referencing deleted games**: If a user deletes a game that's part of a combined game, the combined game still appears on the intro screen. `resolveStageGameIndex` looks up by name — if the game is gone, it returns -1 and `startCustomGame` silently fails. Could show a warning or auto-clean.
- **Orphaned localStorage keys**: When a game is deleted, `excludedDominos_N` and `excludedVariations_N` keys are removed for the deleted index, but indices shift — keys for games after the deleted one may become misaligned.
- **Custom card sets**: The `findCardByLabel` fix only handles `'ABC'` and `'Numbers and Dots'` containers. If custom card sets (stored in `#card-set-custom`) are used in games, they'd fall through to searching the full DOM.

## March 7, 2026 Session — Variation Toolbar Layout & Domino Display Improvements

### Summary
Two UI improvements: (1) reorganized the variation toolbar from a single row into a 2×4 grid, and (2) made non-double dominos in the Game View visually match the doubles' "joined pair" style using a copper outline.

### Changes Made (3 commits)

1. **Variation toolbar 2×4 layout** (`index.html`, `css/style.css`)
   - The variation toolbar had 8 buttons in a single horizontal row (4 reflections, 3 rotations, 1 symbol toggle) separated by `<div class="var-tool-sep">` dividers
   - Reorganized into two rows of 4 buttons each using `<div class="var-tool-row">` wrappers:
     - **Top row**: 4 reflection buttons (vertical, horizontal, diagonal \, diagonal /)
     - **Bottom row**: 3 rotation buttons (90°, 180°, 270°) + symbol toggle button
   - Removed the `<div class="var-tool-sep">` separators (rows provide visual grouping now)
   - CSS: `.variation-toolbar` changed from `flex-direction: row` to `flex-direction: column`
   - CSS: Added `.var-tool-row` class (`display: flex; flex-direction: row; gap: 4px`)
   - Also changed all SVG icon colors from hardcoded `#2255aa` to `currentColor` so icons inherit CSS color consistently (including the symbol toggle button which previously had a mismatched color)
   - Symbol toggle SVG size normalized from `width="22" height="22"` to `width="20" height="20"` to match other buttons
   - Key locations: `index.html` lines ~343-370, `css/style.css` lines ~623-641

2. **Copper outline for non-double dominos in Game View** (`css/style.css`)
   - In the Game View domino display, doubles had a gold `box-shadow: 0 0 0 2px #FFD700` outline making them look like joined domino pairs
   - Non-doubles had no outline, making the two card halves look disconnected ("too big distance, no distinct line")
   - Added `.game-view-domino:not(.double-domino) .game-view-domino-half { box-shadow: 0 0 0 2px #CD7F32; }` — a copper outline
   - Now all domino pairs look visually joined: **gold (#FFD700) for doubles, copper (#CD7F32) for non-doubles**
   - Key location: `css/style.css` lines ~1828-1835

3. **Symbol toggle button implemented** (`index.html`)
   - The symbol toggle button (bottom-right in V toolbar, shows "1↔2" icon) was disabled (`var-tool-disabled` class, `pointer-events:none`) and non-functional
   - Removed disabled state so button matches styling of other toolbar buttons
   - Implemented `applySymbolToggle()`: finds all placed elements (text, circles, stamps, etc.) in the card SVG and rotates their positions — element 0 moves to element 1's position, element 1 to element 2's, etc.
   - Helper functions: `getElementPosition()`, `setElementPosition()`, `collectCardElements()` handle different SVG element types (text x/y, circle cx/cy, rect x/y+size, group translate)
   - `collectCardElements()` unwraps one level of `<g>` wrapper (from previous variation transforms) to find the actual placed elements
   - The toggle silently does nothing if a card has fewer than 2 elements
   - Creates a proper variation (with duplicate detection) just like reflection/rotation tools
   - Key location: `index.html` — `createVariationSVG` and new helper functions after it

### Design Decisions
- **Copper vs gold distinction**: User requested a different color for non-doubles to distinguish them from doubles while still looking like proper dominos. Copper (#CD7F32) was chosen as a warm, complementary tone to gold.
- **`currentColor` for SVG icons**: Rather than hardcoding `#2255aa` in every SVG element, using `currentColor` means the icons automatically pick up whatever `color` property is set on the button via CSS. This makes future theming/color changes easier.
- **No separator divs needed**: With two rows, the spatial grouping is self-evident. The old `<div class="var-tool-sep">` vertical lines were removed as unnecessary.

### File Sizes After Changes
- `index.html`: ~6,946 lines (was ~6,938)
- `css/style.css`: ~4,731 lines (was ~4,726)

---

## March 7-8, 2026 Session — Variation Editing, Card Fixes, Library Safeguards

### Summary
Major enhancements to the variation system (loupe editing, persistence fixes), restoration of accidentally removed built-in cards, symbol toggle refinement, and a critical fix for custom card data being wiped during Library preview.

### Changes Made (9 commits)

1. **Custom ABC cards beyond row E (F, G, ...) disappearing on reload** (`index.html`)
   - `buildAbcCardSet()` only created rows A-E, so custom cards in rows F+ had no target row during restoration and were silently skipped
   - Now creates new rows on demand for any letter
   - Also fixed the preview builder to show extra rows and widened the game label regex from `[A-E]` to `[A-Z]`

2. **Symbol toggle refined to skip operators** (`index.html`)
   - `applySymbolToggle()` was rotating positions of ALL elements including math operators (+, -, ×, ÷, =)
   - Now filters out operators and only swaps positions of numerals/letters/symbols
   - Operators stay in their original position when toggling

3. **Variations disappearing on reload for ABC and custom card sets** (`index.html`)
   - `saveVariations()` now stores which `cardSet` each variation belongs to
   - `loadVariations()` defers ABC/custom set variations until those sets are lazily built
   - Includes backward compatibility for old saved data without the `cardSet` field

4. **Variation cards editable in the loupe** (`index.html`)
   - Double-click a variation card to open it in the loupe editor
   - Variation transform `<g>` marked with `data-variation-transform` attribute
   - Inverse transform matrix computed for coordinate conversion (click, drag, selection ring positioning)
   - Arrow key directions transformed so visual movement matches keys inside rotated/reflected variations
   - New elements drawn in loupe are appended inside variation `<g>`
   - Single-click on variations shows copy button
   - Edited variation SVG content saved/loaded in localStorage

5. **Built-in Numbers and Dots cards restored** (`index.html`)
   - 45 built-in cards (rows A-I with numbers, digits, and dot patterns) were accidentally removed in a previous commit and restored
   - Empty cards filled with new designs: A3 (hollow oval), A4 (cursive "0"), A5 (dashed box), H4 (7-dot pattern 3+1+3), H5 (8-dot pattern 3+2+3)

6. **Built-in set deletion attempted and reverted** (`index.html`)
   - Briefly prevented deletion of built-in card sets (Numbers and Dots, ABC) by removing delete buttons
   - Reverted immediately to keep deletion available

7. **Custom card set data preserved during Library preview** (`index.html`)
   - When clicking a custom set in the Library to preview it, `activeCardSet` was set to the custom set name
   - On page refresh/close, `beforeunload` handler called `saveCustomCards()`, which queried the empty `#card-set-custom` div (only populated when Card Maker is open) and saved an empty array, erasing all card data
   - Fix: guarded the custom set save path to only run when the Card Maker screen is actually visible

### Key Architecture Insights

- **Variation persistence requires card set context**: Variations saved without knowing which card set they belong to can't be restored when sets are lazily built. The `cardSet` field on saved variation data solves this.
- **Inverse transforms for loupe editing**: When a variation has a reflection/rotation transform, all mouse coordinates and directional inputs must be converted through the inverse matrix to work correctly in the element's local coordinate space.
- **Dynamic row creation**: Card sets shouldn't have a fixed row limit. Creating rows on demand for any letter allows the ABC set to grow beyond the original A-E.
- **Save guards matter**: Any save-on-unload handler that queries DOM state must verify the relevant UI is actually visible, since lazy/empty containers produce destructive empty saves.

### File Sizes After Changes
- `index.html`: ~7,328 lines (was ~6,946)
- `css/style.css`: ~4,737 lines (was ~4,731)

---

## March 10-11, 2026 Session — SVG Import & Overscale/Crop Tools

### Summary
Added the ability to import external SVG files into the Card Maker as stamps, with an over-scale slider and crop/pan tool for positioning oversized SVGs within card boundaries. Feature is partially working — crop/pan still has issues.

### Changes Made (5 commits)

1. **"Insert SVG from file" button** (`index.html`)
   - Added a new button to Card Maker draw tools that opens a file picker for `.svg` files
   - Imported SVG is parsed, cleaned, and inserted as a stamp element on the card canvas
   - Commit: `f0efe4f`

2. **Over-scale slider (×1–×10)** (`index.html`)
   - When an imported SVG stamp is selected, an over-scale slider appears allowing scaling from ×1 to ×10
   - Default scale fits the SVG within the card; over-scaling lets it extend beyond card boundaries for detail/crop effects
   - Commit: `f49ad32`

3. **Fix SVG overscale not applying to placed stamps** (`index.html`)
   - The overscale slider was only updating the preview, not the actual placed stamp element
   - Fixed to apply scale transform to the placed imported stamp
   - Commit: `c744ef2`

4. **Show crop/pan button at any scale for imported stamps** (`index.html`)
   - Initially crop/pan button only showed when scale > 1
   - Changed to show for imported stamps at any scale, since users may want to reposition
   - Commit: `6a7ff72`

5. **Fix crop/pan mode broken by competing drag handlers** (`index.html`)
   - The card canvas had existing drag handlers (for moving elements) that competed with the crop/pan drag
   - Partially fixed by adding a mode flag, but behavior is **still not fully correct**
   - Commit: `fcc139b`

### Known Issues (ACTIVE)
- **Crop/pan not fully working**: Drag interactions in crop/pan mode still conflict with other card canvas event handlers. The panning doesn't behave as expected in all cases. Needs rewrite.
- This is the **primary task for the next session**.

### Planned Fix: clipPath Model (Word-style crop)
The current approach tries to reuse the existing canvas drag handlers with a mode flag, causing conflicts. The fix is to use the standard image-editor pattern:
1. **Card = crop frame**: The card SVG boundary is fixed and acts as the visible window
2. **`<clipPath>` on a group**: Define a `<clipPath>` matching the card rect; wrap the imported SVG in a `<g clip-path="url(#...)">`
3. **Inner `<g>` for transforms**: Inside the clipped group, a child `<g transform="translate(x,y) scale(s)">` holds the actual SVG content
4. **Pan = update `translate()`**: Drag in pan mode only changes the inner group's translate — completely separate from the element selection/move system
5. **Scale = update `scale()`**: The overscale slider updates the inner group's scale, keeping the visual center stable
6. **No competing handlers**: Pan/scale operate on a dedicated inner group, not on individual card elements, so the existing element drag system is untouched

### File Sizes After Changes
- `index.html`: ~7,500+ lines (was ~7,328)

---

## March 23, 2026 Session — Player/Admin Split & Login Fixes

### Summary
Separated the app into Player and Admin pages, added role selection to the intro screen, fixed Firestore reserved ID errors, and fixed the admin login overlay showing an empty dialog.

### Changes Made

1. **Player/Admin role selection on intro screen** (`index.html`, `css/style.css`, `js/game.js`, `js/sync.js`)
   - Intro screen now shows Player and Admin buttons first
   - Player → game list + Play; Admin → superuser login → card library
   - `selectRole()` / `resetIntroScreen()` functions manage the flow
   - `_adminLoginPending` flag routes successful admin login to card library

2. **Separate admin page** (`pm-studio-DrV.html`)
   - Standalone HTML file for the admin/superuser site
   - Deployed at `/pm-studio-DrV` on GitHub Pages

3. **Fixed admin login overlay empty dialog** (`pm-studio-DrV.html`)
   - `showSyncLoginOverlay()` called `showRoleChoice()` which hid the admin login form
   - `sync-role-choice` div was empty on admin page → users saw blank dialog
   - Fixed: calls `showAdminLogin()` directly to show the superuser ID input

4. **Fixed Firestore reserved ID error** (`js/sync.js`)
   - `"__player__"` legacy ID caused Firestore `invalid-argument` error
   - Added `_isValidFirestoreId()` guard and auto-sanitization to `"player-guest"`

### File Structure Update
```
Vica_Domino/
├── index.html              - Player-facing app (intro → game selection → play)
├── pm-studio-DrV.html      - Admin/superuser app (login → card library/editor)
├── js/
│   ├── game.js             - VicaDominoGame class
│   ├── domino.js           - Card definitions
│   └── sync.js             - Firebase sync, login logic
├── css/
│   └── style.css           - All styling
└── docs/                   - Project documentation
```

---

---

## March 24 Session — Built-in Card Migration Fix

**Problem**: After the March 23 refactor that removed built-in cards and made everything custom, the 45 Numbers & Dots built-in cards and ABC cards were not appearing in Studio's Card Maker.

**Investigation**: Discovered two layered bugs:
1. **Wrong storage key**: The user had previously deleted the built-in "numbers" set and created a custom set "Numbers and Dots". The migration wrote to `customDrawnCards` (built-in key), but the custom set reads from `customDrawnCards_Numbers and Dots`
2. **Sync timing race**: Migration ran synchronously on page load as an IIFE, but `syncLogin()` is async — when Firestore pull completed, it wiped ALL localStorage and replaced with cloud data (which didn't have migrated cards)

**Fix (migration v2)**:
- Migration detects `deletedBuiltinSets` and `savedCardSets` to find the correct storage key dynamically
- Changed from IIFE `(function migrateBuiltinToCustom(){...})()` to named function `runBuiltinMigration()`
- Called inside every `syncLogin().then()` callback so it runs AFTER Firestore restore
- Still called immediately for offline/no-sync scenarios
- Uses flag `'v2'` instead of `'true'` to force re-run over old v1 migration
- Merges cards from old keys into the correct new key, cleans up legacy keys

**Files changed**: `pm-studio-DrV.html` (migration logic + syncLogin callbacks)

**Key commits**:
- `56d966d` — v2 migration with deleted/renamed set detection
- `d3888a7` — Fix timing: run migration after Firestore sync completes

**Key debugging lesson**: Any localStorage migration in this project MUST run AFTER the async Firestore `syncLogin()` completes, not before. The sync layer wipes and replaces all localStorage with cloud data.

---

## March 25, 2026 Session — Card Data Loss Prevention & Recovery

### Summary
Critical session focused on preventing card data loss, recovering lost Numbers and Dots cards, and adding automatic cloud backups. Also fixed the Play test button and VALUE_RANK error.

### Problems Discovered & Fixed

1. **Play test button showing empty page** (`pm-studio-DrV.html`)
   - Play mode loaded an iframe with `pm-studio-DrV.html?play=X`
   - `checkPlayMode()` ran BEFORE `populateStartScreenGames()` — game data wasn't ready
   - `VALUE_RANK` (defined in `domino.js`) wasn't loaded yet when `startCustomGame()` ran
   - Fix: moved play mode init AFTER initialization; added `VALUE_RANK` fallback

2. **Card data loss from beforeunload + iframe** (`pm-studio-DrV.html`)
   - `saveVariations()` → `saveCustomCards()` reads from Card Maker DOM
   - If Card Maker never opened, DOM is empty → saves empty arrays → wipes card data
   - `beforeunload` handler triggered this on every page close/refresh
   - Play mode iframe made it worse (loads Studio, never opens Card Maker, unloads → empty save)
   - Fix: Added `_cardMakerBuilt` flag — only set `true` when `buildNumbersCardSet()` or `buildAbcCardSet()` runs; `saveVariations()` and `saveCustomCards()` skip if flag is `false`

3. **`safeSaveCards()` wrapper** (`pm-studio-DrV.html`)
   - New function that blocks saving `[]` (empty array) when localStorage already has non-empty card data
   - Applied to all card save paths: Numbers, ABC, custom sets, variations
   - Console warning logged when a save is blocked
   - Explicit deletion (`deleteBuiltinCardSet`, `deleteCardSet`) uses `localStorage.removeItem()` directly, bypassing the guard

4. **Cloud sync wiping local cards** (`js/sync.js`)
   - `syncLogin()` pull replaced ALL localStorage with cloud data
   - If cloud had empty/missing card keys, local cards were wiped
   - Initially protected only 3 hardcoded keys — missed `customDrawnCards_Numbers and Dots` (custom set key)
   - Fix: now protects ALL keys matching `customDrawnCards*`, `cardMakerVariations`, `cardArrangement*`, `abcCardSnapshot`

5. **Numbers and Dots card recovery** (`recover-cards.html`)
   - Cards were lost from both localStorage and Firebase
   - Extracted all 45 original card SVGs from git history (commit `561692f^`)
   - Created `recover-cards.html` — standalone page that saves cards to correct localStorage key
   - Initial version had broken JS (unescaped quotes in innerHTML) — fixed with DOM API
   - Had to detect correct storage key (`customDrawnCards` vs `customDrawnCards_Numbers and Dots`)

6. **Automatic card backup to Firebase** (`js/sync.js`)
   - New `card_backups` subcollection in Firestore: `users/{userId}/card_backups/{timestamp}`
   - Saves all card-related localStorage keys every 20 minutes
   - First backup runs 30 seconds after login
   - Keeps last 3 backups, auto-deletes older ones
   - "Restore Cards from Cloud" button added to Backup & Restore section
   - Public API: `syncListCardBackups()`, `syncRestoreCardBackup(id)`

### Key Files Changed
- `pm-studio-DrV.html` — `_cardMakerBuilt` guard, `safeSaveCards()`, play mode fix, VALUE_RANK fix, cloud backup restore UI
- `js/sync.js` — sync guard for ALL card keys, auto card backup system
- `recover-cards.html` (NEW) — standalone card recovery page
- `data/numbers-cards-backup.json` (NEW) — JSON backup of 45 original cards

### Key Commits
- `8e75d1a` — Fix Play button empty page + initial card loss prevention
- `3000943` — Comprehensive card data loss guards
- `890037c` — Fix VALUE_RANK not defined in play mode
- `22a427a` — Fix sync guard to protect ALL card data keys
- `c49b8c3` — Fix recovery page storage key detection
- `3b03815` — Auto card backup to Firebase every 20 minutes

### Architecture Insights
- **Storage key complexity**: Numbers & Dots cards can be stored under `customDrawnCards` (built-in key) OR `customDrawnCards_Numbers and Dots` (custom set key). Always use `getNumbersStorageKey()` to get the right one. Check `deletedBuiltinSets` and `savedCardSets` to understand current state.
- **3 layers of card protection**: (1) `_cardMakerBuilt` flag prevents saving when DOM isn't populated, (2) `safeSaveCards()` blocks empty-over-non-empty saves, (3) sync guard preserves local cards when cloud is empty
- **Firebase backup structure**: `users/{userId}/card_backups/{ISO-timestamp}` with fields `{ timestamp, data }` where `data` is JSON string of all card-related localStorage keys
- **Syntax validation is critical**: Always run `node -e "new Function(code)"` before committing JS. Broken syntax in HTML inline scripts causes silent failures with no error in the page.

---

## Quick Start for New Session

1. The project is at `/home/user/Vica_Domino` on branch `claude/review-project-docs-JOOeh`
2. Main files: `index.html` (player UI), `pm-studio-DrV.html` (admin UI), `js/game.js` (game logic), `js/domino.js` (card data), `js/sync.js` (Firebase sync), `css/style.css` (styles)
3. No build step — open HTML files directly in a browser or via GitHub Pages
4. All state persisted in localStorage + Firebase sync for superusers
5. **Both player and admin pages are working** as of March 28
6. **Card data protection**: 3 layers — `_cardMakerBuilt` flag, `safeSaveCards()`, sync guard
7. **Auto card backup**: Every 20 min to Firebase `card_backups` subcollection
8. **ALWAYS validate JS syntax before committing** — use `node -e "new Function(require('fs').readFileSync('file.js','utf8'))"`
9. **Numbers & Dots storage key**: Use `getNumbersStorageKey()` — returns `customDrawnCards` or `customDrawnCards_Numbers and Dots` depending on `deletedBuiltinSets`
10. **Crop/Pan tool**: Removed — was non-functional
11. **Recovery page**: `recover-cards.html` available if cards are ever lost again
12. **× slider**: Dynamic range with clickable max popup, 0.02 step, bottom-left anchor scaling
13. **SVG import**: Large SVGs (>200KB) auto-rasterized to 600×600 PNG; auto-sets Aa=90, r=10
14. **Game Creator +**: Add cards from any card set; deletion updates game data + auto-refreshes dominos
15. **localStorage quota**: Cards >500KB skipped; QuotaExceededError handled with revert
