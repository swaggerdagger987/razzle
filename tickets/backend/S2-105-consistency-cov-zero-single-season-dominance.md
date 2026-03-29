---
id: S2-105
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa/flows.md flow #41 (P2: single-season players CoV=0.0 dominate Rock Solid)
status: OPEN
---

# Consistency panel: CoV=0.0 players dominate "Rock Solid" list

## Root Cause

`backend/live_data/dashboards.py:349` — Rock Solid sort uses raw CoV with no sample-size correction:

```python
rock_solid = sorted(players, key=lambda x: x["cov"])[:limit]
```

The minimum games filter at `dashboards.py:304` is only 6 games:

```python
if len(weeks) < 6:
    continue
```

Players with exactly 6-8 games and near-identical weekly scores (e.g., a backup who scored 5.0 PPR in every game they played) get CoV=0.0 and dominate the "Rock Solid" list. These aren't "consistent" — they're irrelevant low-volume players whose small sample artificially shows no variance.

Fantasy reality: "rock solid consistency" means a starter who you can rely on for 16+ games. A backup with 6 identical low-scoring games is not consistent — they're unstartable.

## Fix

1. Increase minimum games from 6 to 10 at `dashboards.py:304`:

```python
if len(weeks) < 10:
    continue
```

2. Add a tiebreaker favoring more games in the sort at `dashboards.py:349`:

```python
rock_solid = sorted(players, key=lambda x: (x["cov"], -x["games"]))[:limit]
```

This ensures players with more games (larger sample) rank higher when CoV is tied.

## Files to Change

- `backend/live_data/dashboards.py:304` — increase min games to 10
- `backend/live_data/dashboards.py:349` — add games tiebreaker to sort

## Accept When

1. No player with < 10 games appears in consistency results
2. "Rock Solid" list shows known consistent starters (Henry, St. Brown, etc.)
3. CoV=0.0 players with low game counts are excluded
4. "Wild Cards" list still shows volatile high-variance players

## Do NOT Touch

- CoV calculation formula
- Wild Cards sorting logic
- Minimum PPG threshold (2.0 PPG is fine)
