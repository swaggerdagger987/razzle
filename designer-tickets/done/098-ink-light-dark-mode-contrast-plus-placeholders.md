# DES-098: --ink-light dark mode contrast too low + placeholder text should use --ink-medium

**Priority**: P1
**Area**: styles.css (CSS variable definition), 9 search input ::placeholder selectors
**Cycle**: 10

## Problem

### Part A: Dark mode --ink-light contrast

`--ink-light` (#8a7565) is defined as the SAME value in both light and dark mode (per DESIGN.md: "shared"). On dark mode background (#2d1f14), this creates a contrast ratio well below WCAG AA 4.5:1 for normal text. It's used for subtitles, metadata, timestamps, labels — 1,122 occurrences across 86 files. In dark mode, this text is hard to read.

| Combination | Approx ratio | WCAG AA (normal) | WCAG AA (large) |
|-------------|-------------|-----------------|-----------------|
| #8a7565 on #ede0cf (light) | ~2.5:1 | FAIL | FAIL |
| #8a7565 on #2d1f14 (dark) | ~3.4:1 | FAIL | PASS |
| #8a7565 on #4a3728 (dark card) | ~2.1:1 | FAIL | FAIL |

### Part B: Placeholder text uses --ink-light

9 search inputs use `::placeholder { color: var(--ink-light) }`, inheriting the same contrast problem:

- `lab-panels.css` line 86: `.lp-search::placeholder`
- `lab.html` line 143: `.sidebar-search::placeholder`
- `career.html`, `career-compare.html`, `comptable.html`, `gamelog.html`, `percentiles.html`, `tradefinder.html`, `tradevalues.html`

Placeholder text is the hint users need to understand what to type. Low contrast placeholders slow down first-time users.

## Fix

### Part A: Override --ink-light in dark mode

In styles.css `[data-theme="dark"]` block, add a lighter value for --ink-light:

```css
[data-theme="dark"] {
  --ink-light: #a89888; /* warmer, higher contrast against espresso bg */
}
```

Target: at least 4.5:1 against --bg (#2d1f14) and at least 3:1 against --bg-card (#4a3728).

### Part B: Switch placeholders to --ink-medium

Change all 9 `::placeholder` selectors to use `var(--ink-medium)` instead of `var(--ink-light)`:

```css
.lp-search::placeholder { color: var(--ink-medium); }
```

`--ink-medium` (#5c4a3d light / #c4b5a5 dark) has adequate contrast in both modes.

## Design Rule

WCAG 1.4.3: Contrast (Minimum). Text and images of text must have a contrast ratio of at least 4.5:1 (normal) or 3:1 (large/bold). --ink-light as currently defined fails in both modes for normal text.
