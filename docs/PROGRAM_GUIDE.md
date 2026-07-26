# MathGrain Studio (MGS) — Program Guide

*The complete guide to what the program is and does. Last updated July 17, 2026 (deploy tip `6319a92`+). This is the user-and-architecture reference; for where we left off, see `docs/STATUS_NOTES.md`; for durable lessons, `docs/MEMORY.md`; for the parametric internals, the auto-memory note `parametric-cards-feature`.*

> **How to read this guide.** Section 1 describes the full **vision**, which mixes what is built with what is planned. Every capability is tagged:
> **✅ LIVE** — built and deployed today · **🔭 PLANNED** — designed but not yet built.
> Sections 2 onward document **only what is LIVE today**, screen by screen.

---

## 1. What the program is — the vision

MathGrain Studio is a full studio for a **Superuser**, who designs **Big Games (BG)** and creates **Tools**. *(**🔭 Tools do not yet exist** as a feature; planned ones include an abacus, ten-frames with counters, boxes with coins, and "money.")* The Superuser designs Big Games for young learners (ages 3–8), who need to internalize basic math concepts through active, hands-on experience and repeated practice — which the studio supports through multiple game formats.

Some BGs will eventually serve as **Big Game Templates (BGT)** — *(**🔭 a feature that does not yet exist**)* — which **Creators** (Educators and Adult Self-Learners) will use to build their own libraries of Big Games.

To create a BG, the Superuser starts by building **mini-games**: in the **Cards Creator ✅**, they design cards; in the **Game Creator ✅**, they set card probabilities, green/neutral/red card appearance, and other game-specific settings. Once the mini-games are built, the Superuser uses the **Game Previewer ✅** to choose the types of transitions between mini-games and assembles a **Big Game ✅**, complete with a game description.

Some Big Games will remain private and be used only by the Superuser. Others will eventually be made available to Educators, either as-is or as BGTs. For each BGT, the Superuser will write a full description and a shortened version — the **BGT Preview** *(🔭 planned)*.

**Creators** (Educators and Adult Self-Learners, or **ASL**) have the next tier of access, one level below Superuser *(**🔭 the Creators tier does not yet exist** — today there is only the Superuser)*. They will be able to browse the library of Big Games the Superuser has created and use them as default structures for new games.

To create games suited to their needs, Creators will build card sets in the **Template Card Creator** *(🔭 planned)* and select a BGT. Educators will then be able to give specific students access to a game, assign a game to students, and track their performance *(🔭 planned)*. ASL will play the games they design on their own.

**All players will be able to play any created game in the Player ✅.**

**Creators' Studio does not yet exist 🔭.** Once built, it will let Creators preview default games on a touch-screen device and select a **Default Big Game (DBG)** to use as a base. They'll then see card-creation options and design their cards using the Template Card Creator on computer, or a simplified version of the Card Creator on a touch-screen device. Finally, they'll preview and publish their **Novel Big Game**, adding it to the private or public library.

### 1.1 Roles

| Role | Access | Status |
|---|---|---|
| **Superuser** | Designs Big Games and Tools; the full studio | **✅ live** (the only role today) |
| **Creator — Educator** | Uses BGTs to build games, assigns to students, tracks performance | 🔭 planned |
| **Creator — Adult Self-Learner (ASL)** | Uses BGTs to build games, plays them solo | 🔭 planned |
| **Player** | Plays any created game | **✅ live** |

### 1.2 What is built today vs planned

| Built today (✅) | Planned (🔭) |
|---|---|
| Cards Creator, Game Creator, Game Previewer | Tools (abacus, ten-frames, coins, money) |
| Mini-games: **Find the Double**, **Catch**, **Math Problems** | Big Game **Templates** (BGT) + BGT Preview |
| Big Game assembly + transitions between mini-games | The **Creators** tier (Educator / ASL access) |
| The **Player** (plays any game) | **Template Card Creator** |
| Superuser login, cloud sync, backup | Educator assign-to-students + performance tracking |
| | **Creators' Studio** (DBG selection, publish Novel Big Games) |

### 1.3 The apps and files (technical, current)

Everything is plain HTML/JS with no build step, served from the repo root; all state lives in the browser's localStorage and syncs to Firebase for signed-in superusers.

| App | File | Who | Opens on |
|---|---|---|---|
| **Player / Game Previewer** | `index.html` | the child (and the adult previewing) | game selection → play |
| **Studio** | `pm-studio-DrV.html` | the Superuser | login → Library |

Supporting code: `js/game.js` (gameplay engine), `js/domino.js` (built-in card data), `js/sync.js` (Firebase login + sync + auto-backup), `js/voice.js` (speech answering), `css/style.css` (shared styling).

Deployed via GitHub Pages from `claude/review-project-docs-JOOeh`. See `CLAUDE.md` for the branch/ship rules. *(The repository is still named `Vica_Domino` — the historical project name; the product is MathGrain Studio.)*

**Vision term → today's screen:** *Cards Creator* = the **Card Maker** (§4) + the **Card Editor** loupe (§5); *Game Creator* = **§6**; *Game Previewer* = the **Player** intro/preview (§8); transitions = the **Tickets Box** (§3); Big Game assembly = the **Big Game** composition (§6).

---

## 2. Login, sync & backup (Studio)

- **Superuser login** — a gated overlay accepts a whitelisted ID and pulls that account's cloud data. Only the Firebase-authed owner writes data; anyone else runs read-only and shows **Offline**.
- **Offline pill** (`#sync-status`) — Syncing / Saved / Offline. Permission-denied or no-Firebase both show the benign **Offline**, not a red error.
- **Backup & Restore** — *Download Backup* (export everything to a file), *Restore from File* (re-import it), *Restore Cards from Cloud* (pick a timestamped cloud card snapshot).
- **Auto card backup** — card data is written to a Firebase `card_backups` collection every 20 minutes, keeping the last few restore points.

**Critical sync rule (for developers):** the login pull WIPES all of localStorage and restores from the cloud, rescuing only card keys and the `_localWinsKeys` list in `js/sync.js`. Any new user-authored store must be added there or a stale cloud snapshot rolls it back on every login. The Studio-authored stores already protected: `cardMathParams_v1`, `cardMathFormula_v1`, `cardMathRel_v1`, `cardAnswerLinks_v1`, `cardNoteLinks_v1`, `gameNoteLegends_v1`, plus the game stores. (See the `sync-local-wins-gap` memory.)

---

## 3. The Library (Studio home)

The landing screen after login. Two columns plus two boxes.

**Card Sets (left):** a *set* holds cards on one theme. `+` makes a new set, `📁` a folder, `🗑` toggles delete mode (an ✕ per set). Click a set to **preview** it (an *Edit* button then opens it in the Card Maker); **double-click** to rename. A *Recent* strip lists the last sets opened. Built-in sets: **Numbers and Dots**, **ABC**.

**Games (right):** one **game-type card** per type. Click a type to open its directory of games; small *Recent chips* jump straight into a game's Creator or Preview. Inside a type you can add folders and move games between them.

**📝 Game Notes box** — defines what to **record** while a game is played: observations (chips carrying parameters P, t, N, K, C) that decide which cards a child gets and when to switch games. *All on / All off* set every note at once; *📄 Reports* holds the documents produced by recorded preview sessions. Legends persist in `gameNoteLegends_v1`.

**🎟 Tickets Box** — the library of **transition rules**: the conditions that move a player from one mini-game to the next (win, loss, score, progress, collection, answer-branch). A game attaches a "ticket" naming its successor.

---

## 4. The Card Maker (Studio)

The grid of every card in one set. (Internally the screen id is confusingly `domino-library-screen`.)

**View:** `🔍` opens the zoom panel — thumbnail `−/+`, card borders (`▣`), labels (`>`), and a draggable ruler (`▭`, Esc hides).

**Add & edit cards:** `+` blank card · `⇤` copy cards/lines from another set · `W` import a Word `.docx` table (first column = row letter) · **drag an SVG/image file** onto the grid · `V` variation tools (reflections + rotations). **Double-click any card → the Card Editor.**

**Select many:** `Select` is tap-to-select bulk mode (tablet-friendly: tap cards, then copy/move/role/delete). `Shift+click` is the mouse equivalent. The right-click `⭐ Edit group` matches size/font/colour/baseline/shape across a selection (a second right-click picks the reference card). *(The old "Gr" mode and the "V+" toggle were removed; V+ now lives on the separate set-view screen.)*

**Roles:** `Role` tags a card with a meaning games use ("answer", "multiplication"); `Line role` tags a whole row. Cards show the role as a small flag and copies keep it. In the Game Creator, `r→p` sets a column + probability once per role.

**Right-click menu (full):** Edit in Loupe · Role / Role (N) · Copy · Copy to (row) · Copy to set · Copy to icons (Find = square, Catch = circle) · Delete · Move to (row) · Move to set · Line role · Insert line above/below · Insert from another set · Delete this line · Edit group · Reset size → standard · Properties. Empty rows have their own insert/delete menu.

**Duplicates:** an `⚠ Identical cards` panel lists rows holding byte-identical cards, with *Ignore* (this visit), *Ignore Always* (mark intentional), or *Delete* the copy. Marking intentional tags each with `t1`, `t2`… so the warning stays quiet (e.g. a colour-match game needing two same-colour cards). The panel closes when you leave the set.

**Notes:** drop a note onto a card to **bond** them (gold link); the note travels with the card. Click the `⛓` to detach (with Undo).

`GM` opens the Game Maker to add these cards to a game.

---

## 5. The Card Editor (loupe) & the parametric system

Double-click a card to open the full-size editor. This is where the **parametric math-card** system lives — the largest subsystem in the app, built July 2026. The `?` help mirrors this exactly, in two folders: **Set parameters** (define) and **Present parameters** (lay out).

### 5.1 Ordinary editing
Select/move/resize, a `T` text tool (numbers, letters, equations, fractions; shared Math-symbol list), `●` stamps, `SVG` import, shapes, colour, reflect/rotate, delete, undo, save. A `🔍` magnifier zooms the *view* (×1 = real game size) without changing the card; a corner handle resizes the card *frame* (more empty space, same content). Marquee + Shift multi-select; 2+ selected elements scale around the group centre.

### 5.2 Set parameters — defining the numbers
A **parameter** is a letter (A, B, …) that becomes a **different number on every deal**.

- **Par** — create/edit a parameter. Its Values are numbered **rules** (ranges and sets, each Added or Subtracted, each able to carry its own construction and constraints). *Check ✓* verifies; *Sample ▷* shows example values.
- **Parameters bar** — lists every parameter above the card; **drag** a letter onto the card to place it. Once placed it's a normal element.
- **f (formula)** — the connecting relation, e.g. `A + B = C`. The result on the right (C) is **computed, not drawn**: excluded from the count, and its own range only *narrows* the problems.
- **eye** — toggles a parameter **invisible**: it renders half-transparent and becomes the **answer blank** in play. Number problems hide the unknown; matching games show it.
- **Rel** — cross-parameter relations (`A > B`, `A ≠ B`…) built by clicking colour chips + an operator.
- **▷ · i** — sample whole problems; summarise every rule/constraint and drop `＋Info`/`＋Examples` reference cards.
- **SPACE-BOX · reserve N digit space** — sets a **floor**: short values pad up to N digits. The note on the right tells the truth as you type: **"K digits spill"** (some values run past the reserve → still variable width) or **"K digits extra space"** (roomier than any value → the parameter behaves as a fixed-width static).
- **equidistant digits** — forces every digit onto one fixed cell (the font's widest digit). **Required** to stack numbers into a column in fonts whose digits differ in width (Anton, Oswald…); it also makes the boxes exact.

### 5.3 Present parameters — laying the values out
Every placed parameter shows **two boxes** in its colour: the **solid** box = the shortest value the rules allow, the **dotted** box = the longest (the space the value reserves). The `123` tag deals one concrete instance — every letter becomes a real value placed inside its slot; click again to return to letters. *What you see is exactly what a game deals.*

- **Align toggle `|← ↔ →|`** — where the value sits inside the dotted box. The **dotted box holds still**; the letter and its solid box move inside it (left / middle / **right** stacks numbers on their units). Appears only when the boxes differ.
- **Font badges `123` / `1≠0`** — in the font picker, `123` marks fonts whose digits share one width (columns line up); `1≠0` marks fonts where they don't. Only Courier and Roboto Mono also give every *letter* one width.

### 5.4 Adjust, rows & columns — composed layout
The layout engine that makes multi-part problems line up as values change. Same gesture throughout: select the pieces, press the chip.

- **adjust #N** — select **one parameter + statics** (like `kg`). The statics **follow** the value's length: `kg` stays right after the number however long it is. A green dashed tether shows the group; the standing `adjusted #N ✓` chip un-adjusts it; a `▷` beside it deals one valid example per width. Chips and toggles are **draggable**.
- **adjust row N** — select **2+ parameters side by side** (each brings its statics). They pack as **one line**: as any value grows, everything beside it slides over, authored gaps kept. Green solid box = the line at all-minimum, green dotted box = its longest reach; the row's own toggle pins which edge stays while the line moves inside it.
- **adjust column N** — select **2+ parameters one under another + a static** (`+`): column addition. The boxes are the **numbers only** (solid = shortest union, dotted = longest). The static keeps its distance to the column's **nearest edge** — whichever number is widest on a deal decides where it sits — and is tethered to the box. Set every number's align to **right** so units stack under units.
- **card-level `▷`** — appears next to `123` when a card has 2+ adjusted structures; each press deals the next **combination** of widths across all of them, so you can preview every layout the game can produce.

**Under the hood (developers):** the value lands via one routine per side — `_pmPlaceValueInSlot` (Studio) / `_paramSlotPlace` (player) — reading slot attributes the box loop persists (`data-slot-left/-w`, `data-cell`, `data-norm-w`, `data-equi`, `data-align`); packing walks are `_pmRowPack`/`_rowPackFace` and `_pmColPack`/`_colPackFace`; groups ride the SVG as `data-adjust-*` / `data-row-*` / `data-col-*`. Editor and player are changed together and verified numerically identical, because that pair has diverged twice. Instance shifts (`data-*-dx`) are stripped on clear and before every save. Full history: the `parametric-cards-feature` memory and the `docs/HANDOVER_2026-07-07_PAR-RULES.md` handover.

---

## 6. Game types & the Game Creator

**Authorable mini-games** (chosen in the Game Settings gear → *Type of Game*, or the "Choose game type" picker):

- **Find the Double** — the classic: find the matching domino. Cards carry red/neutral/green column assignments (which half of a domino a card sits on) and per-card probabilities.
- **Catch (the Bubble)** — falling-card mechanics; a problem freezes and its answer falls among distractors. See `docs/CATCH_MECHANICS.md`.
- **Math Problems** — a worksheet generator (below).

**Compositions** (built in the Player's intro columns, not the type picker):

- **Big Game** — stitches several mini-games into one flow (Composer; stored in `savedBigGames`; played via `?playBig=`).
- **Combined** — stitches saved games into stages (`saveCombinedGames`).

**The Game Creator screen** (open a game from the Library):

- **Add to the game:** `Row` (empty lettered row) · `Sets` (cards from card sets) · `Gam` (cards from another game, with their column + probability).
- **Cards & layout:** drag to reorder / move between columns; click to select; the shape icon sets shape/corner/picture-scale for all cards (originals untouched); `1/p` collapses groups and shows ×N weights; `↔ Flip` (in the Neutral header) swaps red/green.
- **Roles & probability:** `Role` shows role names; `r→p` sets a column + probability once per role; `Grp` is probability mode (Group 2+ to share p1/p2… or Edit one card); a neutral card's editor has LEFT/RIGHT boxes (top vs bottom half of a domino); the **prob-chip strip** (BasicS / Prob1 / +Prob / ⚙ Manage) saves probability presets players pick under "Frequency".
- **Game Settings (⚙ gear):** the one modal for how the game *runs* — **Type of Game**, **Levels**, **Players** (1/2), **Timer / Sand-timer**, and **Touch / Mouse** tabs (settings can differ by input).
- **Start page:** the domino icon (top-right) is the **Icons' Creator** — choose which card images become the start-page bubbles.

---

## 7. Math Problems worksheet generator

`wsOpenGenerator` builds an interactive, printable-style worksheet from **parametric cards** (a card with parameters + an `f` formula). Options: Title, source card, Problems/page (1–40), Per column, Attempts (1–9), Repeats (avoid the previous page or allow), and Input (Mouse = no keypad, Touch = on-screen keypad). A saved Math game gets an `#mg-overlay` setup screen with a **▶ Play worksheet** button. Feedback is count-only while attempts remain, then reveals which are wrong — never the answers. Per the player-side secrecy principle, the generating engine never ships to the player; only baked outputs do.

---

## 8. The Player (Game Previewer)

The child's app. The intro screen is the hub: player-count selector, per-player icon/name setup, and the global preview.

- **Device preview (GP 0)** — a pill row previews any game inside a scaled iframe sized to real hardware: iPhone (390×844), iPhone 17 Pro (402×874), iPad (820×1180), iPad Pro 12.9″ (1024×1366), Chromebook (1366×768). Touch-mode only; selection persists in `vica_bgDevice`.
- **Voice input** — a game Type can set a `voiceInput` flag with a language (en/es/ru) and custom synonyms; voice tiles show `🎤` and offer a mic-check test. Single-player only (2-player-with-voice tiles are disabled).
- **Pause** — a round can be paused (button in `#game-screen`); navigating away cleans up timers so a hidden round can't fire sounds.

Gameplay itself (deck building from probabilities, level logic, timers, celebration) lives in `js/game.js`. The player receives **baked outputs only** — never a game's generating program (anti-copycat).

---

## 9. Where to find what (developer index)

| Concern | Where |
|---|---|
| Player UI / gameplay | `index.html`, `js/game.js` |
| Studio (all authoring) | `pm-studio-DrV.html` |
| Login / sync / backup | `js/sync.js` |
| Voice | `js/voice.js` |
| Built-in card data | `js/domino.js` |
| Parametric internals | `parametric-cards-feature` memory; `docs/HANDOVER_2026-07-07_PAR-RULES.md` |
| Catch rules | `docs/CATCH_MECHANICS.md` |
| Game invariants (always-on behaviours) | `docs/GAME_INVARIANTS.md` |
| Current status / open items | `docs/STATUS_NOTES.md` |
| Durable lessons | `docs/MEMORY.md` |
| Branch / ship / deploy rules | `CLAUDE.md`, `branch-and-ship-convention` memory |

**Conventions that bite:** validate inline JS before committing (no Node — use `osascript -l JavaScript` to `new Function()` each `<script>`); the deploy banner bumps only on commit, and `python3 -m http.server` sends no cache headers, so a stale tab can show old code under a fresh stamp (hard-reload); localStorage is per-port, so the user's real data is on `:8000`. Editor and player must render parametric cards identically — change and verify both together.
