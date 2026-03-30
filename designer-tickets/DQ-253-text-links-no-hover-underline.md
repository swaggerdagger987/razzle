---
id: DQ-253
title: Text links have no hover underline — clickable text is indistinguishable from static text
priority: P2
category: interaction / discoverability
status: open
cycle: 35
---

## Problem

All links globally have `text-decoration: none` (styles.css lines 171, 211, 340, 379, 398, 600). No `:hover` rule adds underline for regular text links. Player name links, panel links, and other in-content hyperlinks have NO visible hover indication.

Users can't tell which text is clickable without guessing and hovering.

## Evidence

`grep -rn "text-decoration: none" frontend/styles.css` returns 6+ rules globally stripping underlines. No corresponding `:hover` rule adds them back for text links.

## Fix

Add to `frontend/styles.css`:
```css
a:hover:not(.nav-links a):not([class*="btn"]):not(.chip) {
  text-decoration: underline;
  text-decoration-color: var(--orange);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
```

This targets only text links, not nav links, buttons, or chips (which have their own hover states).

## Files
- `frontend/styles.css` — add 1 rule (~5 lines)

## Impact
Link discoverability across every page. Users will know what's clickable on hover.
