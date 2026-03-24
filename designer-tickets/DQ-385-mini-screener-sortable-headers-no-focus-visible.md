---
id: DQ-385
title: Home page mini-screener sortable column headers lack focus-visible state
priority: P2
category: accessibility
page: index.html
status: open
cycle: 50
---

## Problem

The mini-screener table headers (PPG, GP, Age) are clickable for sorting but have no `:focus-visible` style. Keyboard users who Tab to these sortable headers get no visual indication that the element is focused or interactive.

## Evidence

- `index.html:412-414` — `.mini-table th.mini-sortable` has `:hover` color change but no `:focus-visible`
- These headers have `cursor: pointer` and `onclick` behavior but no keyboard focus ring

## Fix

Add focus-visible to the sortable header styles:

```css
.mini-table th.mini-sortable:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

Also ensure they have `tabindex="0"` if they're `<th>` elements (not natively focusable).

## Verification

1. Load index.html
2. Tab to the mini-screener table headers
3. PPG/GP/Age headers should show orange outline when focused
4. Enter/Space should trigger sort
