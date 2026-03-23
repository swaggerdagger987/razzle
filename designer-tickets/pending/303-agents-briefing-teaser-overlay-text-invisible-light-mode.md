# DES-303: Weekly briefing teaser overlay text invisible in light mode

**Priority**: P1
**Category**: Contrast / Conversion
**Page**: agents.html
**Lines**: 1753-1756

## Problem

The weekly briefing teaser has a dark overlay (`background:rgba(26,17,10,0.85)`) with CTA text using `color:var(--ink)`. In light mode:

- `--ink` = `#2d1f14` (dark espresso)
- Overlay background = `rgba(26,17,10,0.85)` (also dark espresso)
- Result: dark text on dark background = **near-invisible**

The "Weekly Briefings" heading and "personalized intelligence" subtitle are unreadable.

This is the teaser that sells the Elite plan's weekly briefing feature. Users can't read the pitch.

**Note**: DES-208 covers the demo briefing card with `var(--ink-medium)` — this is a DIFFERENT element (the weekly briefing teaser overlay at line 1753) using `var(--ink)`.

## Current

```html
<div style="position:absolute; inset:0; ... background:rgba(26,17,10,0.85);">
  <div style="font-family:var(--font-display); font-size:18px; color:var(--ink);">Weekly Briefings</div>
  <div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-medium);">personalized intelligence...</div>
```

## Expected

```html
  <div style="... color:var(--bg);">Weekly Briefings</div>
  <div style="... color:var(--ink-faint);">personalized intelligence...</div>
```

Use `var(--bg)` (sand in light, flips to espresso in dark) for the heading and `var(--ink-faint)` for the subtitle. Both provide good contrast against the dark overlay.

## Fix

Change `color:var(--ink)` to `color:var(--bg)` at line 1755. Change `color:var(--ink-medium)` to `color:var(--ink-faint)` at line 1756. 2 attribute changes.
