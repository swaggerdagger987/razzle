---
id: S2-065
severity: S2
confidence: HIGH
category: input-validation
source: DQ-325
status: OPEN
---

# Screener offset parameter has no upper bound — query DoS potential

## Root Cause

`backend/live_data/players.py:262`:

```python
offset = max(0, _safe_int(body.get("offset", 0)))
```

`max(0, ...)` prevents negatives but allows `offset=1000000000`. SQLite executes `OFFSET 1000000000`, scanning and skipping rows before returning. Compare with `limit` which is properly bounded:

```python
limit = max(1, min(_safe_int(body.get("limit", 200), 200), 1000))
```

## Fix

```python
offset = max(0, min(_safe_int(body.get("offset", 0)), 100000))
```

One line change.

## Files

- `backend/live_data/players.py:262`

## Acceptance Criteria

- Offset capped to 100000 or similar reasonable maximum
- Normal pagination (offset 0-10000) continues to work
