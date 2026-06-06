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
- After **every** fix/feature: commit, then push to **all 3 branches**:
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
- `bash scripts/bump-trial.sh` stamps the deploy-time banner.

## 5. Known open items (as of June 5, 2026)
- **`sync.js` gap (UNFIXED):** sync wipes localStorage and replaces with the
  cloud copy, preserving only CARD keys — so `savedCustomGames` /
  `savedCatchGames` / `pageNameLabels_gp2` can be overwritten by a stale cloud.
  See MEMORY June 2 entries.
- Safety/recovery assets on disk: branches `wip/full-20260604`,
  `recovery/replay` (`c49a602`), and `_recovery_transcripts_backup/`
  (session transcripts + change tables).

## Kick-off phrase (paste this when you start a new chat, if you want to be explicit)
> Read CLAUDE.md, the latest section of docs/MEMORY.md and docs/STATUS_NOTES.md,
> and `git log --oneline -10`. Confirm we're on the latest
> `claude/review-project-docs-JOOeh` (fetch first; don't use main). Then tell me
> where we left off and what's open before doing anything.
