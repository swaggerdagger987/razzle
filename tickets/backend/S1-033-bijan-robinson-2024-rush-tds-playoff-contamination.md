---
id: S1-033
severity: S1
category: football-accuracy
title: Bijan Robinson 2024 rush TDs inflated — 14 in DB vs 11 actual (3 playoff TDs contaminating regular season)
source: deep-audit + stat-audit
status: open
---

## Problem

Bijan Robinson's 2024 regular-season rushing TDs show 14 in the database, but he scored 11 rushing TDs in the regular season. The extra 3 TDs are likely from playoff games (1 vs WAS wildcard, 2 vs PHI divisional) that were imported with `season_type = 'regular'` instead of `'post'`.

This is the same player already flagged in S0-007 for wrong 2023 rushing stats. Two seasons of bad data for the #1 dynasty RB is a trust-destroying pattern.

## Root Cause

**Aggregation queries are correct** — all backend queries properly filter `season_type = 'regular'`:
- `backend/live_data/core.py:415` — `WHERE ... AND season_type = 'regular'`
- `backend/live_data/players.py:668,706,787` — all fetch functions filter by season_type
- `adapters/nflverse_adapter.py:1429` — player_season_stats built with `WHERE season_type = 'regular'`

**Data classification logic is correct** — `adapters/nflverse_adapter.py:519-523`:
```python
season_type = (row.get("season_type") or "REG").strip().upper()
if season_type in ("REG", "REGULAR"):
    season_type = "regular"
elif season_type in ("POST", "PLAYOFFS"):
    season_type = "post"
```

**Most likely root cause**: The nflverse CSV for 2024 was imported before playoff data was properly classified, OR the CSV version downloaded had playoff weeks tagged as "REG". The default fallback `or "REG"` on line 519 means any row with a missing/empty `season_type` field is silently classified as regular.

## Investigation Queries

```sql
-- Check which weeks have rushing TDs for Robinson 2024
SELECT week, season_type, rushing_tds, rushing_yards, carries
FROM player_week_stats
WHERE player_id = (SELECT player_id FROM players WHERE full_name = 'Bijan Robinson' AND position = 'RB')
AND season = 2024
ORDER BY week;

-- Check if any weeks > 18 exist for 2024
SELECT DISTINCT week, season_type FROM player_week_stats
WHERE season = 2024 AND week > 18
ORDER BY week;
```

## Fix

1. Run investigation queries to confirm playoff weeks exist with `season_type = 'regular'`
2. If confirmed, fix the misclassified rows: `UPDATE player_week_stats SET season_type = 'post' WHERE season = 2024 AND week > 18`
3. Re-import 2024 from fresh nflverse CSV: `python adapters/nflverse_adapter.py --seasons 2024`
4. Verify Robinson 2024 regular-season totals: 1,456 rush yards (correct), 11 rush TDs (should change from 14)
5. Check other high-profile RBs for same issue (Saquon Barkley playoff TDs, Derrick Henry playoff TDs)
6. Consider adding a guard in the adapter: reject or flag rows where `week > 18` AND `season_type = 'regular'`

## Accept When

- Robinson 2024 regular-season rush TDs = 11 (not 14)
- No other player has playoff stats contaminating regular-season aggregation
- Adapter has guard against week > 18 with season_type = 'regular'
