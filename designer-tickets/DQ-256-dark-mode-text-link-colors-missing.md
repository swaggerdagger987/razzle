---
id: DQ-256
title: Dark mode text link colors missing — non-nav links invisible or wrong color
priority: P2
category: dark mode
status: open
cycle: 35
---

## Problem

Nav links have dark mode color overrides (`[data-theme="dark"] .nav-links a`). But regular text links — player names, panel links, inline hyperlinks — have NO dark mode color override.

In dark mode, links using `color: var(--ink)` or `color: var(--orange)` may work by accident (orange on dark is fine), but links inheriting default colors or using `color: var(--ink-medium)` become hard to read against the dark background.

## Evidence

`grep -rn 'data-theme.*dark.*\ba\b' frontend/styles.css` shows nav link overrides only. No rule targets `a` in general for dark mode.

Player name links in tables, for example, inherit ink color which flips correctly via CSS vars. But any link styled with a hardcoded or non-var color becomes invisible.

## Fix

Add to `frontend/styles.css`:
```css
[data-theme="dark"] a:not(.nav-links a):not([class*="btn"]):not(.chip) {
  color: var(--orange);
}
```

This ensures all text links are visible in dark mode using the brand accent.

## Files
- `frontend/styles.css` — add 1 rule

## Impact
Dark mode usability. Links that happen to work in light mode become invisible in dark.
