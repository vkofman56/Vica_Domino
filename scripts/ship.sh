#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ship.sh — the ONE command to run after each fix/feature. Replaces the old
# "just run bump-trial" ritual that only *felt* like shipping and let a whole
# week of work go uncommitted (see docs/MEMORY.md, the June 4 crisis).
#
# It does, in order:
#   1. bump the deploy-time banner (scripts/bump-trial.sh)
#   2. git add -A
#   3. commit with the message you pass as arguments
#   4. push the current commit to ALL 3 canonical branches
#   5. print every branch tip so you can SEE they match
#
# Usage:
#   bash scripts/ship.sh "Card Maker: fix row-copy off-by-one"
#   bash scripts/ship.sh Docs: note the sync.js fix     # quotes optional
#
# The 3 canonical branches must stay byte-identical; this guarantees it by
# pushing the same commit to all three every time.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

CANONICAL=(
    claude/review-project-docs-JOOeh
    claude/general-session-yVBQq
    claude/resume-vica-domin-UOJun
)

# ── Guard rails ──────────────────────────────────────────────────────────────
# Refuse on a detached HEAD — we'd have no branch to push and could orphan work.
BRANCH="$(git symbolic-ref --quiet --short HEAD || true)"
if [ -z "$BRANCH" ]; then
    echo "ship: ERROR — detached HEAD. Check out a branch first." >&2
    exit 1
fi

# A commit message is mandatory. All args are joined into the message.
if [ "$#" -eq 0 ]; then
    echo "ship: ERROR — give a commit message." >&2
    echo "  usage: bash scripts/ship.sh \"your message here\"" >&2
    exit 1
fi
MSG="$*"

# ── 1. Bump the banner ───────────────────────────────────────────────────────
bash scripts/bump-trial.sh

# ── 2 + 3. Stage everything and commit ───────────────────────────────────────
git add -A

if git diff --cached --quiet; then
    echo "ship: nothing to commit — working tree already matches HEAD."
    echo "ship: pushing current HEAD to the 3 canonical branches anyway (to re-sync)."
else
    git commit -m "$MSG

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
fi

# ── 4. Push the current commit to all 3 canonical branches ───────────────────
HEAD_SHA="$(git rev-parse HEAD)"
echo
echo "ship: pushing $(git rev-parse --short HEAD) to all 3 canonical branches…"
for b in "${CANONICAL[@]}"; do
    git push origin "HEAD:$b"
done

# ── 5. Confirm every tip matches ─────────────────────────────────────────────
echo
echo "ship: canonical branch tips on origin —"
ALL_MATCH=1
for b in "${CANONICAL[@]}"; do
    TIP="$(git rev-parse "origin/$b" 2>/dev/null || echo 'MISSING')"
    SHORT="$(git rev-parse --short "origin/$b" 2>/dev/null || echo 'MISSING')"
    MARK="✗"
    if [ "$TIP" = "$HEAD_SHA" ]; then MARK="✓"; else ALL_MATCH=0; fi
    printf '  %s %-34s %s\n' "$MARK" "$b" "$SHORT"
done

echo
if [ "$ALL_MATCH" -eq 1 ]; then
    echo "ship: ✅ all 3 branches byte-identical at $(git rev-parse --short HEAD)."
else
    echo "ship: ⚠️  branches do NOT all match — investigate before continuing." >&2
    exit 1
fi
