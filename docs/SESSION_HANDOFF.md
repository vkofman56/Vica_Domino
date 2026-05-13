# Session Handoff — Vica Domino

Read this top-to-bottom when starting a fresh Claude Code session,
whether local or cloud. It's the single source of truth for **how
we work** on this project. Everything historical is in
`docs/MEMORY.md` and `docs/STATUS_NOTES.md` — this file is the
**operational playbook**.

---

## Part 1 — One-time local setup (on Mac)

You only do this once per machine.

1. **Install Claude Code CLI.** Either:
   - `npm install -g @anthropic-ai/claude-code` (Node 18+), or
   - Follow the install instructions at <https://claude.ai/code>.

2. **Clone the repo somewhere convenient.** Example:
   ```bash
   cd ~/Documents
   git clone https://github.com/vkofman56/Vica_Domino.git
   cd Vica_Domino
   ```

3. **Fetch the working branches.**
   ```bash
   git fetch --all
   ```
   You should see three `claude/*` branches on `origin`:
   - `claude/review-project-docs-JOOeh` (deploy source)
   - `claude/general-session-yVBQq` (mirror)
   - `claude/resume-vica-domin-UOJun` (per-session mirror)

4. **Check out the deploy source.**
   ```bash
   git checkout claude/review-project-docs-JOOeh
   ```

5. **(Optional) Enable the trial-banner pre-commit hook** so every
   commit that touches `index.html` / `pm-studio-DrV.html` auto-
   stamps the current PDT time into the TRIAL banner:
   ```bash
   git config core.hooksPath .githooks
   ```

6. **(Optional) Set up GitHub CLI** for issues / PRs:
   ```bash
   brew install gh
   gh auth login
   ```

---

## Part 2 — Per-session startup

Every time you open a new Claude Code session in this project,
**paste this prompt as your first message** so the new session
loads the right context:

```
I'm continuing the Vica Domino project from where we left off.

Before we work on anything new:

1. Read docs/SESSION_HANDOFF.md (this file) end-to-end.
2. Read docs/MEMORY.md — most recent sessions are at the top.
3. Read docs/STATUS_NOTES.md — parallel session history with
   commit hashes and project-wide architecture notes.
4. Run `git log --oneline -10` to see the latest commits.
5. Run `git status` to confirm a clean working tree.
6. Confirm origin/claude/review-project-docs-JOOeh,
   origin/claude/general-session-yVBQq, and
   origin/claude/resume-vica-domin-UOJun are all at the same
   commit.

Then summarise the project's current state in 5 lines and the
top 3 open items, so I know you're up to speed. Wait for my
next prompt before changing anything.
```

The new session will read those docs, get the full architectural
and operational picture, and acknowledge the open items. **Don't
skip this step** — without it the session will rediscover
everything painfully from scratch.

---

## Part 3 — Operational rules (NON-NEGOTIABLE)

These are the rules I want every session to follow. Most of them
are also stated in `docs/MEMORY.md` "Resume notes for tomorrow"
and `docs/STATUS_NOTES.md` "Operational", but consolidated here.

### Rule 1 — Three branches must stay identical

The project lives on **three** GitHub branches that must stay
byte-identical after every commit:

| Branch | Role |
|---|---|
| `claude/review-project-docs-JOOeh` | Deploy source. Develop here. |
| `claude/general-session-yVBQq` | Mirror. |
| `claude/resume-vica-domin-UOJun` | Per-session mirror. |

After every commit, push to all three with this exact sequence:

```bash
git push -u origin claude/review-project-docs-JOOeh
git push    origin claude/review-project-docs-JOOeh:claude/general-session-yVBQq
git push    origin claude/review-project-docs-JOOeh:claude/resume-vica-domin-UOJun
```

**Never push to `master` or `main`.** They are intentionally
behind. The Anthropic sandbox proxy 403s master pushes, and the
three-branch setup is the safety net.

### Rule 2 — Bump the cache-buster on CSS/JS changes

The HTML files reference six versioned assets. **Any meaningful
change to a CSS or JS file MUST be paired with a bump to that
file's `?v=` query string** — otherwise browsers serve the cached
old version and the fix doesn't reach users on a normal reload.

Audit current cache-busters:
```bash
grep -nE '\?v=' index.html pm-studio-DrV.html
```

The six versioned files (both index.html and pm-studio-DrV.html
reference them):
- `css/style.css`
- `js/firebase-config.js`
- `js/sync.js`
- `js/domino.js`
- `js/voice.js`
- `js/game.js`

Pick a short tag tied to the change (e.g. `?v=loupe-copy-1`).

**Exception:** if you only edit `pm-studio-DrV.html` or
`index.html` itself, no buster bump needed — the HTML file is the
entry point and a normal reload picks it up.

### Rule 3 — Trial banner

Both `index.html` and `pm-studio-DrV.html` carry a "TRIAL HH:MM
AM/PM PDT" string. The pre-commit hook (`.githooks/pre-commit`)
auto-stamps the current PDT time on every commit that touches
either file. If you've enabled the hook (see Part 1 step 5) it
just works. If not, manually update with:

```bash
TZ='America/Los_Angeles' date '+%I:%M %p %Z'
sed -i '' 's/TRIAL <old>/TRIAL <new>/g' index.html pm-studio-DrV.html
```

(macOS `sed -i` needs the empty-string arg; Linux doesn't.)

### Rule 4 — Commit messages

- Short subject line stating what changed (verb + noun).
- Body describes the *why* and any subtle context that future
  sessions need.
- Tag the commit with the relevant branch / feature so
  STATUS_NOTES.md entries make sense later.

The end of every commit message must contain this trailer (one of
the systems we use for billing/tracing):

```
https://claude.ai/code/session_<your-session-id>
```

For Claude Code on web (sandbox), the session id is set
automatically. For local CLI, the harness inserts it for you.

### Rule 5 — Don't push code without my OK

When you finish a logical chunk of work, **show me the diff and
the commit message draft first**. I'll say "push it" or "wait,
fix X first." Don't surprise me with pushes.

Exception: doc-only commits (`docs/MEMORY.md`,
`docs/STATUS_NOTES.md`, this file) — those you can ship without
asking.

### Rule 6 — Update notes at the end of every session

Before signing off:
- Add a section to `docs/MEMORY.md` at the top (most recent
  first) summarising what we shipped, what's still open, and any
  gotchas surfaced.
- Mirror that summary into `docs/STATUS_NOTES.md` with the
  chronological commit list.
- Verify all three branches are at the same HEAD.
- Confirm working tree is clean.

---

## Part 4 — Architecture cheat sheet

### Files

- `index.html` — Player-facing entry. Game UI.
- `pm-studio-DrV.html` — Admin / studio UI. Card Maker, Game
  Maker, library.
- `css/style.css` — Shared styling for both.
- `js/game.js` — Core gameplay logic.
- `js/domino.js` — Domino rendering / matching engine.
- `js/sync.js` — Firebase bidirectional sync (see below).
- `js/voice.js` — Web Speech API integration for "Find" games.
- `js/firebase-config.js` — Firebase project config.
- `docs/MEMORY.md` — Detailed session-by-session log.
- `docs/STATUS_NOTES.md` — Parallel chronological log + project
  overview.
- `docs/SESSION_HANDOFF.md` — This file.
- `.githooks/pre-commit` — Trial-banner stamper.
- `scripts/bump-trial.sh` — Manual banner bump.

### Code vs data — keep them mentally separate

**Code** (HTML / JS / CSS):
- Lives in the repo, deployed via GitHub Pages.
- Live site URL: `https://vkofman56.github.io/Vica_Domino/`.
- Whatever's on `master` (or whichever branch GH Pages is set to
  serve, currently `master` after the PR #6 merge) is what users
  hit at the URL.
- Our day-to-day work lives on the three `claude/*` branches; we
  only fold into `master` deliberately when ready to deploy.

**Data** (card sets, games, settings):
- Lives in each browser's `localStorage`.
- **Bidirectionally synced to Firebase Firestore** via
  `js/sync.js`. Every `localStorage.setItem` triggers a
  debounced upload; every page load (signed in) triggers a
  download. So a new device signing in with the same user
  account pulls all the user's card library down before the app
  initialises.
- A separate rolling backup (`users/<uid>/card_backups/<ts>/`)
  takes a snapshot every 20 min. Last 3 backups retained. This
  is a disaster-recovery layer on top of the live sync.

### LocalStorage keys (the ones we care about)

- `savedCardSets` — array of `{name, folder, lastOpened,
  isSafeHaven?}` for every user-visible card set.
- `customDrawnCards_<setName>` — card array for each set
  (`label`, `svgContent`, `desc`, `stableId`, etc.).
- `customDrawnCards` (no suffix) — legacy Numbers set when not
  migrated.
- `customDrawnCards_abc` — legacy ABC seed.
- `customDrawnCards_Safe Haven` — Safe Haven storage.
- `savedCustomGames`, `savedCatchGames` — game definitions.
- `cardArrangement`, `cardArrangement_abc` — row-letter layout
  for Numbers and ABC respectively.
- `abcCardSnapshot` — ABC built-in snapshot legacy format.

### `stableId` — the card identity contract

Every card has a `stableId` (format
`<ts>_<safeSetName>_<safeLabel>_<rand>`) used for two things:

1. `_geFindCardUsage` matches set-cards against game-cards by
   stableId to decide if a card is safe to delete.
2. The sync layer uses stableId implicitly through the chunked
   JSON.

**The number-one card-data gotcha:** any code path that creates
a card MUST call `generateStableId(label, setName)`. Skipping
this leaves "stableless" cards that fall back to label-only
matching, which cross-matches everything with the same label
across sets. We fixed the worst offender (`_doCopySet`) and the
2-card placeholder seeds in `_createNamedSet` are an outstanding
item.

---

## Part 5 — Local dev workflow

Running the studio locally for fast iteration:

### Start a local server

```bash
cd ~/Documents/Vica_Domino
python3 -m http.server 8000
```

Then in Chrome: `http://localhost:8000/pm-studio-DrV.html` (or
`/index.html` for the player UI).

### Why a server, not file://

Opening the HTML directly via `file:///...` is technically
possible, but the browser sandbox treats `file://` origins
differently — some browser APIs misbehave and we hit a warning
("Unsafe attempt to load URL") during the orphan-set work. A
local server (`localhost:8000`) behaves nearly identically to
the deployed GitHub Pages version.

### Real data in local dev

LocalStorage is keyed by origin. `localhost:8000` is a separate
origin from `vkofman56.github.io`, so localhost starts with no
cards visible.

To populate localhost with your real card library: sign in via
the Firebase auth widget on the local page (same account you
use on github.io). `js/sync.js`'s `_pullFromServer` will fetch
your Firestore chunks and hydrate localStorage. You'll have all
your real sets after a moment.

**Important — this is real data, not a sandbox.** Once
signed in, any change you make on localhost ALSO pushes back to
Firestore, which means your live `github.io` session will pull
those changes next time it loads. So:

- ✅ Safe for code / UI iteration (no data mutation).
- ⚠️ Risky for testing destructive flows (mass delete, bulk
  rename). For those, sign in with a separate test account, or
  back up first via the rolling snapshots.

### Iteration loop

```
edit → save → reload Chrome → see change
```

That's it. No `git push`, no waiting for GitHub Pages, no
cache-buster bumping (locally the server doesn't cache as
aggressively, and if it does, ⌘⇧R hard-refreshes).

### Deploying after local work

Same as today's cloud flow:
1. `git add` + `git commit` (with proper subject + body +
   session-id trailer).
2. Push to all three branches (Rule 1).
3. If CSS / JS changed, bump cache-busters (Rule 2).
4. To make it live for users, fold the deploy source into
   `master` (do this from your laptop, NOT from a Claude session
   — the sandbox proxy may block it).

---

## Part 6 — Where to find historical context

- **Yesterday's work** — top of `docs/MEMORY.md`. Includes
  commit hashes, what shipped, what's still open.
- **Earlier work** — scroll further down in `docs/MEMORY.md`. The
  log goes back months.
- **Architectural notes** — `docs/STATUS_NOTES.md` has a
  "Project Overview" section + "What Has Been Done" feature
  list, plus the parallel session log.
- **A specific commit's context** — `git log --grep '<keyword>'`
  finds commits by message; once you have the hash, the commit
  message itself usually has full context.
- **The remote-branch audit** — May 12 morning section in both
  notes. 9 old branches recommended for deletion are listed
  there; user-side action still pending.

---

## Part 7 — Current open items at handoff

As of commit `b9a097a` (2026-05-13):

### Done this week
- May 13: Card-group operations (a)/(b)/(c)/(d) all multi-aware
  in the right-click menu, cross-set batches pack into one new
  row, submenu hover handoff fixed.

### Still open
- **P2 — auto-show Gr toolbar on Shift+click.** Right now the
  Group Edit toolbar only appears after explicitly toggling "Gr"
  mode. Showing it as soon as `groupEditSelected.length >= 1`
  would surface the match-attributes / Erase actions without
  the mode toggle. Low-cost UX win.
- **`_createNamedSet` seeds.** Every new card set is auto-seeded
  with A1 / B1 placeholder cards that lack a stableId. The
  function at `pm-studio-DrV.html:14287` should call
  `generateStableId(label, newName)` for each seed. Tiny fix.
- **`customDrawnCards_abc` legacy seed.** Contains 15 stableless
  cards. Same root cause as above; same trivial fix pattern.
- **Repo housekeeping.** May 12 audit identified 9 old branches
  safe to delete (Tier A + B). Do this from your laptop via
  `git push origin --delete <branch>` or via GitHub web UI
  (Settings → Branches → trash icon). Not from a Claude session
  — the proxy may block branch deletes.

---

## Part 8 — Common pitfalls (don't repeat history)

These are mistakes prior sessions made. They're documented in
`docs/MEMORY.md` but worth restating here so a new session is
warned upfront.

1. **Forgetting to push to the third branch.** Easy to push to
   the deploy source and the mirror, miss the per-session
   branch. The May 11 audit caught me back-filling all three
   after the user prompted. Always run the full three-push
   sequence.

2. **Editing CSS/JS without bumping the cache-buster.** Two
   commits (May 11 morning) shipped a "fix" that users couldn't
   see because the browser served the cached old file. Always
   bump the matching `?v=` query on the HTML files when you
   touch a referenced asset.

3. **Inline scripts can lurk inside the HTML files.** The
   pm-studio-DrV.html has multiple `<script>` blocks. When
   searching for a function, don't assume it's in a `.js` file
   — `grep -n "functionName" pm-studio-DrV.html` first.

4. **`localStorage` is per-origin.** `file://`, `localhost:8000`,
   and `github.io` are all different namespaces. Easy to test
   on the wrong one and conclude something is broken when it's
   just looking at empty storage.

5. **Don't trust commit message wording over the actual diff.**
   Always read the diff before saying "shipped." (See "Trust
   but verify" in the system prompt; same principle applies to
   your own work.)

---

## End of handoff

If you're a new Claude session reading this for the first time —
welcome. Run the steps in Part 2, summarise the current state
to confirm comprehension, then wait for the first work prompt.

If you're the user reading this to onboard a new session — just
paste the prompt in Part 2 and we're up.
