#!/usr/bin/env bash
# Bump the visible deploy-time banner ("HH:MM AM/PM PDT") in
# index.html and pm-studio-DrV.html to the current Los Angeles time so
# the live site's header always reflects actual deploy time.
#
# Historical note: this banner used to read "TRIAL HH:MM AM/PM PDT".
# The TRIAL prefix was dropped per user request; the regex below still
# accepts the legacy form so any straggler banner gets cleaned up to
# the new bare format automatically on the next commit.
#
# Usage:
#   bash scripts/bump-trial.sh
#
# Wired into the .githooks/pre-commit hook so a commit touching either
# of those HTML files automatically gets a fresh banner. To enable the
# hook for the local repo (one-time):
#   git config core.hooksPath .githooks
#
# Exits 0 on success. Exits non-zero only on actual error (e.g. missing
# `perl`); finding nothing to replace is a successful no-op.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# %I gives 01-12 with a leading zero (e.g. "09:25 PM PDT"). That's the
# canonical form we write into the HTML.
NEW_TIME=$(TZ='America/Los_Angeles' date '+%I:%M %p PDT')
NEW_BANNER="${NEW_TIME}"

# Replace ANY existing banner — both the new bare time form AND the
# legacy "TRIAL HH:MM AM/PM PDT" form — with the current LA time. The
# (?:TRIAL\s+)? group makes the prefix optional so this script is
# idempotent across the format transition.
TARGETS=(index.html pm-studio-DrV.html biggame.html)
TOTAL_REPLACED=0
for f in "${TARGETS[@]}"; do
    [ -f "$f" ] || continue
    REPLACED=$(perl -pi -e '
        BEGIN { $count = 0 }
        $count += s/(?:TRIAL\s+)?\d{1,2}:\d{2}\s+(?:AM|PM)\s+(?:PDT|PST)/'"$NEW_BANNER"'/g;
        END { print STDERR "$ARGV:$count\n" }
    ' "$f" 2>&1 | tail -1 | awk -F: '{print $NF}')
    REPLACED=${REPLACED:-0}
    TOTAL_REPLACED=$((TOTAL_REPLACED + REPLACED))
done

echo "bump-trial: set banner to '${NEW_BANNER}' (${TOTAL_REPLACED} occurrence(s) updated)"
