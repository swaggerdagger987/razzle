# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 37 (Bake player_season_stats into Adapter Pipeline + Re-upload DB)
## Phase 37: Bake player_season_stats into Adapter Pipeline + Re-upload DB
**Exit Criterion**: player_season_stats creation moved from server boot to nflverse adapter pipeline. Updated terminal.db uploaded to GitHub release data-v1. All 34 smoke tests pass.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
- Next: Phase transition

### Task 1: Add player_season_stats creation to nflverse_adapter.py
**Status**: PASS
**Attempts**: 1
**Notes**: Added DROP TABLE IF EXISTS + CREATE TABLE AS SELECT aggregate after roster sync in main(). Includes all 20 stat columns + 2 indexes. Table rebuilt on every adapter run for freshness.

### Task 2: Re-upload terminal.db to GitHub release data-v1
**Status**: PASS
**Attempts**: 1
**Notes**: Uploaded 541MB DB (up from 512MB) with player_season_stats baked in. Server.py _ensure_season_stats_table() kept as idempotent fallback.

### Task 3: Verify all 34 smoke tests pass
**Status**: PASS
**Attempts**: 1
**Notes**: All 34 tests pass in 13.33s. No regressions.

## Phase 36: Fix Missing player_season_stats Table + stat_value Bug (COMPLETE)
**Exit Criterion**: player_season_stats table created as aggregation from player_week_stats during bootstrap. m.value bug fixed in analytics.py. All affected endpoints return 200. Smoke tests pass.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
- Next: Phase transition

### Task 1: Create player_season_stats table in bootstrap
**Status**: PASS
**Attempts**: 1
**Notes**: Materialized aggregate from player_week_stats. 6,098 rows, 22 columns including offense_snaps/pct. Created in server lifespan if missing.

### Task 2: Fix m.value -> m.stat_value in analytics.py
**Status**: PASS
**Attempts**: 1
**Notes**: Single line fix in fetch_stat_leaders query (analytics.py line 369).

### Task 3: Verify affected endpoints return 200
**Status**: PASS
**Attempts**: 1
**Notes**: Also fixed s.passing_attempts -> s.attempts in td_regression. 5 smoke tests tightened from 500-tolerant to 200-required. All 34 tests pass.

## Phase 35: QA + UX Audit — Fixes for Phases 31-34 (COMPLETE)
**Exit Criterion**: All HIGH findings from QA audit resolved. MEDIUM findings addressed where practical.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE

## Phase 34: Backend Hardening: Production Config + Smoke Tests (COMPLETE)
**Exit Criterion**: render.yaml sets ENVIRONMENT=production. pytest installed. Smoke tests cover all API endpoints.
- Stage: COMPLETE

## Phase 33: Backend Cleanup: Add Structured Logging (COMPLETE)
- Stage: COMPLETE

## Phase 32: Lab QA — Fix Data Loading, Year Bugs, and Reliability (COMPLETE)
- Stage: COMPLETE

## Phase 31: QA + UX Audit — Auto-Generated Fixes (COMPLETE)
- Stage: COMPLETE

## Phase 30: Backend Cleanup: Fix Duplicate Routes + Shared Utils (COMPLETE)
- Stage: COMPLETE
