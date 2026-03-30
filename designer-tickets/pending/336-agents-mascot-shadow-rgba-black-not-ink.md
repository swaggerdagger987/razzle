# DES-336: Agents page mascot shadow uses rgba(0,0,0) instead of ink color

**Priority**: P2
**Category**: Design System Compliance — Color Tokens
**Affects**: frontend/agents.html line 39 — `.warroom-hero-mascot`
**Cycle**: 4 (visual QA)

## Problem

The mascot on agents.html uses `filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15))`. Two issues:

1. **Shadow color**: Uses cold black `rgba(0,0,0,0.15)` instead of warm espresso-derived color. DESIGN.md: "Don't: Blue-black ink — always use espresso brown (#2d1f14), never navy/charcoal/gray." Cold black shadows violate the warm palette.

2. **Shadow offset**: Uses 3px instead of DESIGN.md's standard 4px. (Note: home page hero mascot has same issue as DES-192, but that ticket covers index.html — this is agents.html.)

## Evidence

agents.html line 39:
```css
.warroom-hero-mascot {
  filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15));
}
```

DESIGN.md specifies warm ink for shadows, 4px offset.

## Fix

```css
.warroom-hero-mascot {
  filter: drop-shadow(4px 4px 0 rgba(45,31,20,0.15));
}
```

Uses the ink color `#2d1f14` (rgb 45,31,20) at 15% opacity — warm espresso shadow instead of cold black, at the correct 4px offset.

## Why it matters

Cold black shadows look out of place on the warm sand/espresso palette. Every shadow on the site should feel like it's cast in espresso, not charcoal. The mascot is the brand symbol — its shadow sets the tone.
