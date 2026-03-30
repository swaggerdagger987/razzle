---
id: DQ-326
title: Formula review text has no length limit — unbounded DB storage
priority: P3
category: input-validation
page: backend
---

## Problem
The formula rating endpoint accepts a `review` field with no length validation:

**server.py line 2076-2077:**
```python
rating=body.get("rating", 0),
review=body.get("review", ""),
```

**storage.py rate_formula:**
- `rating` is validated to 1-5 range (correct)
- `review` is checked for HTML injection via `_validate_no_html` (correct)
- `review` has NO length limit — a user can POST a 10MB review string

The review is stored directly in SQLite. Repeated large reviews could inflate the database.

## Expected
Cap review text to a reasonable length (e.g., 500 characters):
```python
review = body.get("review", "")[:500]
```

## Fix
- `backend/live_data/storage.py` line ~335: add `review = str(review)[:500]` before storing
- Or in `backend/server.py` line 2077: truncate before passing to storage

One line change.

## Files
- `backend/live_data/storage.py` or `backend/server.py`
