---
id: DQ-365
title: Trial countdown shows "0 days" when hours remain due to .days floor division
priority: P3
category: UX / billing math
page: auth.py + billing.py
cycle: 47
---

## Problem

Trial days remaining is computed using Python's `timedelta.days` property, which uses floor division:

```python
# auth.py line 274
trial_days_remaining = max(0, (trial_end - now).days)

# billing.py line 578
days_left = (trial_end_dt - datetime.now(timezone.utc)).days
```

If trial expires in 6 hours and 30 minutes, `.days` returns 0. The user sees "0 days remaining" even though they still have access for 6+ more hours. This creates unnecessary panic.

## Impact

User sees "0 days remaining" and thinks their trial is already over, even though they have hours left. They might rush to subscribe (not terrible) or abandon (terrible) thinking the trial already expired.

## Fix

Use ceiling division or return hours when under 1 day:

```python
remaining = trial_end - now
if remaining.days >= 1:
    trial_days_remaining = remaining.days
else:
    trial_hours_remaining = max(1, remaining.seconds // 3600)
    # Return both for frontend to display "X hours remaining"
```

## Files
- `backend/auth.py` (line 274)
- `backend/billing.py` (line 578)
