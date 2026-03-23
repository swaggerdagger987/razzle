---
id: DQ-049
priority: P3
category: dark-mode
page: pricing.html
status: open
---

# Pricing dark mode — feature pills use harsh teal borders

## What's wrong
The "WHAT EVERYONE GETS. FOREVER." section on pricing.html displays feature pills (Screener, 70+ panels, Custom formulas, etc.) with bright `--green` (#2ec4b6) borders. On the dark espresso background, these create harsh, neon-like contrast that clashes with the warm Razzle aesthetic.

In light mode, teal on sand is soft and pleasant. In dark mode, the same teal on espresso is visually jarring — it reads as "tech dashboard" not "comic-strip lab."

## Evidence
- Screenshot: pricing.html dark mode, clipped at the "WHAT EVERYONE GETS" section, shows bright teal-bordered pills on dark background

## Fix
Option A (preferred): In dark mode, swap pill borders to `var(--ink-medium)` (#c4b5a5) or `var(--ink-faint)` to match the warm espresso palette. Keep text teal for the "free" signal.

Option B: Reduce teal border opacity in dark mode: `border-color: rgba(46, 196, 182, 0.5)` to mute the brightness.

## Files
- `frontend/pricing.html` — feature pills in the "WHAT EVERYONE GETS" section (likely inline or embedded styles)
