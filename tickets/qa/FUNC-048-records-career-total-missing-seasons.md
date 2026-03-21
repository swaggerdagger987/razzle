# FUNC-048: Records Career Total Missing Seasons Range

**Severity**: P2
**Flow**: Records page (not in flow checklist — new page)
**Found**: Session 46 (2026-03-21)
**Status**: OPEN
**Related**: None

## Description

The Records panel "Career Total Points" section shows `seasons: None` for every player. The career PPG section correctly shows `"2017-2025"` format, but career total is missing the same field.

**Example**: Russell Wilson shows as `2890.1 total in 157G (None)` instead of `2890.1 total in 157G (2015-2025)`.

## Root Cause

**tools.py:1265-1286**: The career_total SQL query doesn't include `MIN(s.season)` and `MAX(s.season)` columns, unlike the career_ppg query (lines 1238-1261) which does include them.

Career PPG (correct):
```sql
SELECT p.player_id, p.full_name, p.position, p.team,
       COUNT(DISTINCT s.week || '-' || s.season) as games,
       ROUND(SUM(s.fantasy_points_ppr), 1) as total_fpts,
       MIN(s.season) as first_season,   -- included
       MAX(s.season) as last_season     -- included
```

Career Total (missing):
```sql
SELECT p.player_id, p.full_name, p.position, p.team,
       COUNT(DISTINCT s.week || '-' || s.season) as games,
       ROUND(SUM(s.fantasy_points_ppr), 1) as total_fpts
       -- MIN/MAX season missing
```

And the dict building (line 1281-1286) doesn't include `"seasons"` key.

## Fix

1. Add `MIN(s.season) as first_season, MAX(s.season) as last_season` to the career_total query (after line 1268)
2. Add `"seasons": f"{r[6]}-{r[7]}"` to the career_total dict (after line 1285)

## Verification

1. `GET /api/records` → career_total entries should have `"seasons": "2015-2025"` format
2. No entry should have `seasons: null` or `seasons: None`
