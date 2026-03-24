---
id: DQ-288
priority: P3
category: border-radius
status: open
---

# DQ-288: styles.css tag-picker-clear uses border-radius 0 0 6px 6px (off-token)

## Problem

DESIGN.md border radius tokens: 8px, 12px, 20px. No 6px token.

```css
.tag-picker-clear {
  border-radius: 0 0 6px 6px;
}
```

The tag picker's "clear" action at the bottom of the dropdown uses 6px bottom corners. Should match the parent dropdown's radius.

## Where

`frontend/styles.css:1461`

## Fix

Change to `border-radius: 0 0 var(--radius-sm) var(--radius-sm)` (0 0 8px 8px) to match the design token and align with the parent dropdown border-radius.

## Not a dupe of

Done ticket 041 (styles-css-small-radius-orphans) fixed other values but missed this one.
