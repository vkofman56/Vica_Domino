# Vica Domino — read this FIRST, every new chat

This file auto-loads into every session. Do these before doing any work.

## 1. Get up to speed
- Read the **latest** dated section of `docs/MEMORY.md` (durable facts/lessons)
  and `docs/STATUS_NOTES.md` (current status / where we left off / open TODOs).
- Skim `docs/SESSION_HANDOFF.md` for the operational rules.
- Run `git log --oneline -10` to see the most recent commits.

## 2. Work on the canonical branch — NOT a stale one
- The canonical, deployed branch is **`claude/review-project-docs-JOOeh`**. Two
  mirrors must stay byte-identical to it: `claude/general-session-yVBQq` and
  `claude/resume-vica-domin-UOJun`.
- **Never** start from `main` / `origin/main` — they are intentionally stale.
- First thing: `git fetch origin` then confirm you're on the latest tip of
  `claude/review-project-docs-JOOeh`. If this chat opened in an isolated
  **worktree** on a different/old branch (check `git worktree list` /
  `git branch --show-current`), get onto the latest canonical tip before working.

## 3. Commit + push regularly (this is the #1 rule — it was broken once and cost a week)
- After **every** fix/feature, run the one shipping command:
  ```bash
  bash scripts/ship.sh "your commit message"
  ```
  It bumps the banner, `git add -A` (strips `.DS_Store`), commits, pushes the
  same commit to **all 3 canonical branches**, and prints each tip with ✓/✗ so
  you can see they match. It refuses on a detached HEAD or with no message.
  This **replaces** the old manual push trio / bump-trial ritual.
- Manual fallback (only if `ship.sh` can't run) — push to all 3 branches:
  ```bash
  git push origin claude/review-project-docs-JOOeh
  git push origin claude/review-project-docs-JOOeh:claude/general-session-yVBQq
  git push origin claude/review-project-docs-JOOeh:claude/resume-vica-domin-UOJun
  ```
- A **2-hourly `wip/auto-snapshot`** safety branch is auto-pushed by a launchd
  agent (`scripts/auto-snapshot.sh`) — but that's only a backstop. Make real,
  clean commits as you go. (The agent is machine-local, in
  `~/Library/LaunchAgents/com.vica.domino.autosnapshot.plist`.)

## 4. The apps (quick map)
- Two HTML apps served from repo root with `python3 -m http.server 8000`:
  - `index.html` — Game Previewer / player (loads `js/game.js`).
  - `pm-studio-DrV.html` — Game Studio (Card Maker / Game Creator / IC).
- Gameplay = `js/game.js`; cards/data live in localStorage + Firebase sync
  (`js/sync.js`). The local server gets killed when the session's background
  tasks clear — restart it as a true background task if "can't reload".
- `bash scripts/bump-trial.sh` stamps the deploy-time banner (also runs inside
  `ship.sh` and the pre-commit hook — you rarely call it directly).

## 5. Known open items (as of June 5, 2026)
- **`sync.js` games-protection gap — FIXED** (committed in `c13b8cd`). A
  **LOCAL-WINS** block in `js/sync.js` (`_localWinsKeys`) now preserves
  `pageNameLabels_gp2` / `savedCustomGames` / `savedCatchGames` /
  `savedCombinedGames` across a sync, so a stale cloud copy can't roll them
  back. The June 2 "UNFIXED" note was stale — the fix was written during the
  May 30–Jun 4 week but not committed until `c13b8cd`. Trade-off baked in:
  these 4 keys are device-local-authoritative, so edits to them don't
  propagate device→device (fine for single-superuser editing; a fresh/empty
  device still pulls cloud normally).
- **Prevention tooling — DONE.** `scripts/ship.sh` is built and verified (see
  §3); the 2-hourly `wip/auto-snapshot` launchd agent is the passive backstop.
  Use `ship.sh` after every change; the snapshot agent only catches what you
  forget.
- Safety/recovery assets on disk: branches `wip/full-20260604`,
  `recovery/replay` (`c49a602`), and `_recovery_transcripts_backup/`
  (session transcripts + change tables).

## Kick-off phrase (paste this when you start a new chat, if you want to be explicit)
> Read CLAUDE.md, the latest section of docs/MEMORY.md and docs/STATUS_NOTES.md,
> and `git log --oneline -10`. Confirm we're on the latest
> `claude/review-project-docs-JOOeh` (fetch first; don't use main). Then tell me
> where we left off and what's open before doing anything.
