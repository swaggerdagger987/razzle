#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_FILE="$REPO_ROOT/loop-prompt.txt"
MAX_ITERATIONS="${1:-10}"

usage() {
  cat <<'EOF'
Usage: scripts/run_loop.sh [MAX_ITERATIONS]

Runs the Razzle ship loop through Claude Code.
Each iteration executes one task from LOOP-TASKS.md.

Arguments:
  MAX_ITERATIONS  Number of loop iterations (default: 10)

Example:
  scripts/run_loop.sh        # Run 10 iterations
  scripts/run_loop.sh 5      # Run 5 iterations
  scripts/run_loop.sh 1      # Run 1 iteration (single task)
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

# Set git identity
git -C "$REPO_ROOT" config user.name "swaggerdagger987"
git -C "$REPO_ROOT" config user.email "swaggerdagger987@users.noreply.github.com"

PROMPT=$(cat "$PROMPT_FILE")

echo "=== Razzle Ship Loop ==="
echo "Repo:       $REPO_ROOT"
echo "Iterations: $MAX_ITERATIONS"
echo "========================"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo ""
  echo "--- Iteration $i/$MAX_ITERATIONS ---"
  echo ""

  # Run Claude Code with the loop prompt
  # --dangerously-skip-permissions allows autonomous execution
  claude -p "$PROMPT" --dangerously-skip-permissions

  # Check if all tasks are done (look for any PENDING or FAIL tasks)
  if ! grep -q 'Status.*PENDING\|Status.*FAIL' "$REPO_ROOT/LOOP-TASKS.md" 2>/dev/null; then
    echo ""
    echo "=== All tasks PASS — phase complete ==="
    break
  fi

  echo ""
  echo "--- Iteration $i complete ---"
done

echo ""
echo "=== Loop finished after $i iterations ==="
