---
id: S1-021
severity: S1
category: backend
title: Puka Nacua 2025 drop rate (17.8%) — investigate if inflated by nflverse definition
source: deep-audit
status: open
---

## Problem

Nacua's 2025 season shows 129 receptions with 23 drops (17.8% drop rate). For a player with 77.7% catch rate, this seems contradictory. 166 targets * (1 - 0.777) = ~37 incompletions, meaning 23 of 37 incompletions were drops (62%). This is plausible but worth investigating — nflverse may count contested catches or throwaways differently.

## Root Cause

**Drop rate calculation** — `backend/live_data/tools.py:2722-2810`:
```python
def fetch_drop_rate(season=None, position=None, limit=50, week=None):
```

**Data extraction** — `backend/live_data/tools.py:2746`:
```python
pb.drops, pb.drop_rate,
```

Drops come from `player_season_pbp` table, which is derived from play-by-play data. The `drop_rate` is pre-calculated in the PBP adapter.

**Potential issue**: nflverse PBP may define "drop" differently than the traditional definition. Some PBP sources count any incomplete pass where the receiver was the intended target as a drop, while traditional stats only count catchable balls that hit the receiver's hands.

## Fix

1. Verify Nacua's drop count against a second source (Pro Football Reference, etc.)
2. If nflverse's drop definition is broader, add a methodology tooltip: "Drops per nflverse PBP data — includes contested targets"
3. If the data is genuinely wrong, investigate the PBP adapter's drop attribution logic

## Accept When

- Nacua's drop count is verified against an external source
- If the definition differs from traditional, a tooltip explains the methodology
- Drop rate page accurately reflects the data source's definition
