# FUNC-046: IEEE 754 Floating Point Artifacts in Player Profile Career Totals

**Severity**: P2
**Flow**: 14 (Player profile: Career stats)
**Found**: Session 45 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-043 (same IEEE 754 class, different location)

## Description

Player profile career totals accumulate IEEE 754 floating point artifacts when summing season stats across multiple years. The `fantasy_points_ppr`, `fantasy_points_std`, and potentially other float columns display trailing garbage digits.

**Examples:**
- Christian McCaffrey career `fantasy_points_std` = `1889.2999999999997` (should be `1889.3`)
- Ja'Marr Chase career `fantasy_points_ppr` = `1526.3000000000002` (should be `1526.3`)
- Ja'Marr Chase career `fantasy_points_std` = `1006.3000000000001` (should be `1006.3`)

Players with many seasons (more SUM operations) are more likely to exhibit this.

## Root Cause

**players.py:743**:
```python
career[key] = sum(s.get(key) or 0 for s in seasons)
```

Python's `sum()` of floats accumulates IEEE 754 errors. No `round()` is applied to the career totals, unlike the per-season SQL `ROUND()` calls.

## Fix

Add `round(, 1)` to the career sum:

```python
career[key] = round(sum(s.get(key) or 0 for s in seasons), 1)
```

This matches the FUNC-043 fix pattern (round at the point of aggregation).

## Verification

1. `GET /api/players/00-0033280/profile` → career.fantasy_points_std should be `1889.3` not `1889.2999999999997`
2. `GET /api/players/00-0036900/profile` → career.fantasy_points_ppr should be `1526.3` not `1526.3000000000002`
3. No career stat value should have more than 1 decimal digit
