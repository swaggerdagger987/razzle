# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 25 (QA + UX Audit — Auto-Generated Fixes)
- All tasks PENDING
- Stage: BUILD
- Next: Task 1

## Phase 25: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All HIGH and MEDIUM findings from QA+UX audit (Phases 20-24) resolved. powerrankings added to NFL_ONLY_PANELS. stat-correlations endpoint wrapped in try-except. URL encoding fixes for correlations and draft tracker. Tooltip title attributes added to new panel table headers. Game Script table mobile overflow fixed.

### Task 1: Fix HIGH — NFL_ONLY_PANELS + stat-correlations error handling
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- 'powerrankings' added to NFL_ONLY_PANELS array in lab.js
- /api/stat-correlations endpoint wrapped in try-except with JSONResponse error
- Both fixes verified (no syntax errors)

### Task 2: Fix HIGH + MEDIUM — URL encoding + tooltips + mobile overflow
**Status**: PENDING
**Attempts**: 0
**Acceptance Criteria**:
- encodeURIComponent() added to x_stat/y_stat in correlations panel
- encodeURIComponent() added to position param in draft tracker panel
- title attributes added to Game Script table headers (GT% = "Garbage Time %", Avg Diff = "Average Score Differential")
- title attributes added to correlations panel abbreviations
- overflow-x:auto wrapper added for Game Script tables on mobile
- All changes verified (JS syntax clean)

---

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
