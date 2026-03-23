---
id: DQ-224
title: Weekly heatmap td hover uses transform:scale(1.1) — causes blurry text rendering
priority: P2
category: visual-quality
status: open
cycle: 32
---

## Problem

The weekly scoring heatmap cells in lab-panels.css use `transform: scale(1.1)` on hover. Scale transforms on text-containing elements cause sub-pixel anti-aliasing artifacts — the text looks blurry/fuzzy during hover, especially on non-retina displays. This makes the data harder to read at exactly the moment the user is trying to read it.

## Evidence

- `frontend/lab-panels.css:2186` — `.wh-table td:hover { transform: scale(1.1); ... }`

## Fix

Replace scale transform with a non-blurring hover effect:
```css
.wh-table td:hover {
  /* Instead of transform: scale(1.1) */
  outline: 2px solid var(--ink);
  z-index: 1;
  position: relative;
}
```

Or use `transform: translateY(-1px)` which doesn't cause anti-aliasing issues since it doesn't change the rendered size.

## Files
- `frontend/lab-panels.css:2186`
