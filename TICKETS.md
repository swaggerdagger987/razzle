# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## Phase: Critical Bug Fixes (Priority 1 — do this FIRST)

**Goal**: Fix the 5 critical + 1 high severity bugs that make core features unusable.

### Task 1: Fix NFL screener showing only 2024 data regardless of year
**Bug**: BUG-001 — CRITICAL
**Screen**: Main Table (NFL)
**Problem**: Select any year (2015, 2016, etc.) — still shows 2024 players (Ja'Marr Chase etc.)
**Expected**: Each year should show players/stats from that actual season
**Investigate**: Backend query in `backend/live_data/players.py` — is the season param being used in the WHERE clause? Frontend in `frontend/lab.js` — is the season being sent in the POST body to `/api/screener/query`?
**Accept when**: Selecting 2015 shows 2015 players (Antonio Brown, Julio Jones, etc.), 2020 shows 2020 players, etc.

### Task 2: Fix NFL/College toggle not switching without year change
**Bug**: BUG-002 — CRITICAL
**Screen**: Main Table — universe toggle
**Problem**: Clicking NFL/College/Prospects doesn't trigger a re-fetch. Must change year to force it.
**Expected**: Clicking the toggle immediately fetches and renders the correct universe
**Investigate**: `frontend/lab.js` — the universe toggle handler likely updates `state.universe` but doesn't call `fetchAndRender()`. Or it calls it but an early-return/cache check prevents the fetch.
**Accept when**: Clicking NFL → College → Prospects each immediately loads the correct data without touching the year dropdown.

### Task 3: Fix Target Premium panel — completely broken
**Bug**: BUG-015 — CRITICAL
**Screen**: Target Premium panel
**Problem**: Panel doesn't load or displays errors
**Investigate**: Check the `/api/panels/target-premium` endpoint in `backend/server.py` and the query in `backend/live_data/tools.py`. Check frontend rendering in `frontend/lab.js` panel loader.
**Accept when**: Target Premium panel loads with data for all available seasons.

### Task 4: Fix Drop Rate Dashboard — completely broken
**Bug**: BUG-016 — CRITICAL
**Screen**: Drop Rate Dashboard panel
**Problem**: Panel doesn't load or displays errors
**Investigate**: Check `/api/panels/drop-rate` endpoint and query. May depend on columns not present in DB.
**Accept when**: Drop Rate panel loads with data for all available seasons.

### Task 5: Fix Matchups panel — broken
**Bug**: BUG-018 — CRITICAL
**Screen**: Matchup Heatmap panel
**Problem**: Panel doesn't work at all
**Investigate**: Check `/api/panels/matchups` endpoint. May need opponent/defensive data not in current DB.
**Accept when**: Matchup heatmap loads showing DEF points allowed by position per week.

### Task 6: Fix Gamescript Analysis — completely broken
**Bug**: BUG-022 — CRITICAL
**Screen**: Gamescript Analysis panel
**Problem**: Panel doesn't load or errors out
**Investigate**: Check `/api/panels/gamescript` endpoint. Needs play-by-play score differential data.
**Accept when**: Gamescript panel loads showing ahead/behind/close splits for players.

### Task 7: Fix Garbage Time — barely works
**Bug**: BUG-017 — HIGH
**Screen**: Garbage Time Detector panel
**Problem**: Partial/broken data
**Investigate**: Check the garbage time detection logic — likely needs score differential thresholds from play-by-play data.
**Accept when**: Garbage Time panel reliably identifies garbage time stats across all available seasons.

---

## Phase: Panel Data Coverage Fixes (Priority 2)

**Goal**: Fix panels that work but are missing years or have limited date ranges.

### Task 1: Fix Efficiency Rankings — extend beyond 2024
**Bug**: BUG-010
**Problem**: No 2025 season data
**Accept when**: Shows data for all seasons in the database including latest available.

### Task 2: Fix Consistency Rankings — extend beyond 2024
**Bug**: BUG-011
**Problem**: No 2025 season data
**Accept when**: Shows data for all seasons in the database.

### Task 3: Fix Snap Efficiency — extend beyond 2020-2024
**Bug**: BUG-012
**Problem**: Only works 2020-2024, empty for other years
**Investigate**: Likely depends on snap count data which may only exist from 2020+. If data doesn't exist pre-2020, gracefully show "No snap data available before 2020" instead of empty/broken.
**Accept when**: Works for all years where snap data exists, shows clear message for years without it.

### Task 4: Fix Dual Threat Index — extend beyond 2020-2024
**Bug**: BUG-013
**Problem**: Only works 2020-2024
**Accept when**: Works for all available years. Clear message for years without required data.

### Task 5: Fix Workload Monitor — extend beyond 2020-2024
**Bug**: BUG-014
**Problem**: Only works 2020-2024
**Accept when**: Works for all available years.

### Task 6: Fix Tiers — extend to 2025, fix S-tier in 2015-2016
**Bug**: BUG-005
**Problem**: No S-tier players in 2015/2016, panel only goes to 2024
**Investigate**: Tier thresholds may be calibrated only for recent years. Historical elite performers (Antonio Brown 2015, David Johnson 2016) should absolutely be S-tier.
**Accept when**: 2015 shows Antonio Brown/Julio Jones as S-tier, 2016 shows David Johnson/Antonio Brown as S-tier, 2025 data available.

### Task 7: Fix Stacks — add 2025 and 2026
**Bug**: BUG-019
**Problem**: Empty for 2025/2026
**Accept when**: Stack correlations show for 2025 (or latest available season).

### Task 8: Fix Red Zone — add missing years
**Bug**: BUG-020
**Problem**: Some years empty
**Accept when**: Red zone data available for all seasons in the database.

### Task 9: Fix Streaks — add 2025 and 2026
**Bug**: BUG-021
**Problem**: Empty for 2025/2026
**Accept when**: Streak data shows for latest available season.

### Task 10: Fix Handcuff Rankings — add 2025
**Bug**: BUG-003
**Problem**: Empty for 2025
**Accept when**: Handcuff rankings show for latest available season.

### Task 11: Fix Half PPR on Cheat Sheet
**Bug**: BUG-009
**Problem**: Half PPR scoring doesn't recalculate values
**Investigate**: Check if the scoring mode switch actually triggers a recalculation or if it's just changing a label.
**Accept when**: Selecting Half PPR shows correctly calculated 0.5-per-reception values across all positions.

---

## Phase: UX Consistency & Features (Priority 3)

**Goal**: Make ranking/value panels consistent and add missing features.

### Task 1: Add player search to VORP panel
**Bug**: BUG-007
**Problem**: No way to search for specific players in VORP
**Accept when**: VORP panel has a search bar matching Trade Values design pattern.

### Task 2: Standardize all ranking/value panel layouts
**Bug**: BUG-008
**Problem**: Dynasty Rankings, Trade Values, VORP, Tiers all look different
**Design**: Every ranking panel should have: (1) position filter chips at top, (2) search bar, (3) sortable table with consistent column widths, (4) same card/container styling from `docs/DESIGN.md`
**Accept when**: All ranking panels share the same visual structure.

### Task 3: Add adjustable formula to Trade Values
**Bug**: BUG-006
**Problem**: Trade values are static with no way to adjust weights
**Design**: Add weight sliders or inputs (age weight, production weight, positional adjustment) that recalculate values live.
**Accept when**: User can adjust at least 3 formula weights and see trade values update in real time.

### Task 4: Add historical dynasty valuations
**Bug**: BUG-004
**Problem**: No end-of-season dynasty value snapshots
**Design**: Similar to how Tiers shows per-year tiers, Dynasty Rankings should show how a player's dynasty value changed year-over-year.
**Accept when**: Dynasty Rankings panel has a historical view showing value progression per player across seasons.

---
