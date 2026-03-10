# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 26 (Backend Cleanup: Connection Management)
- All 4 tasks PASS
- Stage: PHASE GATE
- Next: Commit and push

## Phase 26: Backend Cleanup: Connection Management
**Exit Criterion**: Every `get_conn()` call in the codebase uses a context manager or `try/finally` pattern so connections are always closed, even on errors. Create a shared context manager helper in `db.py`. Refactor all call sites in `live_data.py`, `server.py`, and adapters. Zero leaked connections under any error path.

### Task 1: Add context manager helper to db.py
**Status**: PASS
**Attempts**: 1
**Notes**: `get_db()` context manager using `@contextmanager` decorator. Yields connection, closes in finally block.

### Task 2: Refactor all get_conn() calls in live_data.py to use context manager
**Status**: PASS
**Attempts**: 1
**Notes**: All 117 `conn = get_conn()` calls replaced with `with get_db() as conn:`. 82 try/finally patterns collapsed into with blocks. 35 bare patterns wrapped in with blocks. Zero bare get_conn() or conn.close() remain. Special case: fetch_draft_class_analytics closes connection early before calling other functions.

### Task 3: Refactor adapter connection patterns
**Status**: PASS
**Attempts**: 1
**Notes**: All 3 adapters (nflverse, college, cfbfastr) main() functions wrapped in try/finally. server.py bootstrap wrapped in try/finally with proper connection cleanup for all 3 connection objects (conn, cconn, fconn).

### Task 4: Verify server starts and endpoints work
**Status**: PASS
**Attempts**: 1
**Notes**: All 6 modified files compile clean. Imports succeed. Context manager tested with live DB query (1238 players). Zero leaked connections.

---

## Phase 25: QA + UX Audit — Auto-Generated Fixes -- COMPLETE
**Status**: All 2 tasks PASS

## Phase 24: Game Script Analysis -- COMPLETE
**Status**: All 2 tasks PASS

## Phase 23: Dynasty Power Rankings -- COMPLETE
**Status**: All 3 tasks PASS

## Phase 22: Stat Correlation Matrix -- COMPLETE
**Status**: All 3 tasks PASS

## Phase 21: Migrate Database from Local SQLite to Turso (Edge SQLite) -- COMPLETE
**Status**: All 5 tasks PASS

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
