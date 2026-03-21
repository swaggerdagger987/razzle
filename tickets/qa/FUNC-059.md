# FUNC-059: IEEE 754 floating point artifacts in screener PPR/HPPR/STD totals on prod

**Severity**: P2
**Flow**: 4 (Screener Sort), 44 (Scoring breakdown)
**Found**: Session 54, 2026-03-21
**Status**: OPEN

## Summary

The screener API returns raw float sums for `fantasy_points_ppr`, `fantasy_points_half_ppr`, and `fantasy_points_std` without rounding. IEEE 754 floating point arithmetic causes ugly display artifacts like `416.59999999999997` instead of `416.6`.

## Impact

- 13/20 top players show artifacts (65%)
- Not a data accuracy issue — values are mathematically correct within floating point precision
- But it looks broken to users and undermines trust in the data
- A dynasty veteran sees `416.59999999999997` and thinks "this tool can't even add up points correctly"

## Evidence (prod 2025 RBs)

```
Christian McCaffrey: 416.59999999999997 (should be 416.6)
Jahmyr Gibbs: 366.90000000000003 (should be 366.9)
Jonathan Taylor: 362.29999999999995 (should be 362.3)
Amon-Ra St. Brown: 323.99999999999994 (should be 324.0)
```

## Fix

Round all float columns to 1 decimal in the screener query response. The fix should be in `core.py` or `players.py` where season totals are computed — apply `round(value, 1)` to all fantasy point sums.

Previous FUNC-046 fixed this for career stats (`round(..., 1)` in players.py:743). The same pattern needs to be applied to single-season totals in the screener response.

## Verification

```bash
curl -s -X POST 'https://razzle.lol/api/screener/query' \
  -H 'Content-Type: application/json' \
  -d '{"position":"RB","season":2025,"sort_key":"fantasy_points_ppr","sort_dir":"desc","limit":5}'
# All fantasy_points_ppr values should have max 1 decimal place
```
