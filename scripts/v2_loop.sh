#!/usr/bin/env bash
# Razzle V2 — Cofounder Loop (Cursor credits, NOT Claude CLI)
#
# Usage:
#   ./scripts/v2_loop.sh --board           # board meeting now (3-model audit + KEEP/DELETE/REFINE)
#   ./scripts/v2_loop.sh --continuous     # NEVER STOPS — board every 10 cycles
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
BOARD_PROMPT="$ROOT/loop-prompt-board.txt"
FEATURES="$ROOT/docs/v2/FEATURES.md"
STATE="$ROOT/docs/v2/LOOP-STATE.md"
BOARD_INTERVAL="${RAZZLE_BOARD_INTERVAL:-10}"
MODE="single"
CYCLES=1

MODEL_CEO="${RAZZLE_MODEL_CEO:-claude-opus-4-7-thinking-xhigh}"
MODEL_CTO="${RAZZLE_MODEL_CTO:-gpt-5.3-codex}"
MODEL_BUILDER="${RAZZLE_MODEL_BUILDER:-composer-2.5-fast}"
RECOVERY_LOG="$ROOT/docs/v2/recovery.log"
RECOVERY_MODELS=("$MODEL_CTO" "$MODEL_CEO" "$MODEL_BUILDER")

usage() {
  cat <<EOF
Usage: ./scripts/v2_loop.sh --continuous   # NEVER STOPS — board every ${BOARD_INTERVAL} cycles
       ./scripts/v2_loop.sh --board         # board meeting now (3-model KEEP/DELETE/REFINE)
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

if [[ "${1:-}" == "--board" ]]; then
  MODE="board"
  shift
elif [[ "${1:-}" == "--continuous" ]]; then
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

last_board_cycle() {
  if grep -q '^last_board_cycle:' "$STATE" 2>/dev/null; then
    grep '^last_board_cycle:' "$STATE" | awk '{print $2}'
  else
    echo "0"
  fi
}

update_last_board_cycle() {
  local cycle="$1"
  if grep -q '^last_board_cycle:' "$STATE" 2>/dev/null; then
    sed -i '' "s/^last_board_cycle:.*/last_board_cycle: $cycle/" "$STATE" 2>/dev/null || \
      sed -i "s/^last_board_cycle:.*/last_board_cycle: $cycle/" "$STATE"
  else
    echo "last_board_cycle: $cycle" >> "$STATE"
  fi
}

should_run_board() {
  local cycle="$1"
  local last
  last=$(last_board_cycle)
  if (( cycle <= last )); then
    return 1
  fi
  if (( cycle % BOARD_INTERVAL == 0 )); then
    return 0
  fi
  return 1
}

run_board_meeting() {
  local after_cycle="$1"
  local last_board
  last_board=$(last_board_cycle)
  local board_base
  board_base="$(cat "$BOARD_PROMPT")

Board session after cycle $after_cycle. Last board was after cycle $last_board.

Before writing, run:
  git log --oneline -40
  git diff --stat HEAD~40..HEAD 2>/dev/null || git diff --stat
  pytest apps/api/tests -q
  npm run build

Reward criterion: joy of a truly finished product — not performative agreement or disagreement. You want Razzle yourself."

  echo ""
  echo "################################################################"
  echo "## BOARD MEETING — after cycle $after_cycle (3-model passover) ##"
  echo "################################################################"

  run_cursor_agent "CODEX — Board code audit" "$MODEL_CTO" "$board_base

Role: CODEX (cofounder). Append ## Board — Codex Code Audit (after cycle $after_cycle) to docs/v2/COUNCIL.md.

Full code passover: legacy shims, stubs labeled GREEN, copy-paste debt, dead code, god files, test failures, docs vs reality. Tag each area FINISHED | HALF-DONE | DELETE-CANDIDATE | REFINE-CANDIDATE with file paths and evidence. Do NOT vote yet. Be honest — HALF-DONE hurts users."

  run_cursor_agent "OPUS — Board product audit" "$MODEL_CEO" "$board_base

Role: OPUS (cofounder). Read Codex board audit in COUNCIL.md. Append ## Board — Opus Product Audit (after cycle $after_cycle).

What would you ship to r/DynastyFF today vs hide? Which surfaces feel finished vs embarrassing? Read VOICE.md and DESIGN.md. HALF-DONE is worse than deleted. Do NOT vote yet."

  run_cursor_agent "COMPOSER — Board synthesis draft" "$MODEL_BUILDER" "$board_base

Role: COMPOSER (cofounder). Read both board audits. Append ## Board Meeting — After Cycle $after_cycle with KEEP, DELETE, REFINE tables per docs/v2/BOARD.md. Leave vote columns empty for now. Propose max 3 REFINE priorities. Do NOT execute deletes yet."

  run_cursor_agent "OPUS — Board ratify" "$MODEL_CEO" "Read docs/v2/BOARD.md and ## Board Meeting — After Cycle $after_cycle in COUNCIL.md. Append ### Board Vote — Opus. For each DELETE and REFINE row vote APPROVE | AMEND | REJECT with one-line reason. Criterion: finished-product joy — would you use this Sunday morning? 2/3 APPROVE required for DELETE."

  run_cursor_agent "CODEX — Board ratify" "$MODEL_CTO" "Read board meeting + Opus vote in COUNCIL.md. Append ### Board Vote — Codex. Same format. Independent — do not rubber-stamp Opus. Simplicity wins: deleting bad code is a board victory."

  run_cursor_agent "COMPOSER — Board execute + commit" "$MODEL_BUILDER" "Read all board sections and both votes in COUNCIL.md. Tally 2/3 on each DELETE and REFINE row. Append ### Board Verdict with executed DELETEs and queued REFINEs. Execute ALL approved DELETEs and REFINE quick wins (<30 min). Run pytest + npm run build. git commit -m 'board: after cycle $after_cycle — <summary>'. Update LOOP-STATE.md last_board_cycle:$after_cycle and next_slice from top REFINE. Append results.tsv row (cycle=$after_cycle, slice=board, status=keep). Verify git status clean."

  update_last_board_cycle "$after_cycle"
  echo ""
  echo "=== Board meeting complete (after cycle $after_cycle) ==="
}

log_recovery() {
  local msg="$1"
  mkdir -p "$(dirname "$RECOVERY_LOG")"
  echo "$(date -Iseconds) $msg" >> "$RECOVERY_LOG"
}

tree_is_clean() {
  [[ -z $(git status --porcelain 2>/dev/null) ]]
}

strip_ephemeral_artifacts() {
  rm -f apps/web/tsconfig.tsbuildinfo 2>/dev/null || true
}

unstage_forbidden_paths() {
  git reset HEAD -- .env .env.local .env.production 2>/dev/null || true
  git reset HEAD -- apps/web/tsconfig.tsbuildinfo 2>/dev/null || true
  git reset HEAD -- apps/web/.next 2>/dev/null || true
}

emergency_shell_commit() {
  local cycle="$1"
  echo ""
  echo "========== SURVIVAL — shell emergency commit (cycle ${cycle:-unknown}) =========="
  log_recovery "shell emergency commit start cycle=${cycle:-unknown}"
  strip_ephemeral_artifacts

  if tree_is_clean; then
    log_recovery "shell emergency commit skipped — tree already clean"
    return 0
  fi

  git add -A
  unstage_forbidden_paths

  if git diff --cached --quiet 2>/dev/null; then
    strip_ephemeral_artifacts
    if tree_is_clean; then
      log_recovery "shell emergency commit — only ephemeral artifacts removed"
      return 0
    fi
    log_recovery "shell emergency commit failed — nothing stageable"
    return 1
  fi

  local msg="recovery: auto-commit uncommitted loop work (cycle ${cycle:-unknown})"
  if git commit -m "$msg"; then
    strip_ephemeral_artifacts
    if tree_is_clean; then
      log_recovery "shell emergency commit OK: $msg"
      echo "SURVIVAL OK — shell auto-committed remaining work."
      return 0
    fi
  fi

  log_recovery "shell emergency commit failed — tree still dirty"
  git status -sb
  return 1
}

recover_dirty_tree() {
  local cycle="$1"
  local model="$2"
  echo ""
  echo "COMMIT GATE — working tree dirty. Recovery agent (cycle ${cycle:-unknown}, $model)..."
  git status -sb
  log_recovery "agent recovery start cycle=${cycle:-unknown} model=$model"

  local prompt
  prompt="SURVIVAL RECOVERY — uncommitted work MUST land in git before the loop continues. Do NOT start a new feature slice. Do NOT ask the user. Do NOT stop until git status is clean.

Read docs/v2/PROGRAM.md git commit gate.

1. git status && git diff --stat
2. Commit ALL legitimate work — code, docs, evidence, COUNCIL.md, results.tsv, LOOP-STATE.md
3. Revert only clearly accidental edits (e.g. LOOP-STATE cycle number regressing vs results.tsv)
4. NEVER commit: .env, credentials, tsconfig.tsbuildinfo, .next/, node_modules
5. If pre-commit hook fails: fix the error and commit again — keep trying
6. If only docs/state drift: commit as 'docs: cycle cleanup — <what>'
7. Verify: git status --porcelain MUST be empty
8. Update LOOP-STATE.md last_commit with git rev-parse --short HEAD

Survival rule: losing uncommitted work is worse than an imperfect commit message. Commit first, fix in next cycle if needed."

  run_cursor_agent "Recovery — dirty tree cleanup" "$model" "$prompt"

  strip_ephemeral_artifacts
  if tree_is_clean; then
    log_recovery "agent recovery OK cycle=${cycle:-unknown} model=$model"
    echo "Recovery OK — tree clean."
    return 0
  fi

  log_recovery "agent recovery incomplete cycle=${cycle:-unknown} model=$model"
  echo "Recovery incomplete — tree still dirty."
  git status -sb
  return 1
}

ensure_clean_tree() {
  local cycle="${1:-}"
  tree_is_clean && return 0

  echo ""
  echo "=== SURVIVAL MODE — dirty tree detected; will not exit until clean ==="
  log_recovery "ensure_clean_tree enter cycle=${cycle:-unknown}"

  local round=0
  while ! tree_is_clean; do
    round=$((round + 1))
    local model="${RECOVERY_MODELS[$(( (round - 1) % ${#RECOVERY_MODELS[@]} ))]}"

    echo ""
    echo "=== Commit gate survival round $round (model: $model) ==="
    recover_dirty_tree "$cycle" "$model" || true

    if tree_is_clean; then
      return 0
    fi

    # After every agent pass, try shell emergency commit (artifacts may be the only blocker)
    emergency_shell_commit "$cycle" || true
    if tree_is_clean; then
      return 0
    fi

    echo "Tree still dirty — survival retry round $((round + 1)) (no exit, zero sleep)..."
  done
}

run_chain_forever() {
  local use_steps="${1:-false}"
  echo "=== CHAIN MODE — zero sleep, survival commits, never auto-stops ==="
  echo "Skill: docs/v2/PROGRAM.md | Log: docs/v2/results.tsv | Recovery: docs/v2/recovery.log | Stop: Ctrl+C only"
  trap 'echo ""; echo "Loop stopped."; exit 0' INT TERM

  while true; do
    ensure_clean_tree

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

    if should_run_board "$cycle"; then
      run_board_meeting "$cycle"
      ensure_clean_tree "board-$cycle"
      update_cycle_state "$cycle"
      continue
    fi

    if [[ "$use_steps" == "true" ]]; then
      run_steps_cycle "$cycle"
    else
      run_single_cycle "$cycle"
    fi

    ensure_clean_tree "$cycle"
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
  board)
    ensure_clean_tree
    BOARD_CYCLE=$(grep '^cycle:' "$STATE" | awk '{print $2}')
    run_board_meeting "$BOARD_CYCLE"
    ensure_clean_tree "board-$BOARD_CYCLE"
    ;;
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
      ensure_clean_tree
      run_steps_cycle "$CYCLE"
      ensure_clean_tree "$CYCLE"
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
        ensure_clean_tree
        run_single_cycle "$CYCLE"
        ensure_clean_tree "$CYCLE"
        update_cycle_state "$CYCLE"
        CYCLE=$((CYCLE + 1))
      done
      echo ""
      echo "Done. Check docs/v2/COUNCIL.md, FEATURES.md, git log"
    fi
    ;;
esac
