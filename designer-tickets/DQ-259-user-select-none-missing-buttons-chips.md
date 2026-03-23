---
id: DQ-259
title: Buttons and chips allow text selection — accidental highlight on click
priority: P3
category: interaction polish
status: open
cycle: 35
---

## Problem

Clicking buttons, chips, badges, and other interactive elements can accidentally highlight their text instead of triggering the action. Only `.lab-sidebar-category` (line 291) has `user-select: none`.

All other buttons, chips, position badges, and interactive elements lack this property.

## Evidence

`grep -rn "user-select: none" frontend/styles.css` returns 1 result (sidebar category only).

## Fix

Add to `frontend/styles.css`:
```css
button,
.btn-chunky,
.btn-primary,
.chip,
[role="button"],
.position-badge {
  user-select: none;
}
```

## Files
- `frontend/styles.css` — add 1 rule (~7 lines)

## Impact
Interaction polish. Prevents the jarring text-highlight-on-click that makes buttons feel broken.
