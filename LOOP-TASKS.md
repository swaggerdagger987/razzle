# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 38 (Athletic Radar — Prospect Combine Spider Charts)
## Phase 38: Athletic Radar — Prospect Combine Spider Charts
**Exit Criterion**: proradar panel renders canvas spider charts of combine percentiles (forty, bench, vertical, broad_jump, cone, shuttle) for any prospect. Select up to 3 prospects to overlay. Position + draft year filters. /api/athletic-radar endpoint returns all prospects with pre-computed percentiles. Sidebar item works end-to-end.

- Task 1: PASS
- Task 2: PASS
- Task 3: PENDING
- Stage: IN PROGRESS
- Next: Task 3

### Task 1: Create /api/athletic-radar backend endpoint
**Status**: PASS
**Attempts**: 1
**Acceptance**: GET /api/athletic-radar?position=WR&draft_year=2025 returns JSON with prospects array, each having combine raw values + position percentiles for 6 athletic metrics. Cached with _cached helper. Returns 200 with valid data.

### Task 2: Add proradar panel to lab-panels.js
**Status**: PASS
**Attempts**: 1
**Acceptance**: Panel renders a canvas spider/radar chart with 6 axes (40yd, Bench, Vertical, Broad Jump, Cone, Shuttle). Player search/select to add up to 3 prospects as overlays with position-colored lines. Position tabs + draft year dropdown. Follows DESIGN.md (sand bg, chunky borders, terracotta accent). No frameworks.

### Task 3: End-to-end verification
**Status**: PENDING
**Attempts**: 0
**Acceptance**: Click "Athletic Radar" in sidebar → panel loads with default prospects. Select a prospect → radar chart draws. Add a second prospect → overlay works. Change position → data refreshes. No console errors. Design matches comic-strip aesthetic.

## Phase 37: Bake player_season_stats into Adapter Pipeline + Re-upload DB (COMPLETE)
**Exit Criterion**: player_season_stats creation moved from server boot to nflverse adapter pipeline. Updated terminal.db uploaded to GitHub release data-v1. All 34 smoke tests pass.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
