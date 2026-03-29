---
id: S2-103
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa/flows.md flow #33 (P2: Mitchell 7.8 snaps/g at #1)
status: OPEN
---

# Snap efficiency ranks low-snap players at top — no minimum snaps/game filter

## Root Cause

`backend/live_data/tools.py:1787` — The query filters for `offense_snaps >= 50` (season total) but has no per-game snap threshold:

```sql
AND s.offense_snaps >= 50
```

Sort at `tools.py:1826`:
```python
key=lambda x: x["pts_per_snap"], reverse=True
```

A player with 50 snaps across 16 games (3.1 snaps/g) can rank #1 by scoring high on those few snaps. Mitchell at 7.8 snaps/g with 0.73 pts/snap is inflated by low volume — he's not efficient, he's underutilized.

Fantasy reality: pts/snap is only meaningful for players getting real workload. A player with 7 snaps per game isn't "efficient" — they're barely on the field.

## Fix

Add a minimum snaps-per-game filter. At `tools.py:1823` (or in the SQL WHERE clause):

```python
snaps_pg = offense_snaps / games
if snaps_pg < 15.0:
    continue
```

15 snaps/game is roughly the floor for a meaningful offensive contributor. For the SQL approach, compute `CAST(offense_snaps AS FLOAT) / games >= 15.0`.

## Files to Change

- `backend/live_data/tools.py` — snap efficiency function, around line 1787-1826

## Accept When

1. No player with < 15 snaps/game appears in snap efficiency results
2. Top players are genuine high-snap, high-efficiency performers
3. Total player count decreases (correct — excludes gadget players)

## Do NOT Touch

- The pts_per_snap calculation formula
- The total snap threshold (50 total is still reasonable as a floor)
