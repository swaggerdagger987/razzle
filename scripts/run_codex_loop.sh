#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPT_FILE="$REPO_ROOT/loop-prompt.txt"
LAST_MESSAGE_FILE="${CODEX_LAST_MESSAGE_FILE:-${TMPDIR:-/tmp}/razzle-codex-last-message.txt}"
MODE="unsafe"
MODEL="${CODEX_MODEL:-}"

usage() {
  cat <<'EOF'
Usage: scripts/run_codex_loop.sh [--safe|--unsafe] [--prompt FILE] [--model MODEL]

Runs the Razzle loop through `codex exec` from the repo root.

Options:
  --safe         Use Codex full-auto mode (may still stop for approvals).
  --unsafe       Use unrestricted headless mode for true autonomous execution.
  --prompt FILE  Prompt file to feed into Codex. Defaults to loop-prompt.txt.
  --model MODEL  Override the Codex model for this run.
  --help         Show this message.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --safe)
      MODE="safe"
      shift
      ;;
    --unsafe)
      MODE="unsafe"
      shift
      ;;
    --prompt)
      PROMPT_FILE="${2:?--prompt requires a file path}"
      shift 2
      ;;
    --model)
      MODEL="${2:?--model requires a value}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI is not installed or not on PATH." >&2
  exit 1
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

git -C "$REPO_ROOT" config user.name "swaggerdagger987"
git -C "$REPO_ROOT" config user.email "swaggerdagger987@users.noreply.github.com"

cmd=(codex exec -C "$REPO_ROOT" --output-last-message "$LAST_MESSAGE_FILE")

if [[ -n "$MODEL" ]]; then
  cmd+=(-m "$MODEL")
fi

if [[ "$MODE" == "unsafe" ]]; then
  cmd+=(--dangerously-bypass-approvals-and-sandbox)
else
  cmd+=(--full-auto)
fi

cmd+=(-)

echo "Running Codex loop"
echo "Repo:   $REPO_ROOT"
echo "Prompt: $PROMPT_FILE"
echo "Mode:   $MODE"
echo "Last:   $LAST_MESSAGE_FILE"

exec "${cmd[@]}" < "$PROMPT_FILE"
