---
id: S1-037
severity: S1
confidence: HIGH
category: billing
source: DQ-365+DQ-364
status: OPEN
---

# Trial countdown shows "0 days" when hours remain — floor division bug

## Root Cause

`frontend/app.js` trial countdown calculation uses `.days` property from a date difference, which floors to whole days. A trial expiring in 18 hours shows "0 days remaining" instead of "less than 1 day" or "18 hours."

Additionally (DQ-364), the trial expiry warning fires once per session on page load. If a user loads the page at 11pm and their trial expires at 2am, they get no warning during that session — the overnight expiration goes unnoticed until they refresh the next day.

## Root Cause (file:line)

**Backend floor division** — `backend/billing.py:578-579`:
```python
days_left = (trial_end_dt - datetime.now(timezone.utc)).days
result["trial_days_remaining"] = max(0, days_left)
```
`.days` property floors to integer days. A trial expiring in 18 hours returns `days_left = 0`.

**Frontend display** — `frontend/app.js:1148-1149`:
```javascript
var daysLeft = user.trial_days_remaining || 0;
badge = '<span class="nav-plan-badge nav-plan-trial">Trial ' + daysLeft + 'd</span>';
```
Displays the raw integer with no sub-day granularity. Shows "Trial 0d" for the final 23 hours.

**Second display** — `frontend/app.js:1159`:
```javascript
'Pro trial: ' + (user.trial_days_remaining || 0) + ' days remaining'
```
Same issue in dropdown.

**Warning logic** — `frontend/app.js:1190`:
```javascript
if (isTrial && (user.trial_days_remaining || 0) <= 2 && !sessionStorage.getItem("razzle_trial_warn") && !window._checkoutInProgress) {
```
Only fires on page load (DOMContentLoaded). No `setInterval` for mid-session expiry detection.

## Fix

1. In `billing.py:578-579`, return fractional hours when < 24h remaining: `hours_left = (trial_end_dt - now).total_seconds() / 3600`
2. In `app.js:1148-1149`, show "< 1 day" or "Xh" when `trial_days_remaining === 0` but trial is still active
3. Add a `setInterval` check (every 30 minutes) that re-evaluates trial status

## Files to Change

- `backend/billing.py:578-579` — floor division to fractional
- `frontend/app.js:1148-1149` — nav badge display
- `frontend/app.js:1159` — dropdown display
- `frontend/app.js:1190` — add setInterval for mid-session warning

## Acceptance Criteria

1. Trial with 18 hours remaining shows "less than 1 day" or "18 hours remaining"
2. Trial with 2 hours remaining shows "2 hours remaining"
3. If trial expires while page is open, user sees a warning within 30 minutes
4. Full days still show correctly (e.g., "3 days remaining")
