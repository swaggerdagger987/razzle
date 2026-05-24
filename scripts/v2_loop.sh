#!/usr/bin/env bash
# Razzle V2 — Cofounder Loop (Cursor credits, NOT Claude CLI)
#
# ONE INSTANCE ONLY — run board + feature cycles in a single terminal:
#   ./scripts/v2_loop.sh --continuous
#
# Usage:
#   ./scripts/v2_loop.sh --continuous     # NEVER STOPS — board every 10 cycles (recommended)
#   ./scripts/v2_loop.sh --board          # board only (do NOT run while --continuous is up)
#   ./scripts/v2_loop.sh                  # 1 cycle
#   ./scripts/v2_loop.sh 25               # 25 cycles then exit
#   ./scripts/v2_loop.sh --steps 25       # 3-model split, 25 cycles

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
MODEL_GEMINI="${RAZZLE_MODEL_GEMINI:-gemini-3.1-pro}"
RECOVERY_LOG="$ROOT/docs/v2/recovery.log"
BOARD_LOCK="$ROOT/docs/v2/.board-lock"
LOOP_LOCKDIR="$ROOT/docs/v2/.loop.lock.d"
RECOVERY_MODELS=("$MODEL_CTO" "$MODEL_CEO" "$MODEL_BUILDER" "$MODEL_GEMINI")
PUSH_REMOTE="${RAZZLE_PUSH_REMOTE:-origin}"
PUSH_BRANCH="${RAZZLE_PUSH_BRANCH:-}"
PUSH_RETRIES="${RAZZLE_PUSH_RETRIES:-3}"

# Appended to EVERY board agent prompt — agents must never stall the board
BOARD_NEVER_STOP="
BOARD RULES (non-negotiable):
- NEVER ask the user for direction. NEVER say you are blocked waiting for human input.
- If git status is dirty after your work: git add -A, unstage .env/.next/tsbuildinfo, git commit, git push, verify clean.
- Unrelated file changes from a parallel loop are NOT your problem — commit ALL legitimate work anyway.
- Do your assigned section only, then stop. The shell handles tree hygiene between steps."

usage() {
  cat <<EOF
Usage: ./scripts/v2_loop.sh --continuous   # ONE terminal — features + board every ${BOARD_INTERVAL} cycles
       ./scripts/v2_loop.sh --board         # board only (stop --continuous first)
       ./scripts/v2_loop.sh [cycles]

Do NOT run --continuous and --board in separate terminals — git races kill the board.
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

# ── Single-instance lock (prevents board vs continuous git races) ─────────────

release_loop_lock() {
  rm -rf "$LOOP_LOCKDIR"
}

acquire_loop_lock() {
  if [[ -d "$LOOP_LOCKDIR" ]]; then
    local oldpid
    oldpid=$(cat "$LOOP_LOCKDIR/pid" 2>/dev/null || echo "")
    if [[ -n "$oldpid" ]] && kill -0 "$oldpid" 2>/dev/null; then
      echo ""
      echo "ERROR: Another v2_loop.sh is already running (pid $oldpid)."
      echo "Do NOT start --board in a second terminal while --continuous runs."
      echo "Board meetings run automatically inside --continuous every ${BOARD_INTERVAL} cycles."
      exit 1
    fi
    echo "Removing stale loop lock (pid $oldpid dead)"
    rm -rf "$LOOP_LOCKDIR"
  fi
  mkdir "$LOOP_LOCKDIR"
  echo $$ > "$LOOP_LOCKDIR/pid"
  trap 'release_loop_lock' EXIT
}

acquire_loop_lock

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

release_board_lock() {
  rm -f "$BOARD_LOCK"
}

acquire_board_lock() {
  echo "board $$ $(date -Iseconds)" > "$BOARD_LOCK"
}

board_section_exists() {
  local heading="$1"
  grep -qF "$heading" "$ROOT/docs/v2/COUNCIL.md" 2>/dev/null
}

board_verdict_complete() {
  local after_cycle="$1"
  board_section_exists "### Board Verdict (after cycle $after_cycle)"
}

should_run_board() {
  local cycle="$1"
  local last
  last=$(last_board_cycle)
  if board_verdict_complete "$cycle"; then
    return 1
  fi
  if (( cycle <= last )); then
    # last_board recorded but verdict missing — board was interrupted, re-run
    return 0
  fi
  if (( (cycle - last) >= BOARD_INTERVAL )); then
    return 0
  fi
  if (( cycle / BOARD_INTERVAL > last / BOARD_INTERVAL )); then
    return 0
  fi
  return 1
}

run_board_agent() {
  local title="$1"
  local model="$2"
  local prompt="$3"
  local after_cycle="$4"
  ensure_clean_tree "board-pre-$after_cycle"
  run_cursor_agent "$title" "$model" "$prompt${BOARD_NEVER_STOP}"
  ensure_clean_tree "board-post-$after_cycle"
}

run_board_meeting() {
  local after_cycle="$1"
  local last_board
  last_board=$(last_board_cycle)

  if board_verdict_complete "$after_cycle"; then
    echo "Board already complete for cycle $after_cycle."
    update_last_board_cycle "$after_cycle"
    return 0
  fi

  acquire_board_lock

  local board_base
  board_base="$(cat "$BOARD_PROMPT")

Board session after cycle $after_cycle. Last board was after cycle $last_board.

Before writing, run:
  git log --oneline -40
  git diff --stat HEAD~40..HEAD 2>/dev/null || git diff --stat
  ./.venv-v2/bin/pytest apps/api/tests -q
  npm run build"

  echo ""
  echo "####################################################################"
  echo "## BOARD MEETING — after cycle $after_cycle (4-model — MANDATORY)  ##"
  echo "####################################################################"

  if ! board_section_exists "## Board — Codex Code Audit (after cycle $after_cycle)"; then
    run_board_agent "CODEX — Board code audit" "$MODEL_CTO" "$board_base

Role: CODEX. Append ## Board — Codex Code Audit (after cycle $after_cycle) to docs/v2/COUNCIL.md.
Tag FINISHED | HALF-DONE | DELETE-CANDIDATE | REFINE-CANDIDATE with paths. No vote yet." "$after_cycle"
  else
    echo "✓ Codex audit present"
  fi

  if ! board_section_exists "## Board — Opus Product Audit (after cycle $after_cycle)"; then
    run_board_agent "OPUS — Board product audit" "$MODEL_CEO" "$board_base

Role: OPUS. Read Codex audit. Append ## Board — Opus Product Audit (after cycle $after_cycle). Ship vs hide. No vote yet." "$after_cycle"
  else
    echo "✓ Opus audit present"
  fi

  if ! board_section_exists "## Board — Gemini Priority Audit (after cycle $after_cycle)"; then
    run_board_agent "GEMINI — Board priority audit" "$MODEL_GEMINI" "$board_base

Role: GEMINI (independent). Read Codex + Opus audits. Append ## Board — Gemini Priority Audit (after cycle $after_cycle).
Tag PRIORITY-HIT | PRIORITY-MISS | SCOPE-CREEP | NORTH-STAR-DRIFT. Top 3 things users need that we are NOT building. No vote yet." "$after_cycle"
  else
    echo "✓ Gemini audit present"
  fi

  if ! board_section_exists "## Board Meeting — After Cycle $after_cycle"; then
    run_board_agent "COMPOSER — Board synthesis" "$MODEL_BUILDER" "$board_base

Role: COMPOSER. Read all three audits. Append ## Board Meeting — After Cycle $after_cycle with KEEP/DELETE/REFINE tables. Vote columns empty. Max 3 REFINE. No execution yet." "$after_cycle"
  else
    echo "✓ Synthesis present"
  fi

  if ! board_section_exists "### Board Vote — Opus (after cycle $after_cycle)"; then
    run_board_agent "OPUS — Board ratify" "$MODEL_CEO" "Read ## Board Meeting — After Cycle $after_cycle. Append ### Board Vote — Opus (after cycle $after_cycle). APPROVE|AMEND|REJECT each row. DELETE needs 3/4." "$after_cycle"
  else
    echo "✓ Opus vote present"
  fi

  if ! board_section_exists "### Board Vote — Codex (after cycle $after_cycle)"; then
    run_board_agent "CODEX — Board ratify" "$MODEL_CTO" "Read board meeting + Opus vote. Append ### Board Vote — Codex (after cycle $after_cycle). Independent. DELETE needs 3/4." "$after_cycle"
  else
    echo "✓ Codex vote present"
  fi

  if ! board_section_exists "### Board Vote — Gemini (after cycle $after_cycle)"; then
    run_board_agent "GEMINI — Board ratify" "$MODEL_GEMINI" "Read board meeting + votes. Append ### Board Vote — Gemini (after cycle $after_cycle). Priority lens. DELETE needs 3/4." "$after_cycle"
  else
    echo "✓ Gemini vote present"
  fi

  local attempt=0
  while ! board_verdict_complete "$after_cycle"; do
    attempt=$((attempt + 1))
    echo ""
    echo "=== Board execute attempt $attempt ==="
    run_board_agent "COMPOSER — Board execute + commit" "$MODEL_BUILDER" "Read ALL board sections for cycle $after_cycle. Tally 3/4 on DELETE/REFINE. Append ### Board Verdict (after cycle $after_cycle). Execute approved DELETEs + quick REFINEs. pytest + npm run build. git commit -m 'board: after cycle $after_cycle — <summary>'. Set LOOP-STATE last_board_cycle:$after_cycle. Log results.tsv. Tree MUST be clean." "$after_cycle"
    if (( attempt >= 5 )); then
      echo "Board execute failed after 5 attempts — shell emergency commit"
      emergency_shell_commit "board-$after_cycle" || true
      break
    fi
  done

  update_last_board_cycle "$after_cycle"
  release_board_lock
  push_to_github "board-$after_cycle"
  echo ""
  echo "=== Board meeting complete (after cycle $after_cycle) ==="
}

log_recovery() {
  local msg="$1"
  mkdir -p "$(dirname "$RECOVERY_LOG")"
  echo "$(date -Iseconds) $msg" >> "$RECOVERY_LOG"
}

current_push_branch() {
  if [[ -n "$PUSH_BRANCH" ]]; then
    echo "$PUSH_BRANCH"
  else
    git branch --show-current 2>/dev/null || true
  fi
}

push_to_github() {
  local context="${1:-loop}"
  local branch
  branch=$(current_push_branch)
  if [[ -z "$branch" ]]; then
    echo "WARN: no git branch — skip push ($context)" >&2
    return 0
  fi

  local ahead=0
  if git rev-parse "@{upstream}" >/dev/null 2>&1; then
    ahead=$(git rev-list --count "@{upstream}..HEAD" 2>/dev/null || echo "0")
  else
    ahead=$(git rev-list --count HEAD 2>/dev/null || echo "1")
  fi

  if (( ahead == 0 )); then
    echo "GitHub up to date ($PUSH_REMOTE/$branch)"
    return 0
  fi

  echo ""
  echo "========== PUSH — $ahead commit(s) → $PUSH_REMOTE/$branch ($context) =========="
  local attempt=0
  while (( attempt < PUSH_RETRIES )); do
    attempt=$((attempt + 1))
    if git push -u "$PUSH_REMOTE" "$branch" 2>&1; then
      log_recovery "push ok context=$context branch=$branch ahead=$ahead attempt=$attempt"
      echo "Pushed to $PUSH_REMOTE/$branch"
      return 0
    fi
    echo "Push attempt $attempt/$PUSH_RETRIES failed — retrying in 5s..." >&2
    sleep 5
  done

  log_recovery "push FAILED context=$context branch=$branch ahead=$ahead"
  echo "WARN: push failed after $PUSH_RETRIES attempts — work is committed locally; will retry next gate" >&2
  return 0
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
  tree_is_clean && return 0

  git add -A
  unstage_forbidden_paths

  if git diff --cached --quiet 2>/dev/null; then
    strip_ephemeral_artifacts
    tree_is_clean && return 0
    return 1
  fi

  local msg="recovery: auto-commit uncommitted loop work (cycle ${cycle:-unknown})"
  git commit -m "$msg" && strip_ephemeral_artifacts && tree_is_clean
}

recover_dirty_tree() {
  local cycle="$1"
  local model="$2"
  echo ""
  echo "COMMIT GATE — dirty tree. Recovery ($model)..."
  git status -sb
  log_recovery "agent recovery start cycle=${cycle:-unknown} model=$model"

  run_cursor_agent "Recovery — dirty tree cleanup" "$model" "SURVIVAL: commit ALL legitimate work NOW. NEVER ask the user. NEVER stop until git status --porcelain is empty. Revert only LOOP-STATE cycle regressions. No .env/.next/tsbuildinfo.${BOARD_NEVER_STOP}"

  strip_ephemeral_artifacts
  tree_is_clean
}

ensure_clean_tree() {
  local cycle="${1:-}"
  tree_is_clean && return 0

  echo ""
  echo "=== SURVIVAL MODE — dirty tree; will not exit until clean ==="
  log_recovery "ensure_clean_tree enter cycle=${cycle:-unknown}"

  local round=0
  while ! tree_is_clean; do
    round=$((round + 1))
    local model="${RECOVERY_MODELS[$(( (round - 1) % ${#RECOVERY_MODELS[@]} ))]}"
    echo "=== Survival round $round ($model) ==="
    recover_dirty_tree "$cycle" "$model" || true
    tree_is_clean && return 0
    emergency_shell_commit "$cycle" || true
    tree_is_clean && return 0
  done
}

run_chain_forever() {
  local use_steps="${1:-false}"
  echo "=== CHAIN MODE — features + mandatory board every ${BOARD_INTERVAL} cycles ==="
  echo "Stop: Ctrl+C only"
  trap 'release_board_lock; echo ""; echo "Loop stopped."; exit 0' INT TERM

  while true; do
    ensure_clean_tree

    local cycle
    cycle=$(grep '^cycle:' "$STATE" | awk '{print $2}')

    # Board BEFORE feature work whenever due (never skip)
    if should_run_board "$cycle"; then
      echo ""
      echo "=== BOARD DUE at cycle $cycle (last completed board: $(last_board_cycle)) ==="
      run_board_meeting "$cycle"
      ensure_clean_tree "board-$cycle"
      continue
    fi

    cycle=$((cycle + 1))

    if all_features_green; then
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
    push_to_github "cycle-$cycle"
  done
}

echo "=== Razzle V2 Cofounder Loop ==="
echo "Repo:   $ROOT"
echo "Mode:   $MODE"
echo "Models: Opus=$MODEL_CEO  Codex=$MODEL_CTO  Composer=$MODEL_BUILDER  Gemini=$MODEL_GEMINI"
echo "=================================================="

case "$MODE" in
  board)
    ensure_clean_tree
    BOARD_CYCLE=$(grep '^cycle:' "$STATE" | awk '{print $2}')
    run_board_meeting "$BOARD_CYCLE"
    ensure_clean_tree "board-$BOARD_CYCLE"
    push_to_github "board-$BOARD_CYCLE"
    ;;
  continuous|steps-continuous)
    if [[ "$MODE" == "steps-continuous" ]]; then
      run_chain_forever true
    else
      run_chain_forever false
    fi
    ;;
  steps)
    CYCLE=$(grep '^cycle:' "$STATE" | awk '{print $2}')
    CYCLE=$((CYCLE + 1))
    for ((i=1; i<=CYCLES; i++)); do
      ensure_clean_tree
      run_steps_cycle "$CYCLE"
      ensure_clean_tree "$CYCLE"
      update_cycle_state "$CYCLE"
      push_to_github "steps-cycle-$CYCLE"
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
        push_to_github "cycle-$CYCLE"
        CYCLE=$((CYCLE + 1))
      done
    fi
    ;;
esac
