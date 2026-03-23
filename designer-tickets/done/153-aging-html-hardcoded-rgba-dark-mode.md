# DES-153: aging.html legend dot uses hardcoded rgba — poor dark mode contrast

**Priority**: P2
**Category**: Dark Mode
**Affects**: aging.html — Aging Curves panel (Atlas territory)
**Cycle**: 14

## Problem

The aging curves legend has a dot with hardcoded `rgba(138,117,101,0.5)` (which is `--ink-light` at 50% opacity). In dark mode, this faint brownish-gray dot has very poor contrast against the dark espresso background (`#2d1f14`). The dot is meant to represent "individual players (selected season)" and is the visual key for interpreting the scatter plot.

## Evidence

`aging.html:689`:
```javascript
'<div class="aging-legend-dot" style="background:rgba(138,117,101,0.5);"></div>individual players (selected season)'
```

The `#8a7565` color (ink-light) is actually the SHARED value that doesn't change between light and dark mode (DESIGN.md confirms `--ink-light` is `#8a7565` in both modes). However, at 50% opacity against dark background, the effective color is extremely low contrast.

All other legend dots on this page correctly use CSS variables (e.g., `var(--green)`, position colors).

## Fix

Replace with `style="background:var(--ink-light); opacity: 0.5;"` or better, use a different approach that maintains contrast in dark mode — e.g., `background:var(--ink-faint);` without opacity reduction, which maps to `#c4b5a5` (light) / `#5c4a3d` (dark).

## Why it matters

Aging curves is a key Atlas panel for dynasty managers evaluating aging players. If the legend is unreadable in dark mode, the chart loses its visual key. Power users use dark mode disproportionately.
