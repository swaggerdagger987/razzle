---
id: S1-034
severity: S1
confidence: HIGH
category: data
source: functional-qa/results.tsv FUNC-007 (2026-03-20)
status: OPEN
---

# Snap count data not imported — workload/snap features return zeros

## Root Cause

`adapters/nflverse_adapter.py` has a `sync_snap_counts()` function (line 743+) that imports `offense_snaps` and `offense_pct` from nflverse snap count CSVs into `player_week_stats`. However, this function has not been run against the production database. All snap-related columns in `player_week_stats` are NULL.

Verified by functional QA: workload monitor shows `snaps_pg=0.0` and `snap_pct=None` for all 50 players tested.

## Impact

All snap-dependent features are broken:
- **Workload Monitor** (`/workload.html`) — snap counts and snap% show 0
- **Snap Efficiency** (`/snapefficiency.html`) — points per snap is infinity/0
- **Usage Trends** (`/usage.html`) — snap% column is empty
- **Screener columns**: `offense_snaps`, `offense_pct`, `snap_share` all show 0

## Fix

Run the snap count data import:
```python
from adapters.nflverse_adapter import sync_snap_counts
sync_snap_counts()  # imports offense_snaps for all seasons
```

Then upload the updated `terminal_clean.db` to the GitHub release so Render builds include the data.

## Files

- `adapters/nflverse_adapter.py:743+` — `sync_snap_counts()` function (code is correct, just never run)
- `data/terminal.db` — needs snap data populated

## Accept When

1. `SELECT COUNT(*) FROM player_week_stats WHERE offense_snaps IS NOT NULL` returns > 50,000 rows
2. Workload monitor shows non-zero snap counts for top players
3. Snap efficiency shows reasonable points-per-snap values (0.2-0.8 range)
4. Updated DB uploaded to GitHub release

## Do NOT Touch

- `sync_snap_counts()` function — the code is correct
- Any other adapter functions
