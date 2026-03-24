---
id: DQ-364
title: Trial expiry warning fires once per session — misses overnight expiration
priority: P2
category: UX / trial
page: app.js
cycle: 47
---

## Problem

The trial warning check in `app.js` (line 1137-1145) uses `sessionStorage.get("razzle_trial_warn")` to suppress repeat warnings within a session. Once shown, it won't show again until the tab is closed and reopened.

Edge case: user opens Razzle at 11 PM with 2 hours left on trial. Warning shows once. They leave the tab open overnight. At 1 AM, trial expires. Next morning they interact with Pro features and get a hard lock with no warning — the warning already fired hours ago.

## How users hit this

- Leave browser tabs open overnight (common)
- Trial expires during a weekend where user checks once per day
- User dismisses the warning early in the session, forgets about it

## Not a duplicate of

- DQ-353: expired trial banner styling (visual styling, not warning logic)
- DQ-266: no trial expiry contradiction (messaging consistency, not timing)

## Fix

Instead of `sessionStorage` (per-tab), use a time-based check: store `razzle_trial_warn_ts` in localStorage and re-warn if >4 hours have passed since last warning AND trial_days_remaining <= 1. This way the warning resurfaces after long gaps.

## Files
- `frontend/app.js` (lines 1137-1145, trial warning check)
