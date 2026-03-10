# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 27 (Backend Cleanup: Split live_data.py into Modules)
- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: EXECUTING
- Next: Task 4

## Phase 27: Backend Cleanup: Split live_data.py into Modules
**Exit Criterion**: `live_data.py` is replaced by a `live_data/` package with logical submodules (e.g., `players.py`, `prospects.py`, `college.py`, `analytics.py`, `cache.py`, `storage.py`). All imports in `server.py` updated. No function lost, no endpoint broken. Each module under 3,000 lines.

### Task 1: Create package structure and proxy __init__.py
**Status**: PASS
**Attempts**: 1
**Notes**: `backend/live_data/` package created. `live_data.py` → `_monolith.py` via git mv. `__init__.py` uses `from ._monolith import *`. Relative import fixed (`..db`). 132 functions accessible. server.py imports clean. db_stats() returns live data (1238 players).

### Task 2: Extract core.py — shared helpers, constants, enrichment functions
**Status**: PASS
**Attempts**: 1
**Notes**: `core.py` (985 lines) contains all shared helpers (_cached, _safe_div), constants (FANTASY_POSITIONS, RATE_METRICS, _STAT_SUM_COLS, TEAM_ABBREV, ABBREV_TO_TEAM), enrichment functions (_enrich_with_derived_stats, _enrich_with_epa_per_play, _enrich_with_rate_metrics, _enrich_with_breakout, _enrich_with_dynasty_value, _enrich_with_pbp_stats, _enrich_with_team_shares, _enrich_prospects_with_college, _enrich_college_derived, _name_variants), trade value model (compute_trade_value, _age_value, _production_value, _scarcity_value, _pick_value), grading/tier functions (_efficiency_grade, _assign_tier, _tv_tier, _roster_grade, _competing_status), and comp finder (_build_stat_vector, _cosine_similarity). _monolith.py imports all from core. All files compile clean.
**Acceptance**: `core.py` contains `_cached`, `_safe_div`, `_enrich_*` functions, `FANTASY_POSITIONS`, `RATE_METRICS`, `_STAT_SUM_COLS`, `TEAM_ABBREV`, `ABBREV_TO_TEAM`, `_DVS_AGE_CURVES`, `_age_multiplier`, `compute_trade_value`, `_age_value`, `_production_value`, `_scarcity_value`, `_pick_value`, `_efficiency_grade`, `_assign_tier`, `_tv_tier`, `_roster_grade`, `_competing_status`, `_build_stat_vector`, `_cosine_similarity`. `_monolith.py` updated to import from core. All files compile.

### Task 3: Extract players.py — NFL player CRUD functions
**Status**: PASS
**Attempts**: 1
**Notes**: `players.py` (1,669 lines) contains all 18 NFL player functions: db_stats, quick_search_players, fetch_players, fetch_screener, get_filter_options, fetch_player_weeks, fetch_player_seasons, fetch_player_profile, fetch_players_compare, fetch_team_roster, fetch_career_stats, fetch_player_percentiles, fetch_player_strengths, fetch_points_breakdown, fetch_game_log, fetch_compare_table, fetch_player_boom_bust, fetch_player_comps. `_monolith.py` imports all from players.py. Original definitions removed. Monolith reduced from 13,744 to 12,020 lines. All files compile clean. Full import chain verified.
**Acceptance**: `players.py` contains `db_stats`, `quick_search_players`, `fetch_players`, `fetch_screener`, `get_filter_options`, `fetch_player_weeks`, `fetch_player_seasons`, `fetch_player_profile`, `fetch_players_compare`, `fetch_team_roster`, `fetch_career_stats`, `fetch_player_percentiles`, `fetch_player_strengths`, `fetch_points_breakdown`, `fetch_game_log`, `fetch_compare_table`, `fetch_player_boom_bust`, `fetch_player_comps`. `_monolith.py` updated. All files compile.

### Task 4: Extract prospects.py and college.py
**Status**: PENDING
**Attempts**: 0
**Acceptance**: `prospects.py` contains all `fetch_prospect*` + `fetch_draft_class*` + prospect helpers. `college.py` contains all `fetch_college_*` functions + college helpers. `_monolith.py` updated. All files compile.

### Task 5: Extract dynasty.py and storage.py
**Status**: PENDING
**Attempts**: 0
**Acceptance**: `dynasty.py` contains dynasty rankings, trade values, trade finder, trade value chart, dynasty dashboard, tier list, power rankings, roster value/grade, pick values, auction values. `storage.py` contains formula store, waitlist, analytics logging functions + init functions. `_monolith.py` updated. All files compile.

### Task 6: Extract analytics.py and tools.py — remaining functions, delete monolith
**Status**: PENDING
**Attempts**: 0
**Acceptance**: All remaining functions split between `analytics.py` (analytical dashboards) and `tools.py` (utility endpoints). `_monolith.py` deleted. `__init__.py` updated with explicit re-exports from all submodules. `server.py` unchanged (still uses `live_data.func()`). Every function accounted for. Each module under 3,000 lines. Python compiles clean.

---

## Phase 26: Backend Cleanup: Connection Management -- COMPLETE
**Status**: All 4 tasks PASS

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
