---
id: S2-132
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa flow 7 (week filter PBP leak)
status: OPEN
---

# PBP-derived stats are season-level only — week filter returns NULLs

## Root Cause

`backend/live_data/core.py:504-505` — `_enrich_with_pbp_stats()` has an early return when `week > 0`:

```python
if week and int(week) > 0:
    return items
```

This is a deliberate safeguard because `player_season_pbp` has no `week` column — PBP data is aggregated at the season level. When a user selects Week 1, all PBP fields (gl_carries, scramble_attempts, scramble_yards, play_action_rate, RYOE, success_rate) are NULL instead of showing season context.

**On prod with PBP data populated**, Allen Week 1 shows gl_carries=17 identical to All Weeks — the guard was NOT present in older deployed code. Current code correctly returns NULL but this means users see no PBP data for per-week views.

## Architecture Gap

The `player_week_stats` table has week-level data and filters correctly. The `player_season_pbp` table lacks a `week` column entirely. To support week-level PBP stats requires either:

1. A new `player_week_pbp` table populated by the adapter
2. Or sourcing PBP stats from nflverse play-by-play data at week granularity

## Fix (Recommended)

**Short term:** When week is selected, show season PBP stats with a visual indicator "(season)" next to the column headers so users understand the context. Remove the early return and add a "(season avg)" suffix to PBP values.

**Long term:** Add week-level PBP aggregation in the adapter and populate a `player_week_pbp` table or add a `week` column to `player_season_pbp`.

## Files to Change

- `backend/live_data/core.py:504-505` — remove early return, add context flag
- `adapters/nflverse_adapter.py` — add week-level PBP aggregation (long term)

## Accept When

1. Users see PBP data labeled as "(season)" when viewing per-week stats
2. OR: Week-level PBP data is populated and filters correctly
