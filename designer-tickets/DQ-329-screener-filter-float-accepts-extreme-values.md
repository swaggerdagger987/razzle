---
id: DQ-329
title: Screener filter float values accept extreme inputs without range bounds
priority: P2
category: input-validation
page: backend
---

## Problem
Screener filter values are cast to `float()` with no range validation:

**players.py line 410:**
```python
try:
    fval = float(val)
except (ValueError, TypeError):
    continue
```

This accepts:
- `float('inf')` / `float('-inf')` — produces `WHERE stat >= inf` (matches nothing, expensive scan)
- `1e308` — near float max, same effect
- Negative values for stats that can't be negative (PPG, games played)
- Extremely precise values (`3.14159265358979`) that will never match

The filter is passed directly to SQL: `having.append(f"{sql_expr} {op} ?")` with `params.append(fval)`.

## Impact
- Attacker sends `{"filters": [{"key":"fantasy_points_ppr","op":"gte","value":"1e308"}]}` × 50 filters
- Each filter adds a HAVING clause, creating an expensive query
- Repeated calls = query DoS on SQLite

## Expected
Validate filter values to sane ranges:
```python
fval = float(val)
if not math.isfinite(fval) or fval < -1000 or fval > 100000:
    continue
```

## Fix
- `backend/live_data/players.py` line ~410: add `math.isfinite()` check and reasonable bounds
- Import `math` if not already imported

3-4 lines added.

## Files
- `backend/live_data/players.py`
