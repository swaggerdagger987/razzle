#!/usr/bin/env bash
# Razzle V2 — Cofounder Loop (Cursor credits, NOT Claude CLI)
#
# Usage:
#   ./scripts/v2_loop.sh --continuous     # NEVER STOPS — chains cycles, zero sleep (default for grind)
#   ./scripts/v2_loop.sh                  # 1 cycle
#   ./scripts/v2_loop.sh 25               # 25 cycles then exit
#   ./scripts/v2_loop.sh --steps 25       # 3-model split, 25 cycles
#
# Uses `cursor-agent` (Cursor subscription credits). See docs/v2/START-LOOP.md
# Skill file: docs/v2/PROGRAM.md (autoresearch metric + keep/discard log)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROMPT_FILE="$ROOT/loop-prompt-v2.txt"
CONTINUOUS_PROMPT="$ROOT/loop-prompt-continuous.txt"
FEATURES="$ROOT/docs/v2/FEATURES.md"
STATE="$ROOT/docs/v2/LOOP-STATE.md"
MODE="single"
CYCLES=1

MODEL_CEO="${RAZZLE_MODEL_CEO:-claude-opus-4-7-thinking-xhigh}"
MODEL_CTO="${RAZZLE_MODEL_CTO:-gpt-5.3-codex}"
MODEL_BUILDER="${RAZZLE_MODEL_BUILDER:-composer-2.5-fast}"

usage() {
  cat <<EOF
Usage: ./scripts/v2_loop.sh --continuous   # NEVER STOPS — shell chains cycles, zero sleep
       ./scripts/v2_loop.sh [cycles]
       ./scripts/v2_loop.sh --steps [cycles]
       ./scripts/v2_loop.sh --steps-continuous

Billing: Cursor credits via cursor-agent (NOT claude CLI).
Skill:   docs/v2/PROGRAM.md

  --continuous  Shell chains cycle → cycle until Ctrl+C. Does NOT stop at FEATURES GREEN.
                Do NOT trust a single agent session to self-loop.

Cursor IDE — paste once in Agent chat:
  Execute loop-prompt-continuous.txt — continuous cofounder loop per docs/v2/PROGRAM.md

See docs/v2/START-LOOP.md
EOF
}

all_features_green() {
  ! grep -qE '\| (RED|YELLOW) \|' "$FEATURES" 2>/dev/null
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${1:-}" == "--continuous" ]]; then
  MODE="continuous"
  shift
elif [[ "${1:-}" == "--steps" ]]; then
  MODE="steps"
  CYCLES="${2:-1}"
  shift 2 2>/dev/null || true
elif [[ "${1:-}" == "--steps-continuous" ]]; then
  MODE="steps-continuous"
  shift
else
  CYCLES="${1:-1}"
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Missing $PROMPT_FILE" >&2
  exit 1
fi

run_cursor_agent() {
  local title="$1"
  local model="$2"
  local prompt="$3"
  echo ""
  echo "========== $title ($model) =========="
  if command -v cursor-agent >/dev/null 2>&1; then
    cursor-agent -p --force --trust --workspace "$ROOT" --model "$model" "$prompt"
  elif command -v agent >/dev/null 2>&1; then
    agent -p --force --trust --workspace "$ROOT" --model "$model" "$prompt"
  else
    echo "$prompt"
    echo ""
    echo ">>> No cursor-agent CLI. Paste loop-prompt-continuous.txt into Cursor Agent"
    read -r -p "Press Enter when this step is done..."
  fi
}

run_continuous_session() {
  echo "=== CONTINUOUS MODE — prefer shell chain (--continuous). Single sessions exit early. ==="
  echo "Skill: docs/v2/PROGRAM.md | Stop with Ctrl+C"
  if [[ ! -f "$CONTINUOUS_PROMPT" ]]; then
    echo "Missing $CONTINUOUS_PROMPT" >&2
    exit 1
  fi
  run_cursor_agent "Continuous cofounder loop" "$MODEL_BUILDER" "$(cat "$CONTINUOUS_PROMPT")"
}

run_single_cycle() {
  local cycle="$1"
  local prompt
  prompt="$(cat "$PROMPT_FILE")"
  prompt="$prompt

Current cycle number to use: $cycle"
  run_cursor_agent "Cofounder cycle $cycle (full pass)" "$MODEL_BUILDER" "$prompt"
}

run_steps_cycle() {
  local cycle="$1"
  local council_base
  council_base='Read docs/v2/PROGRAM.md, docs/v2/LOOP.md, docs/v2/COFOUNDERS.md, docs/v2/results.tsv. Read FEATURES, ACCEPTANCE, COUNCIL.md full thread. Append cofounder entry to COUNCIL.md under "## Council — Cycle '"$cycle"'". Reply BY NAME and call out blind spots. Propose ONE vertical slice from PARITY.md. Vote SHIP/VETO/DEFER. Karpathy: https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md'

  echo ""
  echo "################ Cofounder Cycle $cycle (3-model steps) ################"

  if (( cycle % 2 == 1 )); then
    run_cursor_agent "OPUS — Reddit + Council" "$MODEL_CEO" "$council_base Role: OPUS (equal). Odd cycle: research r/DynastyFF + r/fantasyfootball, append REDDIT-INTEL.md first."
  else
    run_cursor_agent "OPUS — Council" "$MODEL_CEO" "$council_base Role: OPUS (equal)."
  fi

  run_cursor_agent "CODEX — Council" "$MODEL_CTO" "$council_base Role: CODEX (equal). Challenge over-engineering and scope."
  run_cursor_agent "COMPOSER — Council + Build" "$MODEL_BUILDER" "$council_base Role: COMPOSER (equal). If 2/3 SHIP, implement slice now."
  run_cursor_agent "CODEX — Audit" "$MODEL_CTO" "Read docs/v2/PROGRAM.md audit prompt. Cycle $cycle. Karpathy simplicity check. pytest + npm run build. Verify git commit + clean tree. Append Audit to COUNCIL.md."
  run_cursor_agent "OPUS — Brand + Score + Commit" "$MODEL_CEO" "Read docs/v2/PROGRAM.md. Cycle $cycle. Append Brand + Score. git add -A && git commit (slice message). Log docs/v2/results.tsv with real hash. Verify git status clean. Update LOOP-STATE.md. NEVER STOP."
}

update_cycle_state() {
  local cycle="$1"
  sed -i '' "s/^cycle:.*/cycle: $cycle/" "$STATE" 2>/dev/null || sed -i "s/^cycle:.*/cycle: $cycle/" "$STATE"
}

require_clean_tree() {
  if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
    echo ""
    echo "COMMIT GATE BLOCKED — working tree is dirty."
    echo "Loop rule: every cycle must end with git commit. Uncommitted work = decay."
    echo "Commit or stash, then restart. See docs/v2/PROGRAM.md"
    echo ""
    git status -sb
    exit 1
  fi
}

run_chain_forever() {
  local use_steps="${1:-false}"
  echo "=== CHAIN MODE — zero sleep, compound intelligence, never auto-stops ==="
  echo "Skill: docs/v2/PROGRAM.md | Log: docs/v2/results.tsv | Stop: Ctrl+C only"
  trap 'echo ""; echo "Loop stopped."; exit 0' INT TERM

  while true; do
    require_clean_tree

    local cycle
    cycle=$(grep '^cycle:' "$STATE" | awk '{print $2}')
    cycle=$((cycle + 1))

    if all_features_green; then
      echo ""
      echo "=== Milestone: FEATURES.md all GREEN — continuing DEPTH climb (PARITY.md) ==="
      sed -i '' "s/^phase:.*/phase: depth/" "$STATE" 2>/dev/null || sed -i "s/^phase:.*/phase: depth/" "$STATE"
    fi

    echo ""
    echo ">>>>>>>>>> Cycle $cycle — $(date) <<<<<<<<<<"

    if [[ "$use_steps" == "true" ]]; then
      run_steps_cycle "$cycle"
    else
      run_single_cycle "$cycle"
    fi

    update_cycle_state "$cycle"
    # No sleep — immediately start next cycle
  done
}

echo "=== Razzle V2 Cofounder Loop (Cursor credits) ==="
echo "Repo:   $ROOT"
echo "Mode:   $MODE"
echo "Models: CEO=$MODEL_CEO  CTO=$MODEL_CTO  Builder=$MODEL_BUILDER"
echo "=================================================="

case "$MODE" in
  continuous)
    # Shell chains cycles with zero sleep. Single agent sessions exit early —
    # the shell is the autoresearch loop that never stops.
    run_chain_forever false
    ;;
  steps-continuous)
    run_chain_forever true
    ;;
  steps)
    CYCLE=$(grep '^cycle:' "$STATE" | awk '{print $2}')
    CYCLE=$((CYCLE + 1))
    for ((i=1; i<=CYCLES; i++)); do
      run_steps_cycle "$CYCLE"
      update_cycle_state "$CYCLE"
      CYCLE=$((CYCLE + 1))
    done
    ;;
  *)
    if [[ "$CYCLES" == "0" ]] || [[ "${1:-}" == "forever" ]]; then
      run_chain_forever false
    else
      CYCLE=$(grep '^cycle:' "$STATE" | awk '{print $2}')
      CYCLE=$((CYCLE + 1))
      for ((i=1; i<=CYCLES; i++)); do
        run_single_cycle "$CYCLE"
        update_cycle_state "$CYCLE"
        CYCLE=$((CYCLE + 1))
      done
      echo ""
      echo "Done. Check docs/v2/COUNCIL.md, FEATURES.md, git log"
    fi
    ;;
esac
