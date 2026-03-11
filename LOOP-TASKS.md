# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 39 (Critical Bug Fixes — Priority 1)
## Phase 39: Critical Bug Fixes — Priority 1
**Exit Criterion**: Fix the 5 critical + 1 high severity bugs that make core features unusable. NFL screener shows correct year data. NFL/College toggle works without year change. Target Premium, Drop Rate, Matchups, Gamescript panels load. Garbage Time reliably works.

- Task 1: PASS
- Task 2: PASS
- Task 3: PENDING
- Task 4: PENDING
- Task 5: PENDING
- Task 6: PENDING
- Task 7: PENDING
- Stage: IN PROGRESS
- Next: Task 1

### Task 1: Fix NFL screener showing only 2024 data regardless of year
**Status**: PASS
**Attempts**: 1
**Acceptance**: Selecting 2015 shows 2015 players (Antonio Brown, Julio Jones, etc.), 2020 shows 2020 players, etc.

### Task 2: Fix NFL/College toggle not switching without year change
**Status**: PASS
**Attempts**: 1
**Acceptance**: Clicking NFL → College → Prospects each immediately loads the correct data without touching the year dropdown.

### Task 3: Fix Target Premium panel — completely broken
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Target Premium panel loads with data for all available seasons.

### Task 4: Fix Drop Rate Dashboard — completely broken
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Drop Rate panel loads with data for all available seasons.

### Task 5: Fix Matchups panel — broken
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Matchup heatmap loads showing DEF points allowed by position per week.

### Task 6: Fix Gamescript Analysis — completely broken
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Gamescript panel loads showing ahead/behind/close splits for players.

### Task 7: Fix Garbage Time — barely works
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Garbage Time panel reliably identifies garbage time stats across all available seasons.

## Phase 38: Athletic Radar — Prospect Combine Spider Charts (COMPLETE)
**Exit Criterion**: proradar panel renders canvas spider charts of combine percentiles (forty, bench, vertical, broad_jump, cone, shuttle) for any prospect. Select up to 3 prospects to overlay. Position + draft year filters. /api/athletic-radar endpoint returns all prospects with pre-computed percentiles. Sidebar item works end-to-end.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE

### Task 1: Create /api/athletic-radar backend endpoint
**Status**: PASS
**Attempts**: 1
**Acceptance**: GET /api/athletic-radar?position=WR&draft_year=2025 returns JSON with prospects array, each having combine raw values + position percentiles for 6 athletic metrics. Cached with _cached helper. Returns 200 with valid data.

### Task 2: Add proradar panel to lab-panels.js
**Status**: PASS
**Attempts**: 1
**Acceptance**: Panel renders a canvas spider/radar chart with 6 axes (40yd, Bench, Vertical, Broad Jump, Cone, Shuttle). Player search/select to add up to 3 prospects as overlays with position-colored lines. Position tabs + draft year dropdown. Follows DESIGN.md (sand bg, chunky borders, terracotta accent). No frameworks.

### Task 3: End-to-end verification
**Status**: PASS
**Attempts**: 1
**Acceptance**: Click "Athletic Radar" in sidebar → panel loads with default prospects. Select a prospect → radar chart draws. Add a second prospect → overlay works. Change position → data refreshes. No console errors. Design matches comic-strip aesthetic.

## Phase 37: Bake player_season_stats into Adapter Pipeline + Re-upload DB (COMPLETE)
**Exit Criterion**: player_season_stats creation moved from server boot to nflverse adapter pipeline. Updated terminal.db uploaded to GitHub release data-v1. All 34 smoke tests pass.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
