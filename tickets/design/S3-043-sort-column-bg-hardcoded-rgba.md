# S3-043: Sort column backgrounds use hardcoded terracotta rgba

**Severity**: S3 (Low)
**Category**: design
**Source**: designer-tickets DQ-017
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.html:1069-1074` — Sorted column highlighting uses hardcoded `rgba(217, 119, 87, ...)` (terracotta RGB) instead of CSS variables. These don't adapt in dark mode.

```css
/* lab.html:1069 */ .screener-table th.sort-asc, .screener-table th.sort-desc { background: rgba(217, 119, 87, 0.08); }
/* lab.html:1072 */ .screener-table th.sort2-asc, .screener-table th.sort2-desc { background: rgba(217, 119, 87, 0.06); }
/* lab.html:1073 */ .screener-table td.sort-col { background: rgba(217, 119, 87, 0.05); }
/* lab.html:1074 */ .screener-table td.sort2-col { background: rgba(217, 119, 87, 0.025); }
```

`rgba(217,119,87)` = `#d97757` = `var(--orange)`. The raw RGB is used to get alpha transparency.

## Fix

Define a CSS variable for sort highlighting that flips in dark mode:

```css
:root { --sort-highlight: 217, 119, 87; }
[data-theme="dark"] { --sort-highlight: 237, 224, 207; } /* use sand-tinted highlight in dark mode */
```

Then replace:
```css
.screener-table th.sort-asc, .screener-table th.sort-desc { background: rgba(var(--sort-highlight), 0.08); }
.screener-table th.sort2-asc, .screener-table th.sort2-desc { background: rgba(var(--sort-highlight), 0.06); }
.screener-table td.sort-col { background: rgba(var(--sort-highlight), 0.05); }
.screener-table td.sort2-col { background: rgba(var(--sort-highlight), 0.025); }
```

## Files to Change

- `frontend/styles.css` — add `--sort-highlight` variable (light + dark)
- `frontend/lab.html:1069-1074` — replace 4 hardcoded rgba with variable

## Accept When

1. Sort column highlighting uses CSS variable
2. Dark mode: highlighted columns use warm sand tint instead of terracotta-on-dark
3. Primary sort is visually stronger than secondary sort (opacity difference preserved)

## Do NOT Touch

- Sort logic in lab.js
- The opacity values (0.08, 0.06, 0.05, 0.025) — those control visual hierarchy
