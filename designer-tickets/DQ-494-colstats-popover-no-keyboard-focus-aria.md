---
id: DQ-494
title: Column Stats popover has no keyboard focus management or ARIA role
severity: P2
status: open
component: Lab Screener
phase: Phase 123
---

## Problem

The Column Stats popover (`showColumnStatsPopover()`) is appended to `document.body` as a floating `<div>` but has:

- No `role="dialog"` or `role="tooltip"`
- No `aria-label` or `aria-describedby`
- No `tabindex` — keyboard users cannot reach it
- No focus trap — Tab key leaves the popover
- No focus-on-open — focus stays on the triggering element

A keyboard user who opens the popover via the column header context menu has no way to read the stats or interact with the popover content.

## Location

- `frontend/lab.js:3610-3626` — popover DOM creation
- `frontend/lab.js:3640-3646` — dismiss event listeners

## Fix

```js
pop.setAttribute("role", "dialog");
pop.setAttribute("aria-label", "Column statistics for " + col.label);
pop.setAttribute("tabindex", "-1");
// After positioning:
pop.focus();
```

## Acceptance Criteria

- [ ] Popover has `role="dialog"` and `aria-label`
- [ ] Popover receives focus on open
- [ ] Escape key dismisses and returns focus to trigger element
- [ ] Tab key within popover is non-destructive (doesn't lose popover)
