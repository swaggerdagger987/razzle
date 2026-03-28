---
id: S2-040
severity: S2
category: backend
title: Re-import NFL seasons 2018, 2019, 2023 to pick up nflverse first_downs corrections
source: stat-audit
status: open
---

## Problem

The stat audit found 4 weekly first_downs discrepancies where nflverse retroactively corrected values after our DB was imported:

| Player | Season | Week | Stat | DB | Source (corrected) | Delta |
|--------|--------|------|------|-----|-------------------|-------|
| Sam Darnold | 2018 | 7 | rushing_first_downs | 4 | 6 | -2 |
| Kirk Cousins | 2019 | 7 | passing_first_downs | 19 | 20 | -1 |
| Julian Edelman | 2019 | 4 | receiving_first_downs | 0 | 1 | -1 |
| Kenneth Walker III | 2023 | 17 | rushing_first_downs | 3 | 5 | -2 |

These are secondary stats (not used in fantasy scoring), but keeping them stale reduces overall data accuracy.

## Root Cause

The DB's `stats_json` blob matches the DB columns (both show old values), confirming the data was consistent at time of import but nflverse has since corrected these values.

Stat audit accuracy: 99.91% (9,627/9,636 matched checks). These 4 errors are the only weekly stat mismatches.

## Fix

Re-import affected seasons from fresh nflverse CSVs:
```bash
python adapters/nflverse_adapter.py --seasons 2018 2019 2023
```

The adapter uses `ON CONFLICT UPDATE` (upsert), so existing correct data will be preserved and only changed values will update.

## Accept When

- Seasons 2018, 2019, 2023 re-imported from latest nflverse CSVs
- The 4 first_downs values match the corrected nflverse data
- No regressions in other stats for these seasons
