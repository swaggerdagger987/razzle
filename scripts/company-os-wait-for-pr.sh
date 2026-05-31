#!/usr/bin/env bash
# Poll until standup-pr-autopen workflow opens a PR for the current branch.
set -euo pipefail

BRANCH="${1:-$(git branch --show-current)}"
BASE="${2:-razzle-v2-redesign}"
TRIES="${3:-36}"
SLEEP="${4:-5}"

for _ in $(seq 1 "$TRIES"); do
  URL=$(gh pr list --head "$BRANCH" --base "$BASE" --state open --json url -q '.[0].url' 2>/dev/null || true)
  if [ -n "$URL" ] && [ "$URL" != "null" ]; then
    NUM=$(gh pr list --head "$BRANCH" --base "$BASE" --state open --json number -q '.[0].number')
    echo "PR_URL=$URL"
    echo "PR_NUMBER=$NUM"
    exit 0
  fi
  sleep "$SLEEP"
done

echo "PR not found for head=$BRANCH base=$BASE after $((TRIES * SLEEP))s" >&2
exit 1
