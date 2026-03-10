# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 30 (Backend Cleanup: Fix Duplicate Routes + Shared Utils)
## Phase 30: Backend Cleanup: Fix Duplicate Routes + Shared Utils
**Exit Criterion**: Duplicate routes for aging_curves and td_regression in server.py removed. normalize_name() extracted to shared utils.py. Push script optimized.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
- Next: Phase transition (QA+UX audit — Phase 30 is multiple of 5)

### Task 1: Remove duplicate route definitions in server.py
**Status**: PASS
**Attempts**: 1
**Notes**: Removed old /api/aging-curves (no error handling) and duplicate /api/td-regression. Kept versions with try-except.

### Task 2: Extract normalize_name() to shared utils.py
**Status**: PASS
**Attempts**: 1
**Notes**: Created adapters/utils.py. Updated nflverse_adapter.py and cfbfastr_adapter.py to import from utils.

### Task 3: Optimize push_to_turso.py batch inserts
**Status**: PASS
**Attempts**: 1
**Notes**: Added BEGIN/COMMIT transaction wrapping per batch. Batch size increased from 500 to 1000.

## Phase 29: Expand Data to 2015-2025 + Full College Stats
**Exit Criterion**: terminal.db contains NFL player data for ALL seasons 2015-2025. College football stats cover all available years. Database rebuilt locally. Upload to GitHub release.

### Task 1: Run nflverse adapter for full 2015-2025 range
**Status**: PASS
**Attempts**: 1
**Notes**: Ran for 2015-2019, then 2020-2023 for PBP gap. NFL player_week_stats: 54,479 rows (2015-2024). PBP: 6,666 rows (2015-2025). 2025 NFL season not yet available.

### Task 2: Verify college data and run other adapters
**Status**: PASS
**Attempts**: 1
**Notes**: CFB already covered 2015-2025 (31,039 rows). combine_data (2,413) and draft_picks (1,549) already complete.

### Task 3: Verify row counts and upload DB
**Status**: PASS
**Attempts**: 1
**Notes**: DB 515 MB. Uploaded to data-v1 release. player_week_stats up from 28,026 to 54,479. PBP up from 615 to 6,666. player_week_metrics: 2,059,712.

## Phase 28: Backend Cleanup: Add Caching to Popular Endpoints
**Exit Criterion**: All frequently-hit read endpoints (dynasty rankings, trade values, tier lists, stat leaders, filter options, featured) use the existing TTL cache pattern. Cache TTL of 5 minutes for volatile data, 60 minutes for stable data. At least 30 endpoints cached. Cache invalidates correctly on universe/season change.

### Task 1: Audit existing cache usage and identify all cacheable endpoints
**Status**: PASS
**Attempts**: 1
**Notes**: Found only 2 cached functions (fetch_featured, get_filter_options). Added TTL parameter to _cached() in core.py. _CACHE_TTL_STABLE=3600 for stable data.

### Task 2: Add _cached() calls to analytics.py endpoints
**Status**: PASS
**Attempts**: 1
**Notes**: All 14 functions cached. aging_curves + stat_explorer use 60-min TTL. Rest use 5-min default. Cache keys include all params.

### Task 3: Add _cached() calls to dashboards.py endpoints
**Status**: PASS
**Attempts**: 1
**Notes**: All 9 functions cached. stat_correlations uses 60-min TTL. Rest use 5-min default.

### Task 4: Add _cached() calls to tools.py endpoints
**Status**: PASS
**Attempts**: 1
**Notes**: 27 functions cached (fetch_featured already cached, _fetch_featured_uncached skipped). records/draft_class/draft_class_tracker/archetypes use 60-min TTL. Rest use 5-min default.

### Task 5: Add _cached() to remaining uncached functions in players.py, dynasty.py, prospects.py, college.py
**Status**: PASS
**Attempts**: 1
**Notes**: players.py (17 functions), dynasty.py (11 functions), prospects.py (8 functions), college.py (20 functions) all cached. 108 total cached endpoints across all modules. Write functions excluded. Python compiles clean. server.py imports clean.

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
**Status**: PASS
**Attempts**: 1
**Notes**: `prospects.py` (881 lines) contains 9 functions: fetch_prospects, fetch_prospect_years, fetch_prospect_profile, _fetch_college_for_prospect, fetch_prospect_comps, fetch_prospect_tiers, fetch_prospects_compare, fetch_prospect_scores, fetch_draft_class_analytics. `college.py` (2,300 lines) contains 20 functions: fetch_college_players, fetch_college_player_profile, fetch_college_filter_options, fetch_college_breakouts, fetch_college_efficiency, fetch_college_leaders, fetch_college_trends, fetch_college_rankings, fetch_college_streaks, fetch_college_stock_watch, fetch_college_scarcity, fetch_college_consistency, fetch_college_workload, fetch_college_dual_threat, fetch_college_snap_efficiency, fetch_college_aging_curves, fetch_college_records, fetch_college_season_recap, fetch_college_season_awards, fetch_college_stat_explorer. Plus 9 module-level constants (_CFB_*). Monolith reduced from 12,020 to 8,883 lines. All files compile clean. Full import chain verified.
**Acceptance**: `prospects.py` contains all `fetch_prospect*` + `fetch_draft_class*` + prospect helpers. `college.py` contains all `fetch_college_*` functions + college helpers. `_monolith.py` updated. All files compile.

### Task 5: Extract dynasty.py and storage.py
**Status**: PASS
**Attempts**: 1
**Notes**: `dynasty.py` (1,144 lines) contains 11 functions: fetch_trade_values, fetch_pick_values, fetch_roster_value, fetch_dynasty_rankings, fetch_trade_value_chart, fetch_trade_finder, fetch_roster_grade, fetch_auction_values, fetch_dynasty_dashboard, fetch_tier_list, fetch_dynasty_power_rankings. Plus _TIER_BREAKS constant. `storage.py` (339 lines) contains 11 functions: init_waitlist_table, add_to_waitlist, init_formula_store_tables, _seed_formula_store, publish_formula, fetch_formula_store, get_formula_detail, rate_formula, _init_analytics_table, log_pageview, get_analytics_summary. Monolith reduced from 8,883 to 7,464 lines. All files compile clean. Full import chain verified.
**Acceptance**: `dynasty.py` contains dynasty rankings, trade values, trade finder, trade value chart, dynasty dashboard, tier list, power rankings, roster value/grade, pick values, auction values. `storage.py` contains formula store, waitlist, analytics logging functions + init functions. `_monolith.py` updated. All files compile.

### Task 6: Extract analytics.py, dashboards.py, and tools.py — remaining functions, delete monolith
**Status**: PASS
**Attempts**: 1
**Notes**: `analytics.py` (2,252 lines, 14 functions: heatmap, stat_leaders, scarcity, breakouts, buy_sell, stat_explorer, aging_curves, weekly_heatmap, target_distribution, matchup_heatmap, usage_trends, yoy, air_yards, redzone). `dashboards.py` (2,011 lines, 9 functions: efficiency, consistency, SOS, stock_watch, opportunity, report_cards, season_awards, vorp, stat_correlations). `tools.py` (2,926 lines, 29 functions: featured, scoring_comparison, cheat_sheet, archetypes, draft_class, weekly_leaders, pace_tracker, streaks, season_recap, records, waivers, playoff_schedule, fpts_breakdown, garbage_time, snap_efficiency, handcuffs, weekly_mvp, stacks, positional_advantage, td_regression, dual_threat, season_pace, target_premium, workload_monitor, drop_rate, success_rate, game_script, draft_class_tracker). `_monolith.py` deleted. `__init__.py` updated with explicit re-exports from all 9 submodules (131 total exports). Two dead duplicate definitions dropped (old fetch_aging_curves, old fetch_td_regression). All modules under 3,000 lines. Python compiles clean. server.py imports clean.
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
