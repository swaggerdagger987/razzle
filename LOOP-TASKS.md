# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 18 (Remove Prospects Section — Merge into College)
- All 4 tasks PASS
- Stage: PHASE GATE
- Next: Commit and push

## Phase 18: Remove Prospects Section — Merge into College Filter
**Exit Criterion**: The standalone Prospects universe button is removed. Prospect data (combine metrics, athletic profiles, radar charts) is accessible as a sub-view within the College section. Users toggle between "Season Stats" and "Draft Prospects" within College mode. Mock Draft and Athletic Radar panels remain accessible.

### Task 1: Replace 3-way universe toggle with 2-way + College sub-view
**Status**: PASS
**Attempts**: 1
**Notes**: Removed Prospects button. Added College sub-toggle (Season Stats / Draft Prospects). CSS for .college-sub-toggle and .college-view-btn. setCollegeView() function added.

### Task 2: Route prospect logic through College universe
**Status**: PASS
**Attempts**: 1
**Notes**: Added isProspectView() helper. Replaced all state.universe==="prospects" checks with isProspectView(). setUniverse maps legacy "prospects" to college+prospects sub-view. URL state uses cv=prospects param.

### Task 3: Move prospect panels to College sidebar category
**Status**: PASS
**Attempts**: 1
**Notes**: Renamed sidebar category from "Prospects & College" to "College". Panels (Big Board, Mock Draft, Athletic Radar) are self-contained with own API calls — no universe dependency.

### Task 4: Remove prospects.html and clean up dead references
**Status**: PASS
**Attempts**: 1
**Notes**: Updated prospects.html redirect to use ?u=college&cv=prospects. Updated 4 index.html links. Fixed charts.js, saved views, and checkbox accent-color references. All legacy "prospects" universe handled.

---

## Phase 17: Expand Data to 2015-2025 -- COMPLETE
**Status**: All 4 tasks PASS

## Phase 16: Rename War Room -> Situation Room -- COMPLETE
**Exit Criterion**: Both NFL and college data adapters fetch and load seasons 2015 through 2025 into terminal.db. The Lab's year/season filters reflect all available years. All screener queries, panels, and charts work correctly across the full 2015-2025 range. Currently only 2024 data is loaded — this must cover all 11 seasons.

### Task 1: Update NFL adapter default seasons to 2015-current
**Status**: PASS
**Attempts**: 1
**Notes**: Changed `main()` default from `[current_nfl_season()]` to `list(range(2015, current_nfl_season() + 1))`. CLI `--seasons` override still works.

### Task 2: Update render.yaml build command to include 2025 season
**Status**: PASS
**Attempts**: 1
**Notes**: Added 2025 to NFL adapter seasons list in render.yaml buildCommand. College adapter already had 2025.

### Task 3: Fix hardcoded 2024 season fallbacks in frontend
**Status**: PASS
**Attempts**: 1
**Notes**: lab.js fallbacks now use dynamic `_nflYear` (month >= 7 ? year : year - 1). index.html college link stripped of hardcoded `&season=2024`. Display-only `|| "2024"` replaced with `|| "Latest"`.

### Task 4: Verify standalone pages use dynamic season data from API
**Status**: PASS
**Attempts**: 1
**Notes**: All 37+ standalone HTML pages confirmed using dynamic `data.available_seasons` from API endpoints. No hardcoded season values in any standalone page. Backend `get_filter_options` and `fetch_college_filter_options` query `DISTINCT season` from DB.

---

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
