---
id: DQ-325
title: Screener offset parameter has no upper bound — query DoS potential
priority: P2
category: input-validation
page: backend
---

## Problem
The screener POST endpoint accepts `offset` with no upper bound:

**players.py line 262:**
```python
offset = max(0, _safe_int(body.get("offset", 0)))
```

`max(0, ...)` prevents negative values but allows `offset=1000000000`. SQLite will execute `OFFSET 1000000000` which scans and skips a billion rows before returning results — expensive even if the result set is small.

**Compare with `limit` (properly bounded):**
```python
limit = max(1, min(_safe_int(body.get("limit", 200), 200), 1000))
```

## Expected
Cap offset to a reasonable maximum:
```python
offset = max(0, min(_safe_int(body.get("offset", 0)), 100000))
```

Or calculate max offset from total count: `offset = min(offset, total_count)`.

## Fix
- `backend/live_data/players.py` line 262: add `min(..., 100000)` or similar cap

One line change.

## Files
- `backend/live_data/players.py`
