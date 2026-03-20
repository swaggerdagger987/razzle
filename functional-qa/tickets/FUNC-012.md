# FUNC-012: Playoff data contaminates ALL regular season stats (season_type column broken)

**Severity**: P0
**Flow**: 27 (Matchups), 1-12 (Screener), 24-44 (all analytics panels)
**Status**: OPEN

## Problem

Every stat on the site is wrong for players who played in the 2024 playoffs. The `season_type` column in the production database is ALL 'regular' — including playoff weeks 19-22. This means `WHERE season_type = 'regular'` is a no-op.

## Evidence

1. **Matchup heatmap** (analytics.py:1569) HAS `season_type = 'regular'` filter but PHI still shows **21 games** (17 regular + 4 playoff).
2. **Screener** shows Lamar Jackson with **19 games** in 2024 (17 regular + 2 playoff). Should be 17.
3. **Weekly heatmap** returns weeks [1-22] for 2024 — weeks 19-22 are playoff weeks.
4. **Direct query**: `POST /api/screener/query {season:2024, week:19, search:"hurts"}` returns Jalen Hurts with 16.84 PPR — this is Wild Card playoff data tagged as regular season.

## Game count breakdown (production, 2024)
- PHI: 21 games (17 reg + 4 playoff — went to Super Bowl)
- BUF: 20, KC: 20, WAS: 20
- BAL: 19, HOU: 19, LA: 19
- DEN, DET, GB, LAC, MIN, PIT, TB: 18
- 18 teams correctly at 17

## Root Cause

Two-layer problem:

### Layer 1: Database has wrong `season_type` values
The nflverse adapter (nflverse_adapter.py:507-511) correctly maps season_type from CSV, but the **production DB appears to have ALL rows as 'regular'**. Either:
- The DB was built from an older adapter version that didn't map season_type
- The nflverse CSV used at build time didn't have the season_type column
- The Render deploy DB download (GitHub release) was built before the mapping was added

### Layer 2: Most queries don't filter on season_type anyway
Even if Layer 1 is fixed, these functions still need `AND s.season_type = 'regular'`:
- `_fetch_screener_uncached()` in players.py (THE MAIN SCREENER)
- `fetch_players()` in players.py (GET /api/players)
- `fetch_weekly_heatmap()` in analytics.py
- Dozens of other analytics/dashboard functions

The Ship Loop added season_type filters to 4 functions in dashboards.py (SOS, stock watch, report cards, awards) — but this is a drop in the bucket.

## Impact

- Every player's game count is inflated by their playoff games
- Season totals (yards, TDs, points) include playoff production
- PPG calculations are incorrect (numerator and denominator both wrong)
- Rankings shift: playoff team players look better than they were in regular season
- Dynasty values, trade values, and all derived analytics are based on inflated stats
- A user comparing two players where one made the playoffs and one didn't gets misleading data

## Scope

Full audit found **108 out of 137 functions** (79%) that query `player_week_stats` are missing `season_type = 'regular'`. Even the 29 that DO have it return wrong data because the DB values are all 'regular'.

Key affected modules:
- players.py: 31 functions (screener, profiles, comparisons, game logs)
- tools.py: 34 functions (cheat sheet, leaders, streaks, draft class, etc.)
- dynasty.py: 26 functions (trade values, rankings, tier list, dashboard)
- analytics.py: 14 functions (heatmaps, air yards, usage trends, etc.)
- dashboards.py: 7 functions (efficiency, consistency, opportunity, VORP)

## Fix Required

### Step 1: Fix the data (CRITICAL)
Rebuild the production DB with correct `season_type` values. Verify that nflverse CSVs contain `season_type` column, and that the adapter correctly maps "POST" → "post" for playoff rows.

### Step 2: Add season_type filter to ALL regular-season queries
At minimum:
- `backend/live_data/players.py`: `_fetch_screener_uncached()` — add `AND s.season_type = 'regular'` to WHERE clause (unless career mode)
- `backend/live_data/players.py`: `fetch_players()` — same
- `backend/live_data/analytics.py`: `fetch_weekly_heatmap()` — both week listing and scoring queries
- Audit every other function that queries `player_week_stats` without season_type filter

### Step 3: Expose playoff data intentionally
Consider adding a "Include playoffs" toggle or a separate playoff mode, rather than silently mixing data.

## Verification

After fix:
- PHI should show exactly 17 games in 2024 matchup heatmap
- Lamar Jackson should show 17 games (not 19) in 2024 screener
- Weekly heatmap should show weeks 1-18 only for 2024 (not 19-22)
- Josh Allen season total PPR should match his regular-season-only total
