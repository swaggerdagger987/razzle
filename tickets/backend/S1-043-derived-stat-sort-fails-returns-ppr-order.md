---
id: S1-043
severity: S1
confidence: HIGH
category: ui-bug
source: FUNC-020
status: OPEN
---

# Derived stat sorts (WOPR, target_share, yards_per_carry) return PPR order

## Root Cause

`backend/live_data/players.py:242` and `:534` — When a user sorts by a derived metric (WOPR, target_share, yards_per_carry, etc.), the Python re-sort runs but fails silently because many players have `None` values for these metrics.

**Data flow:**
1. Derived metrics are NOT in `_sql_sortable` (lines 163-174), so `_python_sort=True`
2. SQL query falls back to `ORDER BY fantasy_points_ppr` (line 178, `_effective_sort`)
3. `_enrich_with_rate_metrics()` (`core.py:338-387`) fetches from `player_week_metrics` table
4. Players WITHOUT data in `player_week_metrics` get `None` for the metric
5. Python sort at line 242 assigns `float('-inf')` or `float('inf')` to `None` values
6. If most/all players have `None`, they maintain the SQL PPR order

**Result:** User sees PPR-ordered results when they expect WOPR/target_share ordering.

## Fix

Two approaches (pick one):

**Option A (preferred):** In `_enrich_with_rate_metrics()` at `core.py:384-385`, ensure derived stats are populated from the SQL query data when `player_week_metrics` has no data. For example, `target_share` can be computed from `targets / team_targets` inline.

**Option B:** In the Python re-sort (lines 242, 534), treat `None` as 0.0 instead of sentinel values for numeric sort columns:
```python
items.sort(key=lambda x: x.get(_sort_key) or 0.0, reverse=reverse)
```

Also: verify `player_week_metrics` table is actually populated for these stats. If the table is empty or incomplete, the root cause is the adapter not writing rate metrics.

## Files to Change

- `backend/live_data/players.py:239-243` — fetch_players Python re-sort
- `backend/live_data/players.py:531-534` — _fetch_screener_uncached Python re-sort
- `backend/live_data/core.py:338-387` — _enrich_with_rate_metrics (verify data exists)

## Accept When

1. `GET /api/players?sort=target_share&sort_dir=desc` returns JSN (0.368) at #1, not default PPR leader
2. `GET /api/players?sort=wopr&sort_dir=desc` returns actual WOPR leaders
3. Screener sort by any derived stat column shows correct ordering
4. Players with no data for the metric appear at the bottom, not interleaved

## Do NOT Touch

- SQL-sortable columns (these work correctly)
- Frontend sort request logic
