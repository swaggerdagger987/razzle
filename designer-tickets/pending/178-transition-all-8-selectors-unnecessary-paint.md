# DES-178: `transition: all` in 8 selectors forces unnecessary paint work

**Priority**: P3 — Performance polish
**Scope**: styles.css (8 instances)
**Category**: Performance UX

## Problem

8 selectors in styles.css use `transition: all` instead of scoping to specific properties:

| Line | Selector | Properties that actually change |
|------|----------|-------------------------------|
| 216 | `.nav-links a` | border-color, background, box-shadow, transform |
| 446 | `.nav-search-hint` | border-color, background |
| 547 | `.trial-banner-close` | opacity |
| 701 | `.auth-tab` | background, color |
| 762 | `.btn-chunky` | box-shadow, transform |
| 790 | `.btn-primary` | box-shadow, transform |
| 832 | `.chip` | box-shadow, transform |
| 1048 | `.plan-card` | box-shadow, transform |

`transition: all` tells the browser to track EVERY CSS property (including layout-triggering ones like width, height, margin, padding) for potential animation. This creates unnecessary style recalculation work on every interaction.

## Fix

Replace each `transition: all` with the specific properties that actually animate:

```css
/* Before */
.btn-chunky { transition: all 0.12s; }

/* After */
.btn-chunky { transition: transform 0.12s, box-shadow 0.12s; }
```

Apply the same pattern to all 8 instances, scoping to the properties that change on `:hover`/`:active`.

## Why this matters

Low-priority polish. Won't noticeably change performance for most users, but removes unnecessary browser work on every hover/click interaction across all pages.
