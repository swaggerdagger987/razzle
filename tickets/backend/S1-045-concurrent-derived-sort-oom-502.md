---
id: S1-045
severity: S1
confidence: HIGH
category: performance
source: functional-qa prod sweep (3 concurrent derived sort 502)
status: OPEN
---

# Concurrent derived sort requests cause 502 OOM crash on Render

## Root Cause

`backend/live_data/players.py:489-491` — When sorting by derived metrics (WOPR, target_share, yards_per_carry), `python_sort=True` triggers an over-fetch of up to 5,000 rows:

```python
if python_sort or post_filters:
    sql_limit = min(total, 5000)
    sql_offset = 0
```

Each request then runs 7 sequential enrichment functions on all 5,000 rows (`:500-506`), each adding fields and making DB queries:
- `_enrich_with_derived_stats`
- `_enrich_with_rate_metrics` (batch query for 5K player_ids)
- `_enrich_with_epa_per_play`
- `_enrich_with_breakout` (batch season query)
- `_enrich_with_dynasty_value`
- `_enrich_with_team_shares`
- `_enrich_with_pbp_stats`

**Memory per request:** ~50-60MB (5K dicts × 30+ fields × enrichment data)

With `server.py:422` setting `ThreadPoolExecutor(max_workers=20)` and `render.yaml` running 2 uvicorn workers, 3 concurrent derived sort requests consume ~150-180MB, likely exceeding Render's available headroom and triggering OOM → 502 with ~40s recovery.

The same pattern exists in `fetch_players()` at `:204-206`.

## Fix

Reduce the over-fetch cap and/or add request-level memory limits:

1. **Cap derived sort over-fetch to 500-1000** (not 5000) — most users only see page 1 (25-50 results)
2. **Add pagination to enrichment** — only enrich the final page slice, not all 5000
3. **Add a concurrency semaphore** for heavy queries (max 2 concurrent derived sorts)
4. Alternatively, move WOPR/target_share into SQL views or materialized columns so they don't need Python sort

## Files to Change

- `backend/live_data/players.py:489-491` — reduce sql_limit for derived sorts
- `backend/live_data/players.py:204-206` — same fix in fetch_players
- `backend/live_data/players.py:500-506` — enrich only the final slice

## Accept When

1. 3 concurrent derived sort requests don't crash the server
2. Derived sort results are still correct (top-N by metric)
3. Memory usage stays under 100MB per request
