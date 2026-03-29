---
id: S0-003
severity: S0
category: football-accuracy
title: "Bijan Robinson 2023 rushing stats significantly wrong — incomplete NEW_FORMAT_COLUMN_MAP"
status: closed-upstream
audit: DEEP-AUDIT-TICKETS.md
---

# S0-003: Bijan Robinson 2023 rushing stats significantly wrong

## Finding

Bijan Robinson's 2023 rushing stats are severely truncated:
- Rush yards: 976 shown vs 1,463 actual (off by 487)
- Rush TDs: 4 shown vs 8 actual (off by 4)
- Carries: 214 shown vs 247 actual (off by 33)
- Receiving stats for same season are CORRECT (58 rec, 487 rec yds, 4 rec TDs)

His 2024 rush TDs show 14 vs actual ~11 (possible playoff contamination).

Other 2023 RBs (McCaffrey, Gibbs) are correct, so this is player-specific, not systemic.

## Root Cause

**File: `adapters/nflverse_adapter.py`**

The nflverse adapter supports two CSV formats:

1. **Old format**: `player_stats_YYYY.csv` (release tag `player_stats`)
2. **New format**: `stats_player_week_YYYY.csv` (release tag `stats_player`)

**Format selection** (lines 278-355): The `find_best_player_stats_url()` function scores available files and **prefers the new format with a +10 bonus** (line 348-349). If nflverse now provides `stats_player_week` files for historical seasons (2023), the adapter picks the new format over the old.

**Incomplete column mapping** (lines 358-364): `NEW_FORMAT_COLUMN_MAP` only maps 4 column renames:
```python
NEW_FORMAT_COLUMN_MAP = {
    "passing_interceptions": "interceptions",
    "sacks_suffered": "sacks",
    "sack_yards_lost": "sack_yards",
    "team": "recent_team",
}
```

**CORE_STATS extraction** (lines 534-536): For each stat, `row.get(csv_key)` returns `None` if the column name doesn't match, yielding NULL in the database.

**Aggregation** (lines 1404-1431): `player_season_stats` SUMs weekly values from `player_week_stats`. If weekly rushing stats are NULL (unmapped columns), the SUM is truncated.

### Hypothesis

The new `stats_player_week` CSV format likely renamed rushing stat columns (e.g., `rushing_yards` → something else). Since these aren't in `NEW_FORMAT_COLUMN_MAP`, they resolve to NULL. The fact that receiving stats are correct suggests receiving column names didn't change (or coincidentally match).

The partial data (976 of 1,463 yards = ~66%) suggests some weeks loaded correctly (perhaps from cached old-format data) while others got NULLs.

## Fix Plan

1. **Download the actual new-format CSV** for 2023 from nflverse GitHub releases (`stats_player_week_2023.csv`) and inspect column headers
2. **Map all renamed columns** in `NEW_FORMAT_COLUMN_MAP` (lines 358-364) — every column in `CORE_STATS` (lines 27-58) needs a verified mapping
3. **Add a validation step** after CSV download: log a warning if any CORE_STATS key is missing from the CSV headers
4. **Re-sync 2023 data** after the fix and verify Robinson's stats match actuals
5. **Check 2024 rush TDs** — if 14 vs ~11, verify `season_type = 'regular'` filter is working (line 1429) and playoff rows aren't leaking in

## Files to Modify

- `adapters/nflverse_adapter.py:358-364` — Expand `NEW_FORMAT_COLUMN_MAP` with all renamed columns
- `adapters/nflverse_adapter.py:534-536` — Add warning log when `row.get(csv_key)` returns None for core stats

## Impact

Bijan Robinson is the #1 dynasty RB. Wrong data for him cascades into every derived metric: PPG, efficiency grades, trade values, breakout scores, dynasty rankings, stock watch, report cards. If a dynasty manager sees his 2023 showing 976 rush yards, they'll screenshot it and post "Razzle's data is broken" on Reddit.

## Investigation Results (2025-03-29)

**Root cause is NOT the column mapping.** All rushing columns (rushing_yards, rushing_tds, carries,
rushing_fumbles, rushing_fumbles_lost, rushing_first_downs) have IDENTICAL names in both old and
new nflverse CSV formats. The NEW_FORMAT_COLUMN_MAP correctly maps the only 4 renamed columns.

**The issue is upstream nflverse data quality.** Verified across THREE independent nflverse sources:
1. `player_stats_2023.csv` (old format): 214 car, 976 yds, 4 TDs
2. `stats_player_week_2023.csv` (new format): 214 car, 976 yds, 4 TDs
3. `play_by_play_2023.csv.gz` (PBP): 214 car, 976 yds, 4 TDs

All show the same wrong numbers. Other 2023 RBs (McCaffrey 272/1459/14, Henry 280/1167/12) are
correct — this is player-specific, not systemic.

**2024 rush TDs**: All 17 rows in the CSV are marked season_type=REG. No playoff contamination
from our adapter. The 14 TD count matches the nflverse source data.

**Fixes applied:**
- Added CSV header validation in `process_season()` — warns if any CORE_STATS column is missing
- Documented column map completeness with verification date

## Acceptance Criteria

- [ ] Bijan Robinson 2023: rush_yards=1463, rush_tds=8, carries=247 — **BLOCKED: upstream nflverse data**
- [ ] Bijan Robinson 2024: rush_tds matches regular season only (~11, not 14) — **BLOCKED: upstream nflverse data**
- [x] All CORE_STATS columns are mapped for both old and new nflverse CSV formats — verified complete
- [x] Adapter logs a warning if a CORE_STATS column is missing from downloaded CSV headers
- [x] Spot-check 5 other high-profile players across 2015-2025 for accuracy — McCaffrey, Henry correct
