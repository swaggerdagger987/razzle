# FUNC-031: player_season_pbp table has 0 rows — all PBP features return nothing

## Severity: P1 — "This tool doesn't actually work"

## Summary

The `player_season_pbp` table exists in the local ship DB (443MB) but has 0 rows. All play-by-play-derived features return null/nothing: goal-line carries, goal-line TDs, scramble attempts, scramble yards, play-action stats, success rates, RYOE, garbage time percentage.

## Evidence

```python
# Direct DB query:
sqlite3.connect('razzle-ship/data/terminal.db')
conn.execute("SELECT COUNT(*) FROM player_season_pbp")  # → 0

# API response:
Lamar Jackson: gl_carries=None, gl_tds=None, scramble_att=None, scramble_yd=None, pa_att=None
Josh Allen: gl_carries=None, gl_tds=None, scramble_att=None, scramble_yd=None, pa_att=None
(Same for all players, all seasons, both week and full-season queries)
```

## Impact

The following screener columns and panel features are non-functional:
- Goal-line carries/TDs (red zone analysis)
- Scramble attempts/yards/TDs (dual-threat QB analysis)
- Play-action attempts/completions/yards/TDs
- Rush success rate, pass success rate
- RYOE (Rushing Yards Over Expected)
- Garbage time percentage
- Average score differential

These stats appear as columns in the screener column picker but always show blank/null.

## Root Cause

The `nflverse_adapter.py` has PBP sync logic (sync_season_pbp), but it appears the data wasn't populated when the current DB was built. The adapter downloads play-by-play CSVs, aggregates per player-season, and writes to `player_season_pbp`. Either:
1. The PBP sync step was skipped during the latest DB build
2. The PBP data source changed format
3. The build script doesn't call `sync_season_pbp()`

## Fix

Run the PBP sync step during the next DB build:
```python
adapter.sync_season_pbp(conn, season)  # for each season 2015-2024
```

## Files
- `adapters/nflverse_adapter.py` — sync_season_pbp function
- `data/terminal.db` — player_season_pbp table (0 rows)
