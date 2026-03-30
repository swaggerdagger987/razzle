# DES-055: compare.html has 3 sub-minimum border-radius instances

**Priority**: P2
**Area**: compare.html (Player Comparison page)
**Found by**: Design QA Cycle 5

## Problem

Three elements on the compare page use border-radius values below `--radius-sm` (8px):

1. **Line 92**: `.compare-pos-badge` — `border-radius: 6px` (should be 8px)
2. **Line 112**: `.compare-mini-stat` — `border-radius: 6px` (should be 8px)
3. **Line 220**: `.compare-diff-bar` — `border-radius: 3px` (inner bar element, may be acceptable)

## Conversion impact

Compare pages generate PNG exports with `razzle.lol` watermark — every export is marketing material. The position badge and mini-stat elements are prominently visible in exports. Inconsistent radius makes exports look slightly off from the rest of the brand.

## Fix

```css
.compare-pos-badge { border-radius: 8px; }   /* was 6px */
.compare-mini-stat { border-radius: 8px; }    /* was 6px */
/* .compare-diff-bar at 3px is an inner fill bar — exception OK */
```
