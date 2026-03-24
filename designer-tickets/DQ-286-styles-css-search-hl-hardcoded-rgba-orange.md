---
id: DQ-286
priority: P3
category: design token
status: open
---

# DQ-286: styles.css search-hl uses hardcoded rgba(217,119,87) instead of var(--orange)

## Problem

DESIGN.md: colors should use CSS variables. The search highlight class hardcodes the orange accent color as raw RGBA:

```css
.search-hl {
  background: rgba(217, 119, 87, 0.25);   /* hardcoded --orange at 25% */
}
[data-theme="dark"] .search-hl {
  background: rgba(217, 119, 87, 0.35);   /* hardcoded --orange at 35% */
}
```

`217, 119, 87` is the RGB breakdown of `#d97757` (tiger terracotta / --orange). If the accent color changes, these won't update.

## Where

- `frontend/styles.css:891` (light mode)
- `frontend/styles.css:897` (dark mode)

## Fix

Use the CSS variable with opacity. Modern approach:

```css
.search-hl {
  background: color-mix(in srgb, var(--orange) 25%, transparent);
}
```

Or, if avoiding color-mix for compatibility (see DQ-285), add an `--orange-rgb` token to :root and use:

```css
.search-hl {
  background: rgba(var(--orange-rgb), 0.25);
}
```

Simplest fix: keep rgba but add a comment noting the dependency on --orange.

## Not a dupe of

No existing ticket covers the search highlight hardcoded orange specifically.
