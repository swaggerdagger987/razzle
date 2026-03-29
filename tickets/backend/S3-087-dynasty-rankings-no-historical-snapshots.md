---
id: S3-087
severity: S3
confidence: LOW
category: feature-request
source: BUG-004
status: OPEN
---

# Dynasty Rankings missing historical end-of-season valuations

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Endpoint**: `backend/server.py:2489-2494` — `GET /api/dynasty-rankings`
**Handler**: `backend/live_data/dynasty.py:261-262` — `fetch_dynasty_rankings()` with caching
**Computation**: `dynasty.py:166-253` — `_fetch_dynasty_rankings_uncached()` — accepts `season` param

The endpoint DOES support querying historical seasons (e.g., `?season=2023`), and it correctly computes rankings using that season's stats. But it does NOT store dated snapshots — rankings are recomputed from current `player_week_stats` data each time.

A separate endpoint `/api/dynasty-history` (`server.py:2497-2506`) provides per-player value progression across seasons, but this also recomputes rather than reading stored snapshots.

**What's missing**: A `dynasty_value_snapshots` table that stores `(player_id, season, snapshot_date, value)` so historical rankings reflect what they were at that point in time, not a recomputation with current code/thresholds.

## Fix

1. Add `dynasty_value_snapshots` table to terminal.db schema
2. Run end-of-season snapshot job after final week of each season
3. Dynasty sparkline and history endpoints read from snapshots for past seasons

## Files

- `backend/live_data/dynasty.py:166-253` — computation logic to snapshot
- `backend/server.py:2489-2506` — endpoints that would read from snapshots
- `data/terminal.db` — new table needed

## Acceptance Criteria

- Historical dynasty values available for prior seasons
- Dynasty sparkline shows real historical values (not just current season)
