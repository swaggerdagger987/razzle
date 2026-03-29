# S2-034: NFL first-downs data stale — re-import seasons 2018/2019/2023

**Severity**: S2 (Minor)
**Category**: data-accuracy
**Source**: Stat Audit Report 2026-03-28, NFL weekly first-downs discrepancies

## Problem

nflverse retroactively corrected first_downs values in their CSV after our database
was imported. Four player-weeks have stale first-down counts:

| Player | Season | Week | Stat | Source (current) | DB (stale) | Delta |
|--------|--------|------|------|------------------|------------|-------|
| Sam Darnold | 2018 | 7 | rushing_first_downs | 6 | 4 | -2 |
| Kirk Cousins | 2019 | 7 | passing_first_downs | 20 | 19 | -1 |
| Julian Edelman | 2019 | 4 | receiving_first_downs | 1 | 0 | -1 |
| Kenneth Walker III | 2023 | 17 | rushing_first_downs | 5 | 3 | -2 |

The DB's `stats_json` matches the DB columns (both show old values), confirming
the data was consistent at import time but is now outdated.

## Root Cause

- `adapters/nflverse_adapter.py:48-50` — First-downs columns defined in CORE_STATS
  (`passing_first_downs`, `rushing_first_downs`, `receiving_first_downs`)
- No automatic re-import mechanism exists; manual `--seasons` flag required
- `adapters/nflverse_adapter.py:1314-1315` — `--seasons` flag enables selective
  re-import but must be run manually

## Fix

Re-run the nflverse adapter for affected seasons:
```bash
python adapters/nflverse_adapter.py --seasons 2018 2019 2023
```

Consider adding a periodic re-sync mechanism for older seasons to pick up
retroactive corrections from nflverse.

## Scope

- 0 code changes (operational fix only)
- Run: `python adapters/nflverse_adapter.py --seasons 2018 2019 2023`
