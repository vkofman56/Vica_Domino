#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# auto-snapshot.sh — every-2h safety net (run by launchd / cron, NOT by hand)
#
# Snapshots the current working tree to the `wip/auto-snapshot` branch and pushes
# it, so at any moment your latest work is backed up off-machine — even if you
# forgot to make a real commit and even if no Claude session is open.
#
# It does NOT touch your working tree, your index, or your current branch: it
# builds the snapshot commit with plumbing (a throwaway temp index + commit-tree
# + update-ref), so it can never disrupt whatever you're doing. It's a backstop;
# make real, clean commits as you finish each fix/feature.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

REPO="/Users/victoriakofman/CLAUDE CODE/Domino"
cd "$REPO" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Nothing changed since HEAD → nothing to snapshot.
if git diff --quiet HEAD -- 2>/dev/null \
   && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null | grep -v '^\.DS_Store$' | grep -v '/\.DS_Store$')" ]; then
  exit 0
fi

WIP="wip/auto-snapshot"

# Build a tree of the working tree using a TEMP index (real index untouched).
TMPIDX="$(mktemp "${TMPDIR:-/tmp}/vica-snap-idx.XXXXXX")" || exit 0
export GIT_INDEX_FILE="$TMPIDX"
git read-tree HEAD 2>/dev/null
git add -A 2>/dev/null
# don't snapshot .DS_Store noise
git rm --cached -q -- .DS_Store ':(glob)**/.DS_Store' >/dev/null 2>&1 || true
TREE="$(git write-tree 2>/dev/null)"
unset GIT_INDEX_FILE
rm -f "$TMPIDX"
[ -n "${TREE:-}" ] || exit 0

CUR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
PARENT="$(git rev-parse -q --verify "refs/heads/$WIP" 2>/dev/null || git rev-parse HEAD)"
STAMP="$(TZ='America/Los_Angeles' date '+%Y-%m-%d %H:%M %Z')"
COMMIT="$(printf 'auto-snapshot %s (working tree on %s)\n' "$STAMP" "$CUR" | git commit-tree "$TREE" -p "$PARENT" 2>/dev/null)"
[ -n "${COMMIT:-}" ] || exit 0

git update-ref "refs/heads/$WIP" "$COMMIT"
# Push the safety branch off-machine (uses the macOS keychain credential).
git push -q origin "$WIP" >/dev/null 2>&1 || true
exit 0
