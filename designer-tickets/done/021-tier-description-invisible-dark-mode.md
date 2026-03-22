# DES-021: Tier list descriptions invisible in dark mode

**Priority**: P2
**Area**: lab-panels.css
**Impact**: Dynasty Tier List panel — tier description text uses hardcoded sand-colored rgba that won't flip in dark mode. Text becomes sand-on-espresso — the exact SAME color as the dark mode background, making it invisible.

## The Problem

`frontend/lab-panels.css`:
- Line 422: `.tl-tier-desc { color: rgba(237,224,207,0.8); }` — hardcoded sand at 80% opacity
- Line 474: `.tl-tier-desc { color: rgba(237,224,207,0.7); }` — hardcoded sand at 70% opacity

In dark mode, `--bg` IS `#ede0cf` (237,224,207). So this text is the same color as the background. Invisible.

## The Fix

```css
.tl-tier-desc { color: var(--ink-light); }

/* Or if opacity is needed: */
.tl-tier-desc { color: var(--ink-medium); opacity: 0.8; }
```

## Why This Matters

Tier List is one of the most-used Lab panels. Tier descriptions ("Elite — top 5 dynasty assets") provide essential context. If they vanish in dark mode, the panel feels broken. Dynasty power users browse tiers constantly.
