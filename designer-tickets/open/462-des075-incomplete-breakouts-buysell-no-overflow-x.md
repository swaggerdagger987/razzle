# DQ-462: DES-075 Incomplete Fix — breakouts.html + buysell.html Missing overflow-x:auto

**Priority**: P2
**Category**: Done Ticket Verification / Mobile
**Affects**: breakouts.html, buysell.html

## Problem

DES-075 was marked done (standalone pages missing overflow-x:auto on table wrappers for mobile scroll). Verification reveals **breakouts.html and buysell.html** still have zero `overflow-x: auto` on their data table containers.

On mobile (< 768px), data tables overflow the viewport with no horizontal scroll, making columns unreadable.

## Fix

Wrap each data table in a container with `overflow-x: auto`:

```html
<div style="overflow-x: auto;">
  <table>...</table>
</div>
```

Or add to the existing table wrapper CSS class.

## Acceptance

Both pages' tables scroll horizontally on 375px viewport without clipping.
