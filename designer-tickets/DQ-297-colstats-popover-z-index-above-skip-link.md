---
id: DQ-297
title: colstats-popover z-index 10001 stacks above skip-link (10000)
priority: P2
category: accessibility / z-index
page: lab.html
status: open
cycle: 39
---

## What's wrong

The column stats popover (lab.html:1098) uses `z-index: 10001`, which is ABOVE the skip-link's `z-index: 10000` (styles.css:390).

The skip-link is the highest-priority accessibility element on the page — it must always be the topmost focusable element. If a keyboard user Tab-focuses the skip-link while the column stats popover is open, the popover covers it.

## Evidence

- lab.html:1098: `.colstats-popover { position: fixed; z-index: 10001; }`
- styles.css:390: `.skip-link:focus { z-index: 10000; }`
- app.js:824: Welcome confetti also uses z-index 10001 (same issue)

## Fix

Lower the colstats-popover to `z-index: 9500` (below mobile nav at 9999, below skip-link at 10000):

```css
.colstats-popover {
  position: fixed;
  z-index: 9500;
  /* ... */
}
```

Also change the confetti z-index in app.js to 9500.

## Not a dupe of

- DQ-029 documents the z-index hierarchy but does NOT mention 10001 (colstats-popover was added in Phase 123, after DQ-029)
- pending-158 is a general z-index governance ticket — this is a specific accessibility violation

## Files
- `frontend/lab.html` line 1098
- `frontend/app.js` line 824
