---
id: DQ-428
title: Saved Views delete button invisible on touch/mobile — relies on hover
priority: P2
category: UX / mobile
page: lab.html
cycle: 54
---

## Problem

The Saved Views management modal renders a delete button (X) for each saved view. The button uses faint styling (`border:2px solid var(--ink-faint)`) and relies on hover feedback for discoverability. On touch devices:

1. No hover state fires on first tap
2. The button blends into the background due to faint border
3. Users see their saved views list but have no obvious way to delete views

This blocks the "manage saved views" workflow on mobile/tablet — a Pro feature that should work everywhere.

## Evidence

In lab.js ~4563, the delete button is rendered with minimal visual weight:
```javascript
delBtn.style.cssText = "... border:2px solid var(--ink-faint); color:var(--ink-light); ..."
```

No `:active` state, no touch-specific affordance, no always-visible delete icon.

## Fix

Make the delete button always visible with sufficient contrast:
- Change border from `var(--ink-faint)` to `var(--ink-light)`
- Change color from `var(--ink-light)` to `var(--ink-medium)`
- Add `:active` scale-down for touch feedback

Or: use a swipe-to-delete pattern on mobile.

## Files
- `frontend/lab.js` — saved views render function (~line 4560)
