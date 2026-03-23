# DES-332: Tier labels (S/A/B/C/D/F) on tiers.html not rotated per DESIGN.md

**Priority**: P2
**Category**: Design System Compliance — Visual Personality
**Affects**: frontend/tiers.html — tier letter labels
**Cycle**: 4 (visual QA)

## Problem

DESIGN.md specifies: **"Tier Stickers: slightly rotated (rotate(3deg)) — slapped on, not placed."** The tier labels on tiers.html (S, A, B, C, D, F) are displayed with no rotation — they sit perfectly straight and feel mechanically placed rather than playfully slapped on.

## Evidence

tiers.html line 134-139:
```css
.tl-tier-letter {
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1;
  color: var(--text-on-accent);
  text-shadow: 2px 2px 0 rgba(45,31,20,0.2);
  /* No transform: rotate() */
}
```

No rotation applied to `.tl-tier-label` or `.tl-tier-letter`. Screenshot confirms all tier labels are perfectly vertical.

## Fix

```css
.tl-tier-label {
  transform: rotate(-2deg);
}
```

Use a slight negative rotation (like a sticker slapped slightly crooked) to match the design system's "slapped on, not placed" directive. Alternating positive/negative rotations per tier row would add even more personality.

## Why it matters

The rotation is what makes tier badges feel like hand-applied stickers rather than database output. It's a small detail that separates "research lab with personality" from "generic data table." This page is highly shareable on Reddit — the sticker effect makes it screenshot-worthy.
