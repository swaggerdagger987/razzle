---
id: DQ-287
priority: P3
category: border-radius
status: open
---

# DQ-287: styles.css search-hl border-radius:2px -- below minimum token

## Problem

DESIGN.md border radius tokens: 8px (small), 12px (default), 20px (pills). Minimum is 8px.

```css
.search-hl {
  border-radius: 2px;    /* BELOW MINIMUM */
}
```

At 2px, the search highlight has barely perceptible rounding. On a warm sand background with a terracotta tint, the highlight should feel like a chunky marker stroke, not a pixel-level rounding.

## Where

`frontend/styles.css:893`

## Fix

Change `border-radius: 2px` to `border-radius: 4px`.

NOTE: Using the full 8px token would be too aggressive for inline text highlights. 4px is a pragmatic sub-token compromise for inline highlight marks -- visually rounded but not pill-shaped. This is the one case where a sub-minimum value may be acceptable, but 2px is still too small.

## Not a dupe of

Done ticket 041 (styles-css-small-radius-orphans) fixed other sub-minimum values but missed this one.
