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

## Fix

1. When remaining time is < 24 hours but > 0, show "less than 1 day" or "X hours remaining" instead of "0 days"
2. Add a `setInterval` check (every 30 minutes) that re-evaluates trial status and shows a warning if trial expires mid-session

## Files to Change

- `frontend/app.js` — trial countdown display logic (search for `trial_end` date diff)

## Acceptance Criteria

1. Trial with 18 hours remaining shows "less than 1 day" or "18 hours remaining"
2. Trial with 2 hours remaining shows "2 hours remaining"
3. If trial expires while page is open, user sees a warning within 30 minutes
4. Full days still show correctly (e.g., "3 days remaining")
