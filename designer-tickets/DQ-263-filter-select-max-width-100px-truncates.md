---
id: DQ-263
title: Filter select max-width 100px truncates long team names and stat labels
priority: P2
category: ux
status: open
cycle: 36
---

## Problem

The `.filter-select-sm` class in the Lab screener has `max-width: 100px`, which truncates longer filter values. At 11px font with 6px total padding, only ~94px is available for text. Team names like "Buffalo Bills" (~95px), "San Francisco 49ers", and longer stat labels get cut off with no tooltip or ellipsis.

Users can't tell what filter value they've selected when the text is truncated.

## Evidence

`frontend/lab.html` lines 806-811:
```css
.filter-select-sm {
  font-size: 11px !important;
  padding: 3px 8px !important;
  border-radius: 20px !important;
  min-width: 0;
  max-width: 100px;
}
```

## Fix

1. Increase `max-width` to `140px` (accommodates all NFL team names)
2. Add `text-overflow: ellipsis; overflow: hidden;` as safety net
3. Consider removing the max-width entirely and letting the filter bar wrap naturally

## Files
- `frontend/lab.html` line ~811 — increase or remove max-width

## Impact
Users with team or stat filters can't read what they selected. Especially bad on the first visit when learning the UI.
