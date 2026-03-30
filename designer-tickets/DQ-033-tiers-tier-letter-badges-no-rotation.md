# DQ-033: Tiers page tier-letter badges have no rotation

**Priority**: P2 — design spec violation
**Page**: tiers.html
**Category**: Visual language

## Problem

DESIGN.md specifies: "Tier Stickers: slightly rotated (`rotate(3deg)`) — slapped on, not placed."

The tier letter badges (S, A, B, C, D, F) on tiers.html have zero rotation applied. They sit perfectly straight, looking mechanical rather than "slapped on."

## Evidence

- tiers.html lines 125-146: `.tl-tier-label` CSS has no `transform` property at all
- DESIGN.md line 161: "slightly rotated (rotate(3deg))"
- Screenshot confirms: tier letters are perfectly aligned rectangles

## Fix

Add rotation to `.tl-tier-label`:
```css
.tl-tier-label {
  transform: rotate(-2deg);
}
```
Use `-2deg` or `-3deg` for a natural "slapped sticker" look. Negative rotation tilts counter-clockwise which feels more organic for left-edge labels.
