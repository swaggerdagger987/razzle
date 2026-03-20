# FUNC-012: Playoff data contaminates regular season stats (Layer 2 — missing season_type filters)

**Severity**: P0
**Flow**: 1-12 (Screener), 14-15 (Profiles/Game Logs), 18-19 (Dynasty), 25 (Weekly Heatmap), 32-44 (Analytics)
**Status**: OPEN — Layer 1 FIXED, Layer 2 remains

## Status Update (2026-03-20 session 10)

**NO PROGRESS since session 9.** Layer 2 remains completely unfixed. Ship Loop completed Phases A-E (visual/UX/hardening) without touching the data layer.

Source code verified:
- `players.py`: **0** season_type filters (unchanged)
- `dynasty.py`: **0** season_type filters (unchanged)
- `analytics.py`: 3 filters present, ~10 still missing (unchanged)
- `tools.py`: 5 filters present, ~25 still missing (unchanged)

### New Evidence — Data Distortion Quantified

| Player | Endpoint | Shown | Actual (reg season) | Inflation |
|--------|----------|-------|---------------------|-----------|
| Saquon Barkley | Screener | 2504 rush yds, 20 GP | 2005 rush yds, 17 GP | **+25% rush yds** |
| Lamar Jackson | Screener | 45 pass TDs, 19 GP | 41 pass TDs, 17 GP | **+10% TDs** |
| Lamar Jackson | Game Log | 19 weeks shown | 17 reg + 2 playoff | Weeks 19-20 shown as regular weeks with **no visual distinction** |
| Lamar Jackson | Profile | 2024: 19 GP | 17 GP | Inflated per-season |
| Puka Nacua | Dynasty Rankings | 19 GP | 17 GP | Playoff games inflate dynasty value |
| Lamar Jackson | Consistency | CoV=0.245 across 19 games | CoV over 17 games | Playoff games skew variability analysis |
| All playoff QBs | Stat Leaders | 19 GP | 17 GP | PPG denominators wrong |
| All | Weekly Heatmap | Weeks 1-22 | Weeks 1-18 | 4 fake weeks |

### Credibility Risk

If a user screenshots the screener showing Barkley with 2504 rushing yards and posts it to r/DynastyFF, anyone who follows football knows the real number is 2005. The entire platform's credibility is destroyed in one Reddit comment.

### No Regressions from Ship Loop Phases B-E

All 70+ pages load with 0 JS errors. Visual design consistent. URL state, og:image, nav links all verified correct. The Ship Loop's work is good — it just hasn't touched this ticket yet.

## Status Update (2026-03-20 session 9)

**Layer 1 is FIXED.** The production DB now has correct `season_type` values ('regular' vs 'post'). Verified:
- `/api/available-weeks?season=2024` returns weeks 1-18 only (not 19-22)
- Endpoints WITH `season_type = 'regular'` filters now return correct data:
  - Matchup heatmap: PHI=17 games (was 21) ✅
  - Season awards: Iron Man=17 games (was 19) ✅
  - SOS, Stock Watch, Report Cards: correct game counts ✅
  - Air Yards: games=17 ✅

**Layer 2 is the remaining problem.** Most queries in `players.py`, `dynasty.py`, and many in `analytics.py`/`tools.py` still do NOT filter by `season_type = 'regular'`.

## Current Evidence (production, 2026-03-20)

### Still broken (no filter):
1. **Screener**: Lamar Jackson = 19 games, Jayden Daniels = 20, C.J. Stroud = 19 (all include playoffs)
2. **Stat Leaders**: Lamar = 19 games, Saquon Barkley = 20, Jayden Daniels = 20
3. **Weekly Heatmap**: returns weeks [1-22] for 2024 (includes 4 playoff weeks)
4. **Dynasty Rankings**: Puka Nacua = 19 games (17 reg + 2 playoff)
5. **Dynasty Dashboard top5**: Jahmyr Gibbs = 18 games (includes playoff)
6. **Player profiles, game logs, comparisons**: all inflate game counts for playoff players

### Now fixed (filter present):
1. **Matchup Heatmap**: PHI = 17 games ✅
2. **Season Awards**: Iron Man = 17 ✅
3. **Report Cards**: all checked = 17 ✅
4. **SOS, Stock Watch**: correct counts ✅
5. **Air Yards**: games = 17 ✅
6. **Available Weeks endpoint**: 1-18 only ✅

## Remaining Scope

Functions that query `player_week_stats` WITHOUT `AND s.season_type = 'regular'`:

### players.py — 0 filters (CRITICAL, highest traffic)
- `_fetch_screener_uncached()` — THE MAIN SCREENER
- `fetch_players()` — GET /api/players
- `fetch_player_profile()` — player detail modal
- `fetch_player_game_log()` — weekly breakdown
- `fetch_players_compare()` — comparison view
- `fetch_player_weeks()` — week selector
- `fetch_team_roster()` — team page
- `quick_search_players()` — Ctrl+K search
- ~20 more internal query functions

### dynasty.py — 0 filters
- `compute_dynasty_values()` — trade values, rankings, tiers
- `fetch_dynasty_dashboard()` — dashboard top5, risers/fallers
- `fetch_trade_value_chart()` — trade value bars
- `fetch_trade_finder()` — equal value targets
- ~15 more functions

### analytics.py — 3 filters present, ~10 still missing
- Missing: `fetch_stat_leaders()`, `fetch_weekly_heatmap()`, `fetch_usage_trends()`, `fetch_yoy_comparison()`, others
- Present: `fetch_matchup_heatmap()`, `fetch_air_yards()` (partial)

### tools.py — 5 filters present, ~25 still missing
- Missing: `fetch_cheat_sheet()`, `fetch_streaks()`, `fetch_waivers()`, `fetch_stacks()`, `fetch_draft_class()`, most others

## Fix Required

### Step 1: Add `AND s.season_type = 'regular'` to ALL regular-season queries

Priority order (by user impact):
1. `players.py:_fetch_screener_uncached()` — add to WHERE clause (skip for career mode)
2. `players.py:fetch_players()` — same
3. `analytics.py:fetch_weekly_heatmap()` — week listing AND scoring queries
4. `analytics.py:fetch_stat_leaders()` — all 4 query branches
5. `dynasty.py:compute_dynasty_values()` — affects all dynasty features
6. All remaining functions across players.py, dynasty.py, analytics.py, tools.py

### Step 2: Consider using `player_season_stats` materialized view

The startup code (server.py:307) already builds `player_season_stats` WITH `season_type = 'regular'`. If the screener used this instead of aggregating `player_week_stats` directly, the season aggregate path would automatically exclude playoffs. This would be a cleaner fix for the common "all weeks, one season" query pattern.

### Step 3: Expose playoff data intentionally

Consider a "Include playoffs" toggle or separate playoff mode.

## Verification

After fix:
- Lamar Jackson should show 17 games (not 19) in 2024 screener
- Jayden Daniels should show 16 games (not 20) in 2024 screener
- Weekly heatmap should show weeks 1-18 only for 2024
- Dynasty rankings game counts should match regular season only
- Stat leaders game counts should be <= 18 for all players
