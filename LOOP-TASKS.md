# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 21 (Migrate Database from Local SQLite to Turso)
- All 5 tasks PASS
- Stage: PHASE GATE
- Next: Commit and push

## Phase 21: Migrate Database from Local SQLite to Turso (Edge SQLite)
**Exit Criterion**: All database reads/writes use Turso (libSQL) instead of local `data/terminal.db`. App reads `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from environment variables. Falls back to local SQLite if env vars are missing (for local dev). The `render.yaml` build command no longer runs adapter scripts to rebuild data on every deploy — data lives in Turso permanently. Add `libsql-experimental` to `requirements.txt`. Push the existing local `terminal.db` data up to Turso as a one-time migration step. All existing endpoints, panels, and queries work identically after the switch.

### Task 1: Add libsql-experimental to requirements.txt + create backend/db.py connection module
**Status**: PASS
**Attempts**: 1
**Notes**: Added `libsql-experimental>=0.0.68` to requirements.txt. Created `backend/db.py` with `get_conn()` that reads `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` env vars, uses libsql when available, falls back to local sqlite3. Single source of truth for DB connections.

### Task 2: Swap get_conn() in live_data.py to use backend/db.py
**Status**: PASS
**Attempts**: 1
**Notes**: `live_data.py` now imports `get_conn` and `DB_PATH` from `backend.db`. Removed old `get_conn()` definition and `DB_PATH` constant. All 100+ call sites unchanged. Verified with `get_filter_options()` query.

### Task 3: Swap get_connection() in all 3 adapters to use Turso-aware connection
**Status**: PASS
**Attempts**: 1
**Notes**: All 3 adapters (nflverse, college, cfbfastr) now try importing `get_conn` from `backend.db` via sys.path, falling back to direct sqlite3 if import fails. PRAGMA settings preserved. Verified all 3 adapters connect successfully.

### Task 4: Create scripts/push_to_turso.py migration script
**Status**: PASS
**Attempts**: 1
**Notes**: Script reads local terminal.db, recreates all tables + indexes in Turso, batch-inserts data (500 rows/batch). Handles ~1M row player_week_metrics table with progress reporting. Idempotent (IF NOT EXISTS, INSERT OR REPLACE).

### Task 5: Update render.yaml — remove adapter rebuild from build command
**Status**: PASS
**Attempts**: 1
**Notes**: buildCommand now just `pip install -r requirements.txt`. No adapter scripts. Data lives in Turso permanently. Bootstrap function in server.py still checks count and skips when data is present.

---

## Phase 20: QA + UX Audit — Auto-Generated Fixes -- COMPLETE
**Status**: All 2 tasks PASS

## Phase 19: Draft Class Tracker -- COMPLETE
**Status**: All 3 tasks PASS

## Phase 18: Remove Prospects Section — Merge into College Filter -- COMPLETE
**Status**: All 4 tasks PASS

## Phase 17: Expand Data to 2015-2025 -- COMPLETE
**Status**: All 4 tasks PASS

## Phase 16: Rename War Room -> Situation Room -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 15: QA + UX Audit for Phases 11-14 -- COMPLETE
**Status**: All 2 tasks PASS

## Phase 14: Prospect Athletic Radar -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 13: Dynasty Rookie Mock Draft -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 12: Panel Export & Shareability -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 11: QA + UX Audit -- Auto-Generated Fixes -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 10: QA + UX Audit -- Auto-Generated Fixes -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 9: Lab Sidebar Intelligence -- COMPLETE
**Status**: All 5 tasks PASS

## Phase 8: QA + UX Audit for Phase 7 -- COMPLETE
**Status**: All 3 tasks PASS

## Phase 7: Lab Polish -- COMPLETE
**Status**: All 8 tasks PASS

## Phase 6: QA + UX Audit -- Auto-Generated Fixes -- COMPLETE
**Status**: All 6 tasks PASS

## Phase 5: College Football Integration -- COMPLETE
**Status**: All 8 tasks PASS
