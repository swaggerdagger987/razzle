# DES-103: --ink-faint (#c4b5a5) used as text color in 20+ files — unreadable contrast

**Priority**: P2
**Area**: lab-panels.css, lab.js, standalone HTML pages
**Cycle**: 10

## Problem

`--ink-faint` (#c4b5a5) is defined in DESIGN.md as "Dividers, dashed borders" — it's a BORDER color. But it's used as text color in 53 occurrences across 20 files. On sand background (#ede0cf), the contrast is approximately 1.8:1. On dark mode card background (#4a3728), approximately 2.5:1. Both fail WCAG AA for any text size.

### Affected selectors with meaningful text

| Selector | File | What it says |
|----------|------|-------------|
| `.tl-empty-tier` | lab-panels.css:483 | Empty tier placeholder text |
| `.pro-locked` | lab.html inline | "Pro" lock messaging |
| `.wh-bye` | lab-panels.css | Bye week indicator |
| `.leader-silver` | lab-panels.css | Silver medal text |
| Inline JS cells | lab.js (~14 instances) | Secondary stat values |

### Not a problem (borders/dividers — correct usage)
- Dashed border colors
- Separator lines
- Subtle background fills

## Fix

Replace `var(--ink-faint)` with `var(--ink-light)` for all TEXT color usages:

```css
/* Before */
.tl-empty-tier { color: var(--ink-faint); }

/* After */
.tl-empty-tier { color: var(--ink-light); }
```

For the 14 inline JS instances in lab.js, replace `var(--ink-faint)` with `var(--ink-light)` in the style strings.

Leave all BORDER and DIVIDER uses of --ink-faint unchanged — those are correct per the design guide.

## Design Rule

WCAG 1.4.3: Contrast (Minimum). --ink-faint is for borders, not text. When used as text, it's below the minimum contrast ratio in both light and dark modes. Use --ink-light (or --ink-medium for better contrast) for any text that users need to read.
