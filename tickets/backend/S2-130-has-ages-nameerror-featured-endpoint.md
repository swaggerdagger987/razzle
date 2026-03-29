---
id: S2-130
severity: S2
confidence: HIGH
category: backend
source: FUNC-024
status: OPEN
---

# has_ages NameError in _fetch_featured_uncached when age lookup fails

## Root Cause

`backend/live_data/tools.py:102` — The variable `has_ages` is defined inside a `try` block (line ~38) but referenced outside it. If the age lookup query fails (connection error, table missing), `has_ages` is never assigned, causing a `NameError` that crashes the `/api/featured` endpoint.

```python
try:
    # ... age query ...
    has_ages = True  # only set on success
except:
    pass
# later:
if has_ages:  # NameError if try failed
```

## Fix

Define `has_ages = False` before the try block:
```python
has_ages = False
try:
    # ... age query ...
    has_ages = True
except:
    pass
```

## Files to Change

- `backend/live_data/tools.py:~34-38` — add default `has_ages = False` before try

## Accept When

1. `/api/featured` returns valid data even when age lookup fails
2. No NameError in logs for has_ages
