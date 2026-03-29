---
id: S3-087
severity: S3
confidence: LOW
category: feature-request
source: BUG-004
status: OPEN
---

# Dynasty Rankings missing historical end-of-season valuations

## Root Cause

Dynasty values are computed live from current season data. There is no mechanism to store end-of-season snapshots of dynasty values for historical comparison (e.g., "what was Player X worth at end of 2023?").

This limits the usefulness of dynasty trade value history and trend analysis.

## Fix

Options:
1. Add a `dynasty_value_snapshots` table storing player_id, season, end_of_season_value
2. Run a snapshot job at end of each season (or import historical values from community sources like KeepTradeCut/FantasyCalc)
3. Lower priority — the dynasty sparkline in player profiles would benefit from this data

## Files

- `backend/live_data/dynasty.py` — dynasty value computation
- `data/terminal.db` — would need new table

## Acceptance Criteria

- Historical dynasty values available for prior seasons
- Dynasty sparkline shows real historical values (not just current season)
