# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 23 (Dynasty Power Rankings)
- All 3 tasks PASS
- Stage: PHASE GATE
- Next: Commit and push

## Phase 23: Dynasty Power Rankings
**Exit Criterion**: New Lab panel "Power Rankings" in the Teams category. Backend `/api/dynasty-power-rankings` sums dynasty trade values per NFL team, breaks down by position group (QB/RB/WR/TE), and ranks all 32 teams. Frontend panel shows ranked stacked horizontal bar chart (position-colored segments), click team for roster detail card. Season selector. Canvas-drawn bars. Razzle comic-strip design (chunky borders, sand bg, espresso ink).

### Task 1: Backend API — /api/dynasty-power-rankings
**Status**: PASS
**Attempts**: 1
**Acceptance Criteria**:
- Endpoint returns all 32 teams ranked by total dynasty roster value
- Dynasty value computed from trade-value-chart logic (production 50% + age 30% + scarcity 20%)
- Breakdown by position group: QB, RB, WR, TE values per team
- Returns top 3 players per team with individual values
- Season filter parameter
- Min 30 teams returned
**Notes**: 32 teams returned. NO #1 (976.2), CHI last (573.4). League avg 779.6. Position breakdowns and top 3 players per team working.

### Task 2: Frontend Lab panel — stacked bar chart + team cards
**Status**: PASS
**Attempts**: 1
**Acceptance Criteria**:
- Canvas-drawn horizontal stacked bar chart, all 32 teams ranked
- Position-colored segments (QB blue, RB teal, WR terracotta, TE purple)
- Click team → detail card shows top players with individual values
- Season selector dropdown
- Follows DESIGN.md: sand bg, chunky 3px borders, espresso ink, Space Mono for data
- Registered in sidebar under "Teams" category
**Notes**: Canvas chart with DPR-aware rendering, stacked bars with position colors, legend, league average dashed line. Detail card with position breakdown chips and top player table.

### Task 3: Wire up, test end-to-end
**Status**: PASS
**Attempts**: 1
**Acceptance Criteria**:
- Panel loads without JS errors
- Bar chart renders with real data from API
- Click-to-detail works
- Position colors match DESIGN.md
- No XSS, no unescaped user data
- Panel appears in sidebar under Teams
- NFL-only message shows for college mode
**Notes**: JS syntax clean. Server imports clean. All escapeHtml/escapeAttr on user data. Canvas text safe via fillText. NFL-only message registered. Sidebar entry added.

---

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
