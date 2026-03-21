# FUNC-020: GET /api/players silently falls back to PPR for derived sort keys

## Severity: P2 (downgraded from P1)

## Summary
The GET `/api/players` endpoint silently ignores derived sort keys (wopr, target_share, yards_per_carry, catch_rate, etc.) and falls back to PPR order. The POST `/api/screener/query` endpoint handles these correctly with Python re-sort.

## Status Update (Session 24)
**Partially fixed.** The main screener uses POST `/api/screener/query` which has:
- `python_sort` flag for derived/rate metrics
- `sql_limit = 2000` for wider fetch window
- `float('-inf')`/`float('inf')` null sentinels
- Post-query Python re-sort with correct pagination

**Severity downgraded to P2** because:
1. The frontend screener exclusively uses POST `/api/screener/query` (line 1277 of lab.js)
2. The GET `/api/players` endpoint is only used for secondary lookups (compare, trade values)
3. No user-facing sort is affected

## Root Cause
In `fetch_players()` (players.py lines 117-119):
```python
_sort_key = sort_key
if _sort_key not in safe_sorts:
    _sort_key = "fantasy_points_ppr"
```
Derived sort keys (wopr, target_share, etc.) are not in `safe_sorts`, so they silently fall back to PPR. Unlike `screener_query()`, this function has no `python_sort` re-sort step.

## Evidence
```
# Production test (2026-03-20):
GET /api/players?limit=5&sort=wopr&direction=desc&position=WR&season=2025
  Puka Nacua: WOPR=0.709, PPR=375.0  (should be 4th by WOPR)
  JSN: WOPR=0.867, PPR=360.0          (should be 1st by WOPR)
  → Returns PPR order, not WOPR order

POST /api/screener/query {sort_key:"wopr",sort_dir:"desc",position:"WR",limit:5}
  Garrett Wilson: WOPR=0.925  ✓ correct
  JSN: WOPR=0.867              ✓ correct
  → Returns correct WOPR order
```

## Fix
Add `python_sort` logic to `fetch_players()` matching `screener_query()`:
1. Detect when sort_key is a derived/rate metric
2. Fetch 2000 rows sorted by PPR
3. Enrich with rate metrics
4. Python re-sort by requested metric
5. Paginate after re-sort

Low priority since no user-facing feature depends on GET sort for derived metrics.
