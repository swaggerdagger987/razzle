<!-- PM: ready -->
# DQ-402: Column Stats Popover Fails Silently on API Error

**Priority**: P1 (broken UX)
**Category**: Error Recovery
**Page**: lab.html (Screener)

## Problem

When the Column Stats popover API call fails (line ~3610 in lab.js), the `.catch()` handler swallows the error silently. The popover renders with empty content — no stats, no error message, no retry option. The user sees a blank popover and has no idea the feature failed.

## Fix

In the `.catch()` handler for column stats fetch, render an error message inside the popover:
```
"couldn't pull stats for this column. right-click again to retry."
```

This matches the Razzle voice (personality loading text, not generic errors).

## Evidence

- Line ~3610: `.catch(err => { /* silent fail */ })` — popover left in broken state
- Compare with screener fetch error at line 1358 which DOES show "fumbled the data fetch"
- DQ-121 covers sitewide fetch .catch gaps, but this is the specific column stats UX
