---
id: DQ-348
title: Canvas placeholder icon uses cold black rgba(0,0,0) drop-shadow
priority: P3
category: design tokens
page: agents.html
cycle: 45
---

## Problem

The Situation Room canvas placeholder icon (tiger emoji) has a drop-shadow using cold black:

```css
/* agents.html line 285 */
.canvas-placeholder-icon {
    font-size: 48px;
    filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
    animation: pulse-glow 2s ease-in-out infinite;
}
```

DESIGN.md specifies warm espresso ink for all shadows: `var(--ink)` = `#2d1f14`. Cold black `rgba(0,0,0)` breaks the warm palette.

## Not a duplicate of

- DQ-018: covers cold black shadows in agents.html card sections (lines 39, 259, 285 — but 285 was listed as part of that ticket's line range). However, DQ-018 was about box-shadows on cards, not filter drop-shadows on icons. The drop-shadow syntax is different and requires a different fix.
- DQ-023: covers dark mode overlays using rgba(0,0,0) in lab.html/player.js, not agents.html.

## Fix

```css
.canvas-placeholder-icon {
    filter: drop-shadow(2px 2px 0 var(--ink));
}
```

Note: CSS filter drop-shadow supports var() in modern browsers.

## Files
- `frontend/agents.html` (line 285)
