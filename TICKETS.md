# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Weekly Data Filter — Screener + All Panels

**Context**: The `player_week_stats` table already has per-week data (40+ stat columns, every player, every week, 2015-2025). Several endpoints already support week params (`/api/weekly-leaders`, `/api/players/{id}/weeks`). But the main screener and most analytical panels only show season-aggregated data. This phase adds a universal week selector so users can slice any view by individual week — critical for in-season use.

**Exit criterion**: The screener and all applicable Lab panels have a week selector. Default is "All Weeks" (season aggregate, current behavior). Selecting a specific week (1-18) shows that week's stats only. The selector persists across panel switches and is included in shareable URLs.

### Task 1: Backend — Add week parameter to screener query endpoint
**Accept when**: `POST /api/screener/query` (or `GET /api/players`) accepts an optional `week` parameter (integer, 0 = all weeks). When `week > 0`, the query reads from `player_week_stats` (that specific week's row) instead of the season-aggregated `player_stats` table. When `week = 0` or omitted, behavior is unchanged (season totals). All stat columns that exist in both tables work correctly. Columns that only exist at season level (like career stats, dynasty values) gracefully show "—" in weekly mode. Verify by hitting the endpoint with `week=1` and confirming you get Week 1 stats only.
**Status**: DONE

### Task 2: Frontend — Add week selector to the screener toolbar
**Accept when**: The Lab screener toolbar has a week dropdown next to the existing season selector. Options: "All Weeks" (default), "Week 1" through "Week 18" (dynamically populated based on what weeks exist in the selected season — query `SELECT DISTINCT week FROM player_week_stats WHERE season = ?`). Selecting a week triggers a re-fetch with the `week` parameter. The dropdown matches the existing toolbar design (chunky Razzle style, same height/font as season selector). Week selection is stored in `state.week` and serialized to URL params (`&week=5`). Shared URLs preserve week selection.
**Status**: DONE

### Task 3: Backend — Add week parameter to all applicable panel endpoints
**Accept when**: The following endpoints accept an optional `week` parameter and filter `player_week_stats` by week when provided: `/api/breakouts`, `/api/efficiency`, `/api/consistency`, `/api/usage-trends`, `/api/target-distribution`, `/api/red-zone`, `/api/opportunity-share`, `/api/snap-efficiency`, `/api/workload`, `/api/dual-threat`, `/api/target-premium`, `/api/drop-rate`, `/api/success-rate`, `/api/gamescript`, `/api/garbage-time`, `/api/streaks`, `/api/report-cards`. Endpoints where weekly doesn't make sense (aging curves, dynasty rankings, trade values, prospect data, YoY comparisons) are left unchanged. Each modified endpoint returns single-week data when `week` is specified, season aggregate when omitted.
**Status**: PENDING

### Task 4: Frontend — Add week selector to all applicable Lab panels
**Accept when**: Every Lab panel whose endpoint now supports weekly filtering gets the same week selector UI. Use a shared `renderWeekSelector(containerId, season, onWeekChange)` helper to keep the UI identical across panels. The week selector appears below the season selector in each panel's controls area. Default is "All Weeks". Selecting a week re-fetches that panel's data with the week param. Panels where weekly doesn't apply (aging curves, dynasty rankings, trade values, prospects, big board, YoY) do NOT get a week selector.
**Status**: PENDING

### Task 5: Screener column headers — indicate weekly vs season context
**Accept when**: When a specific week is selected (not "All Weeks"), the screener shows a subtle indicator — e.g., a Caveat-font annotation below the toolbar saying "showing Week 5, 2025 stats" or a small badge on the week dropdown. This prevents confusion where a user sees low numbers and forgets they're looking at a single week instead of season totals. Matches Razzle design language (Caveat, slightly rotated, annotation style).
**Status**: DONE
