---
id: DQ-196
priority: P3
category: border-radius
status: open
---

# DQ-196: border-radius:3px on JS-created position badges and progress bars — off-token

## Problem

`lab-panels.js` creates 3 DOM elements with `border-radius:3px` that are NOT inner bar fills:

| Line | Element | What it is |
|------|---------|------------|
| 9579 | `<div>` | Hit rate progress bar TRACK (outer container) |
| 9580 | `<div>` | Hit rate progress bar FILL (inner fill) |
| 9646 | `<span>` | Position badge (e.g., "QB", "WR") |

The position badge (9646) is the most visible — it has `background`, `color:var(--text-on-accent)`, `padding:1px 6px`, `font-size:10px`. At 3px radius on a tiny badge, corners are barely rounded.

## Fix

- **Line 9579** (track): `border-radius:3px` → `border-radius:var(--radius-sm)` (8px)
- **Line 9580** (fill): `border-radius:3px` → `border-radius:6px` (inner fill exception)
- **Line 9646** (badge): `border-radius:3px` → `border-radius:var(--radius-sm)` (8px)

## Scope

3 edits in `frontend/lab-panels.js`.
