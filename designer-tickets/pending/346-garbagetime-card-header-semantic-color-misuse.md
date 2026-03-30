# DQ-346: garbagetime.html card headers use semantic colors as backgrounds

**Priority**: P3
**Category**: Design System — Color Usage
**File**: frontend/garbagetime.html, lines 45-47

## Problem

Card headers use semantic colors as background fills:
```css
.gt-card-header.padders { background: var(--semantic-red); }
.gt-card-header.clean { background: var(--semantic-green); }
```

Semantic colors (`--semantic-red`, `--semantic-green`) are designed for TEXT indicators and small badges — not large background fills. When used as header backgrounds, the text color inside (`color: var(--text-on-accent)` if set, or inherited) may not have sufficient contrast.

In dark mode, semantic-red becomes a lighter red tone and semantic-green becomes lighter green — both shift toward brighter values which look washed out as header backgrounds.

Other pages use `var(--ink)` for card headers with position-colored top stripes. This page deviates from that pattern.

## Fix

Option A: Match the standard card header pattern:
```css
.gt-card-header { background: var(--ink); color: var(--bg); }
.gt-card-header.padders { border-top: 6px solid var(--semantic-red); }
.gt-card-header.clean { border-top: 6px solid var(--semantic-green); }
```

Option B: Keep colored headers but ensure contrast:
```css
.gt-card-header.padders { background: var(--semantic-red); color: var(--text-on-accent); }
.gt-card-header.clean { background: var(--semantic-green); color: var(--text-on-accent); }
```

Option A is preferred — it matches the site-wide card pattern.
