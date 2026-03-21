# FUNC-040: Floating Point Precision in API Responses

**Severity**: P2
**Flow**: Multiple (screener, efficiency, any panel returning stat totals)
**Status**: OPEN

## Problem

API responses return floating point artifacts in stat totals. SQLite SUM() of float columns accumulates IEEE 754 errors.

## Examples (prod, 2025 season)

| Player | PPR (returned) | PPR (expected) |
|--------|---------------|----------------|
| Christian McCaffrey | 416.59999999999997 | 416.6 |
| Jahmyr Gibbs | 366.90000000000003 | 366.9 |
| Jonathan Taylor | 362.29999999999995 | 362.3 |
| Devon Achane | 322.79999999999995 | 322.8 |

PPG is already rounded (clean), but raw stat totals (fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_std) are not.

## Impact

- CSV export would show ugly numbers (355.2999999999999)
- Any API consumer or display that doesn't round client-side sees junk precision
- PPG is fine because backend rounds `total / games`, but totals bypass rounding

## Fix

Round stat totals to 1 decimal in the backend query or post-processing. For screener:
- `ROUND(SUM(s.fantasy_points_ppr), 1)` in SQL, or
- `round(total_ppr, 1)` in Python post-processing

Apply to: `fetch_players()`, `screener_query()`, and any endpoint returning summed fantasy point totals.

## Files

- `backend/live_data/players.py` — fetch_players, screener_query
- `backend/live_data/dashboards.py` — multiple endpoints sum fantasy points
