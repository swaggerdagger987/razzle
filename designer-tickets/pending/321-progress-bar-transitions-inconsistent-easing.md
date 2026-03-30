# DES-321: Progress bar transitions — inconsistent durations and 4 of 10 missing easing

**Priority**: P2
**Area**: lab-panels.css (10 progress bar classes)
**Cycle**: 30

## Problem

10 progress bar fill elements use `transition: width` with inconsistent timing:

### With easing (correct):
- `.tv-bar-fill` (line 619): `transition: width 0.4s ease`
- `.tv-bar-fill` (line 1055): `transition: width 0.3s ease` — DIFFERENT duration
- `.trade-value-bar` (line 1627): `transition: width 0.4s ease`
- `.vorp-bar` (line 4482): `transition: width 0.3s ease`
- `.tv-bar-fill` (line 4709): `transition: width 0.3s ease`

### Without easing (broken):
- `.pt-pace-bar` (line 2755): `transition: width 0.3s` — NO ease
- `.sw2-bar-fill` (line 3040): `transition: width 0.3s` — NO ease
- `.fpb-segment` (line 3099): `transition: width 0.3s` — NO ease
- `.pct2-bar-fill` (line 3421): `transition: width 0.3s` — NO ease

Without an easing function, browsers default to `ease` anyway — but the intent should be explicit. More importantly, `.tv-bar-fill` uses 0.4s at line 619 and 0.3s at lines 1055 and 4709 — the same class has different animation speeds depending on which panel it appears in.

## Fix

Standardize all progress bar transitions:

```css
transition: width var(--transition-slow, 0.3s) ease-out;
```

Use `ease-out` (decelerating) rather than `ease` — progress bars should feel like they're arriving, not bouncing.

## Why This Matters

Progress bars appear in Dynasty Trade Value Chart, Season Pace, VORP, Scoring Comparison, and Positional Advantage panels. Users see these side by side when exploring the Lab. Bars that fill at different speeds create visual noise.
