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
- **Phase 1 — Cross-set foundation** (shared-art library + game-as-template) ← *detailed below*
- **Phase 2 — Game Previewer: mini-games** (config explorer + save favorable config as a mini-game)
- **Phase 3 — Big Game** (rules of advance + transitions + compose + preview/**publish**; decide
  live-vs-snapshot art here)
- **Phase 4 — FinalPreview + Game Flow** (per-user dynamic probs/rules; publish individualized;
  collect Big Games into a Game Flow)

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

### 1.5 — Game-as-template: apply a game to a set (Q2)
- **"Apply game → set":** pick a game + a target set.
  - **Same shape** (same #lines, same #cards/line) → **1:1 positional map**: clone the game's
    structure onto the target set's cards, carrying probs / groups / roles.
  - **Different shape** → **reconciliation dialog**: surface deviations (missing line, extra card,
    count diff) for the user to resolve, then map the rest.
- Builds on portable identity (**position + role**, label as display) — the #4 model is the
  stepping-stone.
- *Verify:* apply to a same-shape set (clean), and to a slightly-different set (reconcile).

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
