---
id: S2-076
severity: S2
confidence: MEDIUM
category: input-validation
source: DQ-326
status: OPEN
---

# Formula review text has no length limit — can submit arbitrarily large text

## Root Cause

`backend/live_data/storage.py:342` — `rate_formula()` function only validates HTML tags in review text:

```python
_validate_no_html(review=review)
```

No `len()` check. Review text can be arbitrarily long, limited only by SQLite/network constraints. A single malicious review could store megabytes of text.

## Fix

```python
if review and len(review) > 500:
    raise ValueError("Review text too long (max 500 chars)")
```

Add before the `_validate_no_html` call at line 342.

## Files

- `backend/live_data/storage.py:342` — rate_formula validation
- `backend/server.py:2072-2083` — endpoint handler

## Acceptance Criteria

- Review text capped at 500 characters
- Requests exceeding limit return 400 with clear message
