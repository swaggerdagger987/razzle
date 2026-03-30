# DES-278: agents.html zero dark mode page CSS for wrapper UI

**Priority**: P1
**Page**: agents.html (Situation Room)
**Affects**: Dark mode users viewing pricing/upgrade UI on the Situation Room page

## Problem

agents.html has ZERO `[data-theme="dark"]` CSS rules for its non-canvas wrapper UI. The pixel canvas correctly uses `--bg-ink` always-dark (Situation Room exception per DESIGN.md), but the SURROUNDING upgrade UI — pricing cards, feature comparison table, promo code input, trial note — has zero dark mode overrides.

The feature table header (line 1971) uses `background:var(--ink); color:var(--bg)` which flips INCORRECTLY in dark mode: in light mode it's a dark professional header (espresso bg, sand text); in dark mode it becomes a light header (sand bg, espresso text). The visual intent breaks.

DES-187 was filed for about.html only. This is a separate, higher-priority instance because agents.html is a conversion surface.

## Evidence

```bash
grep -c "\[data-theme" frontend/agents.html
# Result: 0
```

## Fix

1. Add `[data-theme="dark"]` rules for pricing cards, feature table, promo code input
2. Fix feature table header to use a dark-mode-stable approach (e.g., hardcoded dark colors or a separate `.table-header-dark` class)
3. Fix "recommended" badge `color:var(--bg)` — should use `var(--text-on-accent)` for reliable contrast on orange background

## Why This Matters

The Situation Room page is where users evaluate Pro vs Elite. The pricing cards and feature table ARE the conversion UI. Dark mode users see a visually broken comparison at the decision point.
