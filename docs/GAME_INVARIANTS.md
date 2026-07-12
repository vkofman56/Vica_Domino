# GAME INVARIANTS — what EVERY game gets automatically, now and in the future

**Purpose.** This is the standing checklist of behaviors that apply to ALL
current games automatically and are REQUIRED of every future game and game
feature. When you build or change anything game-related, walk this list: each
item must keep working. When a new always-on behavior ships, ADD it here in
the same session (this document is the contract; STATUS_NOTES is the diary).

Created July 11, 2026 (user request). Maintained alongside `docs/MEMORY.md`
(durable lessons) — read both at session start.

---

## 1. 🔒 Player-side secrecy (THE architecture rule — July 10)

- The player (`index.html` / `js/game.js`) must NEVER receive a game's
  generating program — only baked OUTPUTS (concrete instances, frozen faces).
- The `_mp*`/`_pm*` engine and the authored math stores
  (`cardMathParams_v1`, `cardMathFormula_v1`, `cardMathRel_v1`) stay in the
  Studio and never join the sync payload for player devices.
- Any "fresher instances" need is met by a bake-REFRESH in the Studio —
  never by porting generation to the player.

## 2. Author-only content never reaches play

- Cards flagged `isNote` (the white Info/Examples/data-info cards) are
  skipped by BOTH play pools — Find dominos and Catch bubbles.
- Every play face is stripped of author chrome (`_stripCardLabelsMarkup`,
  used by the Find pool and `_catchBuildCardSVG`):
  - label/note boxes (`.card-label`, `[data-card-label]`),
  - loose note TEXT sitting geometrically inside a label box (the label-zone
    rule is geometric, so such text is structurally a plain svg child),
  - baked parameter boxes (`g.pm-param-boxes`).
- The Game Notes / reports pipeline is author-side; the player never sees
  legends, notes, or roles.

## 3. Parametric play (Find + Catch — July 10)

- Games whose cards carry parameters play from a **Studio-baked instance
  pool** (`game.paramBake`), re-baked on every Library ▶ launch
  (`_pfRefreshFindBake` / `_pfRefreshCatchBake`). The pool holds ~60
  digit-diverse instances per problem card (each digit position randomized
  separately) with computed answers.
- Each play deals **3 instances per problem card** (2 when the pool can't
  give three distinct answers; never a one-domino deck).
- **Answers are DISTINCT across the deal** → no two different problems on a
  board page share an answer (red column rule).
- **Consecutive plays differ**: `paramPlayHistory_v1` avoids each card's
  instances from the last 2–3 plays (relaxing 3→2→1 only when the pool is
  small), unless the author's **"Repeats OK"** checkbox (Find + Catch game
  views) allows repetition.
- A problem card and its answer card share ONE instance and take the
  instance's **ANSWER as their match value**.
- **Problem↔answer links**: explicit `cardAnswerLinks_v1` (＋ Answer card)
  wins; missing links are INFERRED at bake — same formula text, one card
  hides the answer symbol (the problem), the other shows it (manual answer
  cards). Without a link there are no doubles — keep the inference working.
- **Space-boxes + per-parameter alignment survive into play** (July 11):
  the bake ships raw value + reserved width; the player pads figure-spaces
  per each face element's `data-align` — left = pad right, right = pad
  left, center = split. The editor's L/C/R toggle is the single source of
  truth for how a value sits in its slot, everywhere.

## 4. Board / deal invariants

- The Setup **Level (2/3/4 dominos) drives the board count** — every player
  hand = exactly 1 double + (N−1) non-doubles, in parametric and plain games
  alike.
- Find: the double = matching values (for parametric pairs: a problem over
  its true answer; decoys are mismatched cross-pairs).
- Catch: the problem slot is FROZEN (static card), its answer FLOATING; the
  falling set = the true answer + the other instances'/values' answers as
  distractors. Red/green zone probabilities and `_freezeState` dots are
  honored per card.
- Author-set zones (red/neutral/green), per-card probabilities, Prob
  presets, and mGroups apply to every deal.

## 5. The card set is the source of truth (games inherit it)

- Play faces resolve the LIVE card art by stableId from the card-set stores
  (Card Maker edits propagate); the game record's `svgMarkup` is only a
  fallback (and the frozen source for published bundles).
- **Note↔card association** is authored in the Card Maker: a note dropped ON
  a card lands right AFTER it (adjacency) and records an explicit
  `cardNoteLinks_v1` link; the bond renders as the dashed-gold outline +
  bridge. Games read the same association; notes stay author-only (see §2).
- Card roles (`dataset.role`) and their colors ride into game views and
  reports.

## 6. Editing safety for game-used cards

- Any edit that changes a game-used card's ART or MEANING must run the
  per-game usage dialog first ("You are changing the card in line … of …"):
  checked games follow the change; un-checked games keep the old card via
  the **Safe Haven freeze** (art + math stores cloned, game re-pointed).
  Today this guards `drawSave` and the parameter visibility EYE — new
  write-through edits (e.g. future param editors) must use the same guard
  (`_svShowGameUsageDialog` takes an `onProceed` callback).

## 7. Play entry points

- Studio Library ▶ (Find AND Catch) opens the shared Game Preview in a new
  tab: `index.html?playGame=custom-N` / `catch-N`. The legacy in-Studio
  `?play=` / `?catchplay=` screens are dead paths — never route new features
  through them.
- The Setup page always presents the game's TYPE axis ("Type of the game" +
  a `default` button when the author configured none).
- Launching from the Studio is what refreshes parametric bakes; GP 0 tile
  launches reuse the last bake (same device).

---

**How to extend this list:** when a feature is meant to apply to all games
(not just one), implement it in the shared pools/builders above, verify it on
Find AND Catch, then add one bullet here in the same commit.
