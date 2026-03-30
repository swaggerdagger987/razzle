---
id: DQ-261
title: Dense mode table header font (10px) is smaller than body text (11px) — hierarchy inversion
priority: P2
category: design-system
status: open
cycle: 36
---

## Problem

In the Lab screener's dense/compact mode (D key toggle), table headers shrink to 10px while body cells shrink to 11px. Headers become SMALLER than the data they label. This inverts the visual hierarchy — headers should always be >= body text size.

Normal mode is correct: headers at 11px, body at 13px.

## Evidence

`frontend/lab.html` lines 1255-1269:
```css
body.dense-mode .screener-table td {
  padding: 3px 8px;
  font-size: 11px;
}
body.dense-mode .screener-table th {
  padding: 5px 8px;
  font-size: 10px;  /* SMALLER than body 11px */
}
```

## Fix

Change dense mode th font-size from 10px to 11px (matching td):
```css
body.dense-mode .screener-table th {
  padding: 5px 8px;
  font-size: 11px;
}
```

## Files
- `frontend/lab.html` line ~1262 — change font-size: 10px to 11px

## Impact
Every user who toggles dense mode sees inverted hierarchy. 1-character fix.
