---
id: DQ-230
title: Lab API error fallback targets "labContent" but HTML element is "labMain" — error state may not render
priority: P1
category: error-handling
status: open
cycle: 32
---

## Problem

In lab.js, the error fallback for failed API calls tries to find `document.getElementById("labContent")` to display the error message. But the actual HTML element in lab.html uses `id="labMain"`. This ID mismatch means:

1. If the `/api/filter-options` fetch fails on page load, the error message may not display at all
2. The user sees a perpetual loading state instead of an actionable error
3. The fallback to `.lab-main` class selector may work, but it's fragile

When the production site is down (as it is right now — 502), this is exactly the code path that fires. Users get a blank loading state with no explanation.

## Evidence

- `frontend/lab.js:1128-1135` — `document.getElementById("labContent")` (error fallback)
- `frontend/lab.html:3295` — `id="labMain"` (actual element)

## Fix

Change the ID reference in lab.js:
```javascript
// Before
const el = document.getElementById("labContent");
// After
const el = document.getElementById("labMain");
```

Then verify the error message actually renders by temporarily forcing a failed fetch.

## Files
- `frontend/lab.js:1128-1135`
- `frontend/lab.html:3295`
