---
id: STAT-S2-001
severity: S2
category: data-accuracy
title: "Re-import seasons 2018, 2019, 2023 for nflverse first_downs corrections"
status: open
audit: STAT-AUDIT-REPORT.md
---

# STAT-S2-001: Re-import seasons 2018, 2019, 2023 for nflverse first_downs corrections

## Finding

The stat audit found 4 first_downs discrepancies where the DB has stale values and nflverse has since corrected them:

| Player | Season | Week | Stat | Source (current nflverse) | DB | Delta |
|--------|--------|------|------|---------------------------|-----|-------|
| Sam Darnold | 2018 | 7 | rushing_first_downs | 6 | 4 | -2 |
| Kirk Cousins | 2019 | 7 | passing_first_downs | 20 | 19 | -1 |
| Julian Edelman | 2019 | 4 | receiving_first_downs | 1 | 0 | -1 |
| Kenneth Walker III | 2023 | 17 | rushing_first_downs | 5 | 3 | -2 |

## Root Cause

**File: `adapters/nflverse_adapter.py:48-50`** — first_downs columns are mapped 1:1 from the nflverse CSV:
```python
"passing_first_downs": "passing_first_downs",   # line 48
"rushing_first_downs": "rushing_first_downs",    # line 49
"receiving_first_downs": "receiving_first_downs", # line 50
```

**File: `adapters/nflverse_adapter.py:629-675`** — The `upsert_stats()` function uses `INSERT...ON CONFLICT...DO UPDATE` (line 646), so re-importing a season **will overwrite** existing values with the corrected nflverse data (lines 663-665):
```python
passing_first_downs=excluded.passing_first_downs,   # line 663
rushing_first_downs=excluded.rushing_first_downs,    # line 664
receiving_first_downs=excluded.receiving_first_downs, # line 665
```

The DB values were correct at time of import but nflverse retroactively corrected their CSV. No re-import has been run since.

## Fix

Run the adapter for the affected seasons:

```bash
python adapters/nflverse_adapter.py --seasons 2018 2019 2023
```

**File: `adapters/nflverse_adapter.py:1314-1315`** — CLI accepts `--seasons` flag.

Then upload the updated DB to production per STAT-S1-001.

## Impact

LOW. First downs are secondary stats not used in fantasy point scoring. They appear in the Lab screener's advanced columns and a few analytics pages. 4 of ~50,000 weekly records affected (0.008%).

## Acceptance Criteria

- [ ] Sam Darnold 2018 W7 rushing_first_downs = 6
- [ ] Kirk Cousins 2019 W7 passing_first_downs = 20
- [ ] Julian Edelman 2019 W4 receiving_first_downs = 1
- [ ] Kenneth Walker III 2023 W17 rushing_first_downs = 5
