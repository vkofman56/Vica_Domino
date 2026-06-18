#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ship.sh — the ONE command to run after each fix/feature. Replaces the old
# "just run bump-trial" ritual that only *felt* like shipping and let a whole
# week of work go uncommitted (see docs/MEMORY.md, the June 4 crisis).
#
# It does, in order:
#   1. bump the deploy-time banner (scripts/bump-trial.sh)
#   2. stage changes (git add -A, OR only the paths after a literal `--`)
#   3. commit with the message you pass as arguments
#   4. push the current commit to ALL 3 canonical branches
#   5. print every branch tip so you can SEE they match
#
# Usage:
#   bash scripts/ship.sh "Card Maker: fix row-copy off-by-one"
#   bash scripts/ship.sh Docs: note the sync.js fix     # quotes optional
#
#   # Per-path staging (PARALLEL SESSIONS — stage ONLY your own files so a
#   # concurrent session's uncommitted work isn't swept in by `git add -A`):
#   bash scripts/ship.sh "Big Game: …" -- index.html biggame.html js/game.js css/style.css docs
#   bash scripts/ship.sh "Studio: …"   -- pm-studio-DrV.html docs
#   # In per-path mode the banner is stamped ONLY on the *.html files in scope.
#   # See docs/STATUS_NOTES.md → "TWO-SESSION PROTOCOL".
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

# A commit message is mandatory. Optional explicit paths after a literal `--`
# switch staging from `git add -A` to ONLY those paths (per-path staging for
# parallel sessions — see docs/STATUS_NOTES "TWO-SESSION PROTOCOL").
if [ "$#" -eq 0 ]; then
    echo "ship: ERROR — give a commit message." >&2
    echo "  usage: bash scripts/ship.sh \"your message\"             (stages all: git add -A)" >&2
    echo "         bash scripts/ship.sh \"your message\" -- <paths>   (stages only <paths>)" >&2
    exit 1
fi

# Split args on the first literal `--`: before = message, after = explicit paths.
MSG=""
PATHS=()
DD_SEEN=0
for a in "$@"; do
    if [ "$DD_SEEN" -eq 0 ] && [ "$a" = "--" ]; then DD_SEEN=1; continue; fi
    if [ "$DD_SEEN" -eq 0 ]; then
        if [ -z "$MSG" ]; then MSG="$a"; else MSG="$MSG $a"; fi
    else
        PATHS+=("$a")
    fi
done
if [ -z "$MSG" ]; then
    echo "ship: ERROR — give a commit message (before the --)." >&2
    exit 1
fi

# ── 1 + 2 + 3. Bump banner, then COMMIT ──────────────────────────────────────
COMMIT_MSG="$MSG

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

if [ "${#PATHS[@]}" -gt 0 ]; then
    # Per-path mode: stamp ONLY the *.html files in scope, then commit ONLY <paths>.
    HTML_SCOPE=()
    for p in "${PATHS[@]}"; do
        case "$p" in *.html) HTML_SCOPE+=("$p") ;; esac
    done
    if [ "${#HTML_SCOPE[@]}" -gt 0 ]; then bash scripts/bump-trial.sh "${HTML_SCOPE[@]}"; fi
    # CRITICAL: `git commit -- <paths>` commits the working-tree content of those
    # paths and DISREGARDS anything staged for OTHER paths — so a concurrent
    # session's already-`git add`ed files are NEVER swept in. (A plain `git add
    # <paths>` + a full commit does NOT protect against pre-staged files — that
    # bug let pm-studio-DrV.html land in d1a7f4a; this is the fix.)
    if git diff --quiet HEAD -- "${PATHS[@]}"; then
        echo "ship: nothing to commit in your paths — pushing current HEAD to re-sync."
    else
        git commit -m "$COMMIT_MSG" -- "${PATHS[@]}"
    fi
    # Heads-up: anything modified/new OUTSIDE your paths is left untouched
    # (likely the other session's in-flight work — that's the point).
    LEFT="$(git ls-files -m -o --exclude-standard | wc -l | tr -d ' ')"
    if [ "$LEFT" -gt 0 ]; then
        echo "ship: note — $LEFT file(s) modified/new OUTSIDE your paths left uncommitted (not yours)."
    fi
else
    # Default mode: stamp all targets, stage + commit everything.
    bash scripts/bump-trial.sh
    git add -A
    # Never commit macOS .DS_Store noise, even if it slipped past .gitignore.
    git rm --cached -q -- .DS_Store ':(glob)**/.DS_Store' >/dev/null 2>&1 || true
    if git diff --cached --quiet; then
        echo "ship: nothing to commit — working tree already matches HEAD."
        echo "ship: pushing current HEAD to the 3 canonical branches anyway (to re-sync)."
    else
        git commit -m "$COMMIT_MSG"
    fi
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
