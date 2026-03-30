# DES-151: Page size dropdown has only one option (25)

**Priority**: P3
**Category**: UX Polish
**Affects**: lab.html pagination — Screener table
**Cycle**: 14

## Problem

The page size `<select>` in the Screener pagination bar has a single `<option value="25">25</option>`. A dropdown with one option is a dead control — it looks interactive but does nothing. Power users expect to adjust page size (25/50/100).

## Evidence

`lab.html:3507-3509`:
```html
<select class="select-chunky" id="pageSizeSelect" onchange="changePageSize(this.value)" ...>
  <option value="25">25</option>
</select>
```

The `changePageSize()` function exists and works — it's just that the HTML only offers one choice.

## Fix

Add 50 and 100 options:
```html
<option value="25">25</option>
<option value="50">50</option>
<option value="100">100</option>
```

The virtualization system (sparse array virtual scrolling in lab.js) can handle 100 rows easily since it only renders visible + 20-row buffer.

## Why it matters

Dynasty power users browse large datasets (1000+ players). 25 rows = 40 pages of pagination. A 100-row option reduces friction. The control exists, the handler exists — it just needs options. Low effort, noticeable QoL improvement.
