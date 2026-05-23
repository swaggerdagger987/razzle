#!/usr/bin/env bash
# Kill stale dev servers and boot API + Next from repo root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti ":$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "Killing stale process on :$port ($pids)"
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}

kill_port 3000
kill_port 8000

echo "Starting API on :8000..."
JWT_SECRET=dev .venv-v2/bin/uvicorn apps.api.main:app --reload --port 8000 --app-dir . &
API_PID=$!

echo "Starting web on :3000..."
npm run dev &
WEB_PID=$!

trap 'kill $API_PID $WEB_PID 2>/dev/null; exit' INT TERM

echo ""
echo "Stack booting. Wait for 'Ready', then open:"
echo "  http://localhost:3000/explore"
echo ""
echo "Ctrl+C stops both."

wait
