---
id: S1-031
severity: S1
confidence: HIGH
category: input-validation
source: DQ-329
status: OPEN
---

# Screener filter accepts Inf, NaN, and extreme float values

## Root Cause

Filter value validation in `backend/live_data/players.py:410-416` converts to float without bounds checking:

```python
try:
    fval = float(val)
except (ValueError, TypeError):
    continue
```

This accepts:
- `float("inf")` and `float("-inf")` — produces SQL `WHERE stat >= inf` (always false, returns empty)
- `float("nan")` — produces SQL `WHERE stat >= nan` (undefined behavior in SQLite)
- Extreme values like `999999999999` — wastes query time on impossible conditions

## Impact

- `nan` filter values cause undefined SQLite comparison behavior
- Extreme values don't crash but produce useless queries
- Input validation gap — all other inputs (limit, offset, season) are validated

## Fix

```python
try:
    fval = float(val)
except (ValueError, TypeError):
    continue
if math.isinf(fval) or math.isnan(fval):
    continue
fval = max(-1e9, min(fval, 1e9))  # cap to reasonable range
```

Add `import math` if not present. Three lines added to filter validation.

## Files

- `backend/live_data/players.py:410-416` — filter value float conversion

## Acceptance Criteria

- `float("inf")`, `float("-inf")`, and `float("nan")` filter values are rejected (skipped)
- Extreme float values are capped to a reasonable range
- Normal filter values (0-10000 range) continue to work
