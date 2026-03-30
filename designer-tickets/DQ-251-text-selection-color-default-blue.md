---
id: DQ-251
title: Text selection uses default browser blue — should be brand terracotta
priority: P2
category: design-system
status: open
cycle: 35
---

## Problem

When users highlight/select text anywhere on the site, they see the browser's default blue selection color. This breaks the warm sand + espresso aesthetic. Every other visual element uses the brand palette, but text selection leaks browser chrome.

No `::selection` pseudo-element exists in styles.css.

## Evidence

`grep -r "::selection" frontend/` returns 0 results.

## Fix

Add to `frontend/styles.css`:
```css
::selection {
  background: var(--orange-light);
  color: var(--ink);
}
[data-theme="dark"] ::selection {
  background: var(--orange);
  color: var(--bg);
}
```

## Files
- `frontend/styles.css` — add 2 rules

## Impact
Every user who highlights text sees the brand leak. 2-line fix.
