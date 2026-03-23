# DQ-002: btn-chunky and btn-primary box-shadow too thin (2px, should be 4px)

**Priority**: P1 — primary buttons on every page
**Category**: Box shadow / chunky feel
**Files**: `frontend/styles.css:761,766,771,789,794,799`

## Problem

DESIGN.md says: "Box shadows: `4px 4px 0 var(--ink)` on cards, containers" and "Hover lift: `6px 6px 0` + `translate(-2px, -2px)`"

But `.btn-chunky` and `.btn-primary` both use:
- Rest: `2px 2px 0` (should be `4px 4px 0`)
- Hover: `3px 3px 0` (should be `6px 6px 0` + translate)
- Active: `1px 1px 0` (acceptable for pressed state)

Buttons are the primary interactive element. They should feel chunky per the design guide, not flat.

## Fix

```css
/* .btn-chunky (line 761) */
box-shadow: 4px 4px 0 var(--ink);

/* .btn-chunky:hover (line 766) */
box-shadow: 6px 6px 0 var(--ink);
transform: translate(-2px, -2px);

/* Same for .btn-primary (lines 789, 794) */
```

## Verification

Every button on the site should pop off the page with a chunky offset shadow, and lift visibly on hover.
