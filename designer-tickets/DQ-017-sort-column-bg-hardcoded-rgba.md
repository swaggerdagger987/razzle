# DQ-017: Sort column backgrounds hardcoded terracotta rgba in lab.html

**Priority**: P2 — affects Lab screener sorted columns
**Category**: Color token

## Problem

`frontend/lab.html` lines 1063-1068 hardcode terracotta rgba values for sort column highlighting instead of using CSS variables:

```css
.screener-table th.sort-asc, .screener-table th.sort-desc { background: rgba(217, 119, 87, 0.08); }
.screener-table th.sort2-asc, .screener-table th.sort2-desc { background: rgba(217, 119, 87, 0.06); }
.screener-table td.sort-col { background: rgba(217, 119, 87, 0.05); }
.screener-table td.sort2-col { background: rgba(217, 119, 87, 0.025); }
```

`217,119,87` = `#d97757` (terracotta). While the correct brand color, using raw rgba means no dark mode adaptation and bypasses the design token system.

## Fix

Use CSS custom properties with dark mode overrides:
```css
--sort-bg: rgba(217, 119, 87, 0.08);
--sort2-bg: rgba(217, 119, 87, 0.06);
--sort-col-bg: rgba(217, 119, 87, 0.05);
--sort2-col-bg: rgba(217, 119, 87, 0.025);
```
Or simply keep as-is if the low-opacity terracotta tint works on both light and dark backgrounds (it may). In that case, mark this as accepted-risk.

## Verification

Sort by a column in the Lab. The column highlight should be a subtle warm tint, not jarring on either theme.
