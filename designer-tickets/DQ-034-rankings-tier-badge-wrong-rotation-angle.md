# DQ-034: Rankings page tier badges wrong rotation angle

**Priority**: P3 — minor spec deviation
**Page**: rankings.html
**Category**: Visual language

## Problem

DESIGN.md specifies `rotate(3deg)` for tier stickers. The rankings page uses `rotate(-2deg)` — wrong direction and wrong magnitude.

## Evidence

- rankings.html line 117: `transform: rotate(-2deg);`
- DESIGN.md line 161: `rotate(3deg)`
- The badge rotates counter-clockwise at 2 degrees instead of clockwise at 3 degrees

## Fix

Change line 117:
```css
/* Before */
transform: rotate(-2deg);

/* After */
transform: rotate(-3deg);
```
Note: Use `-3deg` (counter-clockwise) to match the tiers page fix (DQ-033). Both pages should rotate consistently. The exact direction is less important than consistency between tiers.html and rankings.html.
