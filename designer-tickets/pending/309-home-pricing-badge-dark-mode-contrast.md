---
id: DES-309
title: Home page pricing-badge uses var(--bg) — low contrast in dark mode
priority: P1
page: index.html
category: Dark Mode / Conversion
cycle: 28
---

## Problem

The Pro pricing badge on the home page uses `color: var(--bg)` (line 516). In dark mode, `--bg` resolves to `#2d1f14` (dark espresso) — producing dark brown text on `var(--orange)` (#d97757) background. Estimated contrast: ~3:1, below WCAG AA 4.5:1 for small text.

The Elite badge on the SAME page correctly uses `color: var(--text-on-accent)` (line 529), which maintains proper contrast in both modes.

This badge says "the film room upgrade" — it's the first visual signal differentiating Pro from Free on the #1 conversion page.

## Where

- `frontend/index.html` line 516: `.pricing-badge { ... color: var(--bg); ... }`
- `frontend/index.html` line 529: `.pricing-badge--elite { ... color: var(--text-on-accent); ... }` ← correct

## Fix

Change line 516 from `color: var(--bg)` to `color: var(--text-on-accent)` to match the Elite badge pattern.

One-line fix.

## Evidence

- Light mode: var(--bg) = #ede0cf (sand on orange) = readable ✅
- Dark mode: var(--bg) = #2d1f14 (dark brown on orange) = low contrast ❌
- Elite badge on same page uses var(--text-on-accent) = works both modes ✅
