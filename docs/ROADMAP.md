# MathGrain — Build-out Roadmap
**Created:** June 9, 2026. Living document — update as phases land.

## The pipeline (big picture)
Studio → Game Previewer (mini-games) → Big Game (rules + transitions + publish) →
FinalPreview (individualized) → Game Flow. See `MEMORY.md` (June 9 foundation notes)
for the full chain and the standing principle (one source of truth / clean data model).

**Foundation already done:** Studio (Card Maker + Game Creator: cards → equivalence rows,
probs, red/neutral/green, groups, IC), a working previewer, sync + **games backup +
auto-repair + safer drag**, and the **#4 clean data model** (a card's row is derived purely
from its label — single source of truth).

## Phase overview
- **Phase 1 — Cross-set foundation** — ✅ DONE (1.1–1.4 shipped; 1.5 superseded by r→p, see below)
- **Phase 2 — Game Previewer: mini-games** — ✅ DONE June 15, 2026. A mini-game = a LEGEND
  (one config of a game's settings: `{timerOn, probOptionId, level, typeId}`), filed under
  its parent game (`game.miniGames`). Per-game folder icon + count on the Choose-the-game
  page → panel listing mini-games (legend in plain words) with a computed "Default" (count
  starts at 1) + ⧉ Copy / ⚙ Edit / ✎ Rename / ✗ Delete; Add/Copy/Edit route to the Setup
  page with a Save button + naming banner. **Board = the type's surface, NOT a deal** (an
  early board-snapshot was built then stripped). Commit arc: `e6de30d`→`6c0e889` (ledger in
  STATUS_NOTES June 13–15).
- **Phase 3 — Big Game composer** ← *NEXT; model LOCKED June 15 (detailed below)*
- **Phase 4 — FinalPreview + Game Flow** (per-user dynamic probs/rules; publish individualized;
  collect Big Games into a Game Flow)

---

# Phase 3 — BIG GAME composer (DETAILED) — model locked June 15, 2026

**Goal.** Compose **mini-games** (across Find AND Catch) into a **Big Game** — a sequence of
stages with rules of advance + transitions — and play it. The evolution of the legacy
Combined Games prototype (chains Find games into gem-gated stages; see STATUS_NOTES grounding).

## Architecture — LOCKED (June 15, 2026)
1. **A NEW standalone app: the Big Game Composer** (a new top-level HTML page like
   `index.html`/`pm-studio-DrV.html`, served from repo root, shared localStorage + Firebase
   sync). User wants it separate so it can sit in its own browser tab. Authoring is
   MOUSE-ONLY (only the published Big Game runs touch+mouse).
2. **Embedded Previewer engine for Play** (NOT a 2nd engine). The Composer's ▶ Play runs the
   game via the real Previewer engine embedded in a frame/overlay, deep-linked by a URL
   param (`index.html?playBig=<id>`). One play engine, no duplication, no tab-switching.
3. **The Previewer's "Sequence" column** also lists & plays Big Games (same data + engine).
4. **Fresh `savedBigGames` store**, registered in `sync.js` backup + local-wins (protected
   like `savedCustomGames`/`savedCatchGames`/`savedCombinedGames`). Do NOT extend the legacy
   `savedCombinedGames`.

## Data model (sketch)
```
savedBigGames = [{
  id, name, createdAt,
  stages: [{
    gameType: 'find' | 'catch',          // enables Find/Catch mixing
    gameRef: { name, index },            // resilient ref to the parent game (name-first, index fallback)
    miniGameId: '<id>' | 'default',      // which mini-game legend; 'default' = the game's own config
    advanceRule: { kind: 'gems', value: N }   // RESERVED/extensible; simple default now, editor later
  }, ...],
  transition: { kind: 'levelup' }        // RESERVED/extensible; just the visual now
  // publish fields reserved for later
}]
```
Play-time resolution per stage: find the game (gameType + gameRef) → get the mini-game's
legend (by id, or compute the Default) → apply those settings → play it as one stage.

## Decisions LOCKED (June 15, 2026)
- **Advance rules** will be complex/multifunctional later (gems, time, score, branching…).
  NOT building the rule editor now — just RESERVE an extensible per-stage `advanceRule` slot
  with a simple default (gem count, reusing the existing mechanic). Editor drops in later
  with no migration.
- **Transitions**: just the visual "Level Up!" moment for now; their own rules come later.
- **Board / type-mixing (A vs B)**: all-one-type Big Game = one shared board surface (A);
  mixed types (Find+Catch) = switch the board surface between stages (B). Handled in 3d.
- **Publish** (what it produces + live-vs-snapshot art) is DEFERRED within Phase 3 (3f).

## Stages (each shipped + self-tested + user-verified, #4-style)
- **3a — Foundation. ✅ DONE (June 16).** `savedBigGames` model + `bgLoad/bgSave/bgAdd/bgRename/
  bgDelete/bgNewRecord` helpers; registered in `sync.js` (backup + local-wins, `local-wins-6`);
  new Composer app **`biggame.html`** (shared chrome, Big-Games list w/ Rename+Delete + "New Big
  Game", reads/writes the store). Verified in preview (no errors, CRUD round-trips localStorage).
  No composing/play yet.
- **3b — Compose: gather + order. ✅ DONE (June 16).** Compose view in `biggame.html`: Open (✎)
  a Big Game → two columns. LEFT = library of every game (Find + Catch, color-tagged), each
  expandable to its mini-games (implicit **Default** + saved ones, with a legend hint); "＋ Add"
  appends a STAGE. RIGHT = ordered stage list with numbered badges + a ⠿ grab handle for
  **mouse drag-to-reorder** (HTML5 DnD, yellow drop-line hint) + ↑/↓ arrow reorder + ✗ remove
  (ends disabled). STAGE = `{gameType:'find'|'catch', gameRef:{name,index}, miniGameId:'<id>'|'default',
  miniGameName}`; changes persist instantly via `bgMutateStages` (no separate Save). Verified in
  preview: add/reorder/remove round-trip, real data untouched. advanceRule/transition = 3c.
- **3c — Reserved slots.** Per-stage simple advance rule (gem count, editable) + visible
  "more later" placeholder; transition fixed to the visual Level-Up. No rule editor.
- **3d — Embedded Play (meatiest/riskiest).** `?playBig=<id>` auto-launch hook in the
  Previewer; EXTEND the combined-game playback from Find-only-whole-games to mini-game stages
  + Find/Catch surface switching (the A/B rule). Composer ▶ Play embeds the Previewer at that
  URL. May sub-stage.
- **3e — Previewer Sequence column.** List & play `savedBigGames` from the Sequence slot
  (reuses 3d).
- **3f — Publish (deferred).** Define what publish produces + the live-vs-snapshot-art call.

## Existing assets to build on
- Legacy **Combined Games** (the prototype): sequencing, per-player gem tracking, the "Level
  Up!" transition overlay, final celebration, by-name resilient refs — reuse these in 3d.
  See STATUS_NOTES June 15 grounding for the exact functions
  (`combinedGameConfig`/`checkGameProgression`/`loadGameDeckForStage`/`showFinalCelebration`).
- **Mini-game model** (Phase 2): `game.miniGames = [{id,name,createdAt,legend}]`, legend =
  `{timerOn,probOptionId,level,typeId}`, + the implicit computed Default.

---

# Phase 1 — Cross-set foundation (DETAILED)

**Goal.** Make card **art reusable across sets** while each set keeps its own **equivalence
meaning**, and make a **game reusable as a template** across sets.

**Core insight (from the user).** One drawing — e.g. "one bear" — can live in many sets with a
different role in each (spelling: row **B**; numbers: row **1**; forest animals: row **bear**).
The *art* is shared; the *equivalence/row* is per-set. Editing shared art uses a **copy-on-write
scope choice** (apply to **all** / **chosen…** / **only this one** → fork into a new card).

**Why now.** Mini-games / Big-Games will serialize references to cards and games; settling the
shared-art identity + template model before those layers exist avoids migrating serialized
artifacts later.

## Decisions — LOCKED (June 10, 2026)
1. **Art-identity model: (B) per-card art + `sharedArtId` link.** Art stays on each card; a
   shared id links instances across sets so edits can propagate. Incremental. (A) central
   art library is deferred as an optional later consolidation. ← **stage 1.1 builds this.**
2. **Edit-scope dialog default = "only this one" (fork).** The dialog ALWAYS presents all
   three options (only this one / chosen… / all); the default is just the pre-selected SAFE
   one — the user can pick any of the three each time. (stage 1.3)
3. **Role = extensible controlled list + free text.** A managed list of role names the user
   can ADD to, PLUS a free-text field for extra notes/categories beyond the main ones.
   (stage 1.4)

## Stages (each shipped + self-tested + user-verified, #4-style — small and reversible)

### 1.1 — Shared-art identity (data model)
- Add a **`sharedArtId`** to each card. One-time migration: every existing card gets its **own
  unique** id (existing independent copies stay **unlinked** — we don't guess which old copies are
  "the same"; linking happens going forward).
- Register `sharedArtId` in the **backup / sync / local-wins** set (reuse the existing pattern).
- *Verify:* cards carry the id; nothing renders/saves differently.

### 1.2 — Copy-to-set creates a LINKED instance
- Today `_copyCardToSet` makes an **independent duplicate** (fresh id). Change it so the copy
  **shares the source's `sharedArtId`** — it still gets its own per-set **uid / row / label**, but
  the same art identity. (`_moveCardToSet` likewise keeps the id.)
- Now "one bear" copied into 3 sets = **3 linked instances**.
- *Verify:* copy a card to another set → both share `sharedArtId`; the copy has its own row/label;
  the original is untouched.

### 1.3 — Edit-scope dialog (the "bear" edit UX)
- On editing a card's **ART** (the drawing), if it has linked siblings (same `sharedArtId`
  elsewhere), show: **Apply to — all / chosen… / only this one.**
  - **only this one** → **fork**: edited card gets a **new** `sharedArtId` (detached); art changes
    here only.
  - **all** → update `svgContent` on every sibling.
  - **chosen…** → a small picker (*"this bear appears in: Spelling, Numbers, Forest Animals"*);
    the selected subset gets the new art under a **new shared id** (a sub-lineage); the rest keep
    the old.
- **Per-set metadata edits (row, label, probability, group, red/neutral/green) stay LOCAL** — no
  dialog. Variations (flips/rotations) **follow the shared base**.
- *Verify:* edit a shared bear → each option behaves correctly; metadata edits never prompt.

### 1.4 — Per-set equivalence / role clarity (Q1) — ✅ DONE June 11, 2026
Shipped: **1.4a** role storage + vocabulary (`c549fdd`); **1.4b** opt-in role UI — right-click
card → Role…, right-click → Line role…, Group Edit ⚑ bulk/reference assign, per-role-colored
dots (vocab-index palette) + hover tooltips on cards AND row letters, all Ctrl+Z-able
(`0851623`, `1100449`, `4168ccc`, `7a6acfe`); **1.4c** cross-set add-cards prompt — same letter
from a different set asks "new line(s) at the end" (default) vs "into the existing row(s)"
(`32c5bd6`). Original decisions below.

#### (original) decisions LOCKED June 11, 2026
- **Roles attach at BOTH levels** (user's call, from his worked example: line 1 = answer 15 +
  2 multiplication + 2 addition problems; line 2 = same shape for 20):
  - **Line role** = the equivalence meaning of the row ("equals 15").
  - **Card role** = the kind of card within the row ("answer" / "multiplication" / "addition") —
    the same few names repeat across lines and sets.
- **Roles are 100% OPTIONAL** — no prompts/nagging; unlabeled sets/lines/cards behave exactly as
  today. The "vocabulary" is just the remembered list of role names already used, so labels stay
  consistent (pick from list or type a new name, which joins the list). Free-text notes allowed too.
- **Cross-set same-letter merge: ASK the user** (locked). When a line whose letter matches an
  existing row arrives from a DIFFERENT set, prompt: **"Add as a new line at the end" (default)**
  vs "Add into the existing <letter> row".
- Sub-steps: **1.4a** role vocabulary (storage + helpers) → **1.4b** assign/show roles on lines +
  cards (opt-in UI, e.g. context menu) → **1.4c** the cross-set add-cards prompt.
- *Verify:* roles save/recall + vocabulary grows; same-letter line from another set triggers the
  end-vs-merge prompt; default lands it as a separate row at the end.

### 1.5 — ~~Game-as-template: apply a game to a set~~ → SUPERSEDED June 12, 2026 by **r→p**
**User decision:** applying an existing game to another (especially non-equivalent) set is too
messy. Instead: a **role → probability shortcut in the Game Creator** — set the game's
red/neutral/green columns + probabilities **once per ROLE**, not per card.

**r→p design (locked June 12, 2026):**
- New **r→p** button in the game view. It swaps the grid for ONE synthetic line holding one
  **representative card per role** (the first card of that role in game.cards order), all in
  **neutral** on first use; the **role name** + member **count** (when >1) under each card.
- A representative behaves like a normal game card: **drag** to red/neutral/green, set probability
  with the **existing per-card prob editor**. Exit via explicit **Apply / Cancel** (locked — no
  apply-on-leave).
- **Apply**: every card inherits its role's column + probabilities (one Ctrl+Z point), cards
  **regrouped by role within each line** (locked), snapshot stored on the game; user then
  fine-tunes per card as usual. Writes into the **active Prob** chip (locked; from BasicS this
  creates a new Prob per the existing rule).
- **Re-entry**: shows the **saved snapshot** (locked) + warning "Applying this will overwrite
  your per-card changes". Cards without a role group under **"(no role)"** (locked).
- **Stages:** **A** grouping engine (`_rpGroupGameCardsByRole`, shipped + verified read-only
  June 12) → **B** the r→p mode UI (Find first) → **C** Apply semantics + snapshot + warning →
  **D** Catch + Prob-chip integration.
- Side decision (same session): **twin clones** (one stableId on two cards) get a warning toast
  in Card Maker (set open) and Game Creator (game open) — `_twinScanCardMaker` /
  `_twinScanGame`; user wants none anywhere.

## Cross-cutting (whole phase)
- Every stage: shipped separately, self-tested, **user-verified in the live Studio** (login-gated —
  I verify at the data/parse level, the user clicks through), revertible by one `git revert`.
- New fields (`sharedArtId`, role) → backup / sync / local-wins.
- **Delete is local** (remove the instance from this set; shared art survives if used elsewhere).
- Keep the staged, single-source-of-truth discipline.

## Existing code to build on
- **`_copyCardToSet` / `_moveCardToSet`** (`pm-studio-DrV.html`) — cross-set copy ALREADY exists
  (duplicate-based via right-click "Copy/Move to set…"); 1.2 makes it linked.
- Card storage `customDrawnCards_<set>`, card identity `stableId` / `cardSet`, art `svgContent`.
- The #4 label-as-row model (`_effectiveRowLetter`, `_rowKeyParse`) — portable identity base.
- The card-edit save path in the Card Maker — where 1.3's scope dialog hooks in.

## Open question deferred to later phases
- **Live vs snapshot-on-publish** for card art is resolved at the *set* level here (shared art +
  edit-scope), but the *Big-Game publish* freeze decision still lands in **Phase 3**.
