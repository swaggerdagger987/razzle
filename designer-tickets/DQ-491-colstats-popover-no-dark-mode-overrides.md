---
id: DQ-491
title: Column Stats popover has zero dark mode overrides
severity: P1
status: open
component: Lab Screener
phase: Phase 123
---

## Problem

The Column Stats popover (`.colstats-popover`) introduced in Phase 123 has zero `[data-theme="dark"]` CSS rules. The popover is appended to `document.body` at `z-index: 10001` and relies entirely on CSS variable cascade from `<html>`.

While CSS vars like `var(--bg-card)` and `var(--ink)` should cascade correctly, the histogram bars (`.colstats-bar`) use `background: var(--orange)` (#d97757) which against dark espresso (#2d1f14) has a WCAG contrast ratio of ~3.8:1 — below AA standard (4.5:1). The bar borders use `var(--ink)` which flips to sand in dark mode, creating a bright border on a dark orange bar.

## Location

- `frontend/lab.html:1097-1129` — all `.colstats-*` CSS rules
- `frontend/lab.js:3560-3647` — `showColumnStatsPopover()` creates the DOM

## Expected

Add explicit dark mode overrides:

```css
[data-theme="dark"] .colstats-popover {
  box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
}
[data-theme="dark"] .colstats-bar {
  background: var(--orange-light);
}
```

Verify popover legibility in dark mode visually.

## Acceptance Criteria

- [ ] Popover text is readable on dark background
- [ ] Histogram bars have sufficient contrast in dark mode
- [ ] Box shadow is visible on dark background
