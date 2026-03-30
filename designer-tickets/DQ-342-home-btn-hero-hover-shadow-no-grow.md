---
id: DQ-342
title: Home page btn-hero hover shadow stays 4px instead of growing to 6px
priority: P2
category: interactive states
page: index.html
cycle: 45
---

## Problem

DESIGN.md specifies hover lift as: `6px 6px 0` + `translate(-2px, -2px)`. The `.btn-hero` class (index.html line 121-124) has the translate correct but the shadow STAYS at 4px instead of growing to 6px:

```css
/* Current (line 121) */
.btn-hero:hover {
    box-shadow: 4px 4px 0 var(--ink);   /* same as rest state! */
    transform: translate(-2px, -2px);
}
```

This means the hero CTAs — the most important buttons on the page — don't "lift" on hover. The shadow stays flat while the element translates, creating a visual disconnect.

## Not a duplicate of

- DQ-002: covers btn-chunky/btn-primary in styles.css (shadow 2px→4px). This is about btn-hero in index.html (shadow 4px→6px on hover).
- DQ-040: covers standalone page cards. This is about the home page hero buttons.

## Fix

```css
.btn-hero:hover {
    box-shadow: 6px 6px 0 var(--ink);
    transform: translate(-2px, -2px);
}
```

## Files
- `frontend/index.html` (line 121-124)
