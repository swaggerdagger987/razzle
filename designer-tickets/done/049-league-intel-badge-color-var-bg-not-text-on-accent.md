# DES-049: league-intel.html JS badges use color:var(--bg) instead of var(--text-on-accent)

**Priority**: P1
**Area**: league-intel.html (Bureau JS-generated badges)
**Found by**: Design QA Cycle 5

## Problem

Four JS-generated badge elements in league-intel.html use `color:var(--bg)` for text on colored backgrounds. In light mode, `--bg` resolves to `#ede0cf` (sand) — giving poor contrast against orange (#d97757) and red (#e63946) backgrounds.

The correct variable is `color:var(--text-on-accent)` which is `white` in light mode (good contrast) and `var(--bg)` in dark mode (also good contrast).

### Affected lines:
- Line 2444: `BEHAVIORAL TAG` badge — `background:var(--pos-te);color:var(--bg)` (purple bg + sand text in light mode)
- Line 3317: behavior tag badge — `background:${behaviorColor};color:var(--bg)` (various colored bg + sand text)
- Line 6392: injury tag — `background:var(--red);color:var(--bg)` (red bg + sand text)
- Line 6395: trade tag — `background:var(--orange);color:var(--bg)` (orange bg + sand text)

## Conversion impact

These badges appear in manager profiles and Monte Carlo scenario builder — both Pro features. Sand-on-orange text is hard to read at small font sizes (9-10px). Users may perceive the UI as low-quality.

## Fix

Replace `color:var(--bg)` with `color:var(--text-on-accent)` on all four lines.
