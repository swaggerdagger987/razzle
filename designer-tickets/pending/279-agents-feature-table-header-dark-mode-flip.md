# DES-279: agents.html feature table header flips incorrectly in dark mode

**Priority**: P2
**Page**: agents.html (Situation Room)
**Affects**: Dark mode users viewing feature comparison table

## Problem

The feature comparison table header (line 1971) uses inline `background:var(--ink); color:var(--bg)`. This creates a visual inversion in dark mode:

- **Light mode**: espresso bg (`#2d1f14`) with sand text (`#ede0cf`) = dark professional header. Correct.
- **Dark mode**: sand bg (`#ede0cf`) with espresso text (`#2d1f14`) = light header on dark page. Looks wrong.

The intent is a contrasting header row. In dark mode, the header should remain dark — not flip to light.

## Evidence

```
agents.html:1971
<tr style="background:var(--ink); color:var(--bg);">
```

CSS variable auto-flipping reverses the entire visual intent.

## Fix

Replace `background:var(--ink); color:var(--bg)` with a dark-mode-stable approach:

Option A (inline): `background:#2d1f14; color:#ede0cf;` — hardcoded dark header, works in both modes.
Option B (class): Create `.table-header-dark` class with dark mode override that keeps the header dark.

Option B is preferred for design system governance.

## Why This Matters

The feature table is the conversion comparison. A visually broken header on the conversion table undermines the "polished product" signal. Small fix, disproportionate trust impact.
