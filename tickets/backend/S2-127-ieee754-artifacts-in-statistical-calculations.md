---
id: S2-127
severity: S2
confidence: MEDIUM
category: data-quality
source: FUNC-040, FUNC-043
status: OPEN
---

# IEEE 754 floating point artifacts in variance/statistical calculations

## Root Cause

While most SQL aggregations now use `ROUND()` and `_enrich_with_derived_stats()` re-rounds fantasy_points to 1 decimal, two statistical calculation paths feed unrounded float values into variance/standard deviation operations that amplify artifacts:

1. **dynasty.py:596** — `fetch_stock_watch()` appends raw `fantasy_points_ppr` from DB to `weekly_data` list without rounding. These values feed into variance calculation at lines 613-619 for consistency scoring. Intermediate subtractions amplify IEEE 754 noise.

2. **tools.py:1098** — `fetch_consistency_rankings()` appends raw `fantasy_points_ppr` to `scores` list. Values feed into variance/standard deviation at lines 1110-1116. Result: CoV and stddev can show artifacts.

**SQL-side aggregations are properly rounded** (core.py:119-120, nflverse_adapter.py:1387-1389, server.py:306-308). The issue is in Python-side statistical calculations that bypass the enrichment step.

## Fix

Round the float values before statistical calculations:

1. At `dynasty.py:596`, round before append:
```python
weekly_data.append(round(pts, 1) if pts is not None else 0)
```

2. At `tools.py:1098`, round before append:
```python
scores.append(round(pts, 1) if pts is not None else 0)
```

3. Ensure final output values are rounded: `round(stddev, 2)`, `round(cov, 3)`, `round(rbs_score, 1)`.

## Files to Change

- `backend/live_data/dynasty.py:596` — round weekly_data values
- `backend/live_data/tools.py:1098` — round scores values

## Accept When

1. Stock watch consistency scores have no IEEE 754 trailing digits (e.g., 0.45 not 0.44999999999)
2. Consistency rankings stddev/CoV values are clean
3. No regression in the accuracy of statistical measures
