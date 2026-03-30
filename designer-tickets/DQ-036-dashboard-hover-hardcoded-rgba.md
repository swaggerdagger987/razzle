# DQ-036: Dashboard hover state uses hardcoded rgba

**Priority**: P3 — token violation
**Page**: dashboard.html
**Category**: Color tokens

## Problem

The `.db-row:hover` background uses a hardcoded RGBA value based on the terracotta orange, instead of referencing a CSS variable.

## Evidence

- dashboard.html line 145: `background: rgba(217,119,87,0.05);`
- `217,119,87` = `#d97757` = `var(--orange)` — the color is correct but hardcoded
- If `--orange` ever changes, this hover state won't update

## Fix

Define an `--orange-rgb` variable and use it:
```css
/* In :root */
--orange-rgb: 217,119,87;

/* In .db-row:hover */
.db-row:hover { background: rgba(var(--orange-rgb), 0.05); }
```
Or use the existing `var(--orange-light)` with reduced opacity as an alternative.
