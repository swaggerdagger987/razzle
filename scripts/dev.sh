#!/usr/bin/env bash
# Razzle dev stack: API on :8000, web on :3000. Run from repo root.
set -euo pipefail
cd "$(dirname "$0")/.."

uv run alembic -c apps/api/alembic.ini upgrade head
uv run uvicorn razzle_api.main:app --reload --port 8000 &
API_PID=$!
trap 'kill $API_PID' EXIT

pnpm --filter web dev
