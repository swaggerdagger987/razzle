---
id: S0-007
severity: S0
category: backend
title: Bijan Robinson 2023 rushing stats wrong — 976 rush yards vs actual 1,463
source: deep-audit + stat-audit
status: open
---

## Problem

Bijan Robinson's 2023 season rushing stats are significantly wrong:

| Stat | DB Value | Actual | Delta |
|------|----------|--------|-------|
| Rush yards | 976 | 1,463 | -487 |
| Rush TDs | 4 | 8 | -4 |
| Carries | 214 | 247 | -33 |
| Receptions | 58 | 58 | correct |
| Rec yards | 487 | 487 | correct |
| Rec TDs | 4 | 4 | correct |

Robinson is the #1 dynasty RB. Wrong data for him gets screenshotted and shared as "Razzle's data is broken." The receiving stats being correct while rushing stats are ~66% of actual values suggests approximately 12 weeks of rushing data imported out of 17.

## Root Cause (investigation needed)

**Adapter column mapping is correct** — `adapters/nflverse_adapter.py:33-41`:
- `rushing_yards`, `rushing_tds`, `carries` all properly mapped in CORE_STATS dict

**Season aggregation is correct** — `backend/live_data/core.py:123-131`:
- `SUM(s.rushing_yards)`, `SUM(s.rushing_tds)`, `SUM(s.carries)` aggregate all regular-season weeks

**No filtering logic excludes rushing** — no week-range or column-specific filtering exists

**Most likely root cause**: The nflverse CSV that was imported for 2023 contained incomplete rushing data for Robinson specifically. This could be:
1. A stale CSV download that was later corrected by nflverse
2. A player ID resolution issue causing Robinson's data to split across two records
3. A CSV format change between seasons that affected rushing column extraction

**Key investigation queries**:
```sql
-- Check week-by-week rushing data
SELECT week, rushing_yards, carries, rushing_tds
FROM player_week_stats
WHERE player_id LIKE '%robinson%' AND season = 2023
ORDER BY week;

-- Check for duplicate player IDs
SELECT player_id, full_name, position, team
FROM players WHERE full_name LIKE '%Robinson%' AND position = 'RB';
```

## Fix

1. Run the investigation queries above to identify the exact gap
2. Re-import season 2023 from fresh nflverse CSV: `python adapters/nflverse_adapter.py --seasons 2023`
3. Verify Robinson's 2023 totals match: 1,463 rush yds, 8 rush TDs, 247 carries
4. Spot-check 5 other high-profile 2023 RBs (McCaffrey, Gibbs, Achane, Pollard, Henry) — the stat audit found them correct, but verify post-reimport

## Accept When

- Robinson 2023 rush yards = 1,463, rush TDs = 8, carries = 247
- All other 2023 RB stats remain correct after reimport
- The root cause is documented (stale CSV, player ID split, or other)
