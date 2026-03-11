# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 48 (Screener Sparkline Column)
## Phase 48: Screener Sparkline Column — Weekly Fantasy Points Trend
**Exit Criterion**: The screener table has a toggleable "Trend" column showing inline SVG sparklines of weekly fantasy points (PPR) for each player. Sparklines color-coded green (trending up) or terracotta (trending down). Backend batch endpoint returns weekly scoring arrays efficiently. Column visible by default in PPR and Dynasty presets.

- Task 1: PASS
- Task 2: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Backend /api/screener/sparklines batch endpoint
**Status**: PASS
**Attempts**: 1
**Acceptance**: POST /api/screener/sparklines accepts { player_ids: [...], season: 2024 } and returns { sparklines: { "player_id": [w1_pts, w2_pts, ...], ... } }. Batch query (single SQL) fetches weekly fantasy_points_ppr for up to 200 players. Cached with _cached helper. Returns 200 with valid data for known players, empty arrays for unknowns.
**Result**: Added fetch_screener_sparklines() to players.py. Single SQL query with IN clause, up to 200 players. Cached with _cached. Route registered at POST /api/screener/sparklines in server.py. 34 smoke tests pass.

### Task 2: Frontend inline SVG sparkline column in screener table
**Status**: PASS
**Attempts**: 1
**Acceptance**: Screener table has a "Trend" column after the player name column. Each cell contains a tiny inline SVG polyline (72x22px) showing weekly fantasy points. Line color: var(--green) if last 4 weeks trending up, var(--orange) if trending down. Sparklines load asynchronously after table renders (no blocking). Column toggleable via column picker. Works on mobile (sparkline scales). No console errors.
**Result**: Added trend column def to COLUMNS (isSparkline:true). Added to PPR + Dynasty presets. buildRowHTML renders placeholder cells with data-sparkline-pid. loadScreenerSparklines() fetches batch data with AbortController. injectSparklines() fills SVG polylines with end-dot and trend coloring. renderVisibleRows re-injects on scroll. CSS: sparkline-cell 80px width, animated placeholder. Header non-sortable. No syntax errors.
