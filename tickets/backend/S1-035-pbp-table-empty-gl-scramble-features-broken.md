---
id: S1-035
severity: S1
confidence: HIGH
category: data
source: functional-qa/results.tsv FUNC-031 (2026-03-21)
status: OPEN
---

# player_season_pbp table has 0 rows — all PBP features return null

## Root Cause

The `player_season_pbp` table exists in `data/terminal.db` with the correct schema, but contains 0 rows. The nflverse adapter has code to populate PBP data (`adapters/nflverse_adapter.py`), but the PBP import has not been run against the current production database.

Verified by functional QA: `SELECT COUNT(*) FROM player_season_pbp` returns 0.

## Impact

All play-by-play dependent features return null data:
- **Red Zone** (`/redzone.html`) — `gl_carries`, `gl_targets`, `gl_tds` all null
- **Success Rate** (`/successrate.html`) — success rate calculations empty
- **Game Script** (`/gamescript.html`) — winning/losing script splits empty
- **Screener PBP columns**: scramble rate, play action rate, RYOE, success rate — all null
- **Player profiles**: PBP section shows no data

The backend gracefully handles the empty table (returns empty arrays), so pages don't crash — they just show no data.

## Fix

Run the PBP data import:
```python
from adapters.nflverse_adapter import sync_pbp_data
sync_pbp_data()  # imports play-by-play aggregates for all seasons
```

Then upload the updated `terminal_clean.db` to the GitHub release.

## Files

- `adapters/nflverse_adapter.py` — PBP sync function (code exists, never run on current DB)
- `data/terminal.db` — `player_season_pbp` table needs rows
- `backend/live_data/analytics.py:2290` — checks table exists, returns empty if no data
- `backend/live_data/tools.py:1691+` — multiple queries JOIN on player_season_pbp

## Accept When

1. `SELECT COUNT(*) FROM player_season_pbp` returns > 5,000 rows
2. Red Zone page shows goal-line carries/targets for top RBs (e.g., Henry, Bijan)
3. Success Rate page shows per-play success rates
4. Updated DB uploaded to GitHub release

## Do NOT Touch

- Backend query code — it correctly handles empty tables with graceful fallbacks
- Frontend display code — it already renders PBP data when available
