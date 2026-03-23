# DES-149: Lab screener table has CLS — empty thead reflows on data load

**Priority**: P1
**Category**: Performance UX
**Affects**: lab.html — the flagship Screener page (growth engine)
**Cycle**: 14

## Problem

The Screener table has a Content Layout Shift (CLS) issue. On initial page load:

1. `<thead id="tableHead"></thead>` is completely empty (lab.html:3461)
2. Skeleton loader shows generic 5-column layout that doesn't match actual table
3. When data arrives, `renderTableHead()` populates the header and `renderTable()` fills the body
4. The entire table reflows — header height changes, column widths shift, frozen column offsets recalculate

This is visible to every first-time visitor as a "jump" when data loads.

## Evidence

`lab.html:3461`: `<thead id="tableHead"></thead>` — empty, no min-height, no placeholder
`lab.html:3467-3474`: skeleton has 5 generic columns with percentage widths
Actual table: 10-20+ columns with pixel widths from `razzle_col_widths` localStorage

The skeleton and actual table have completely different column structures.

## Fix

Add `min-height: 40px` to `#tableHead` to reserve vertical space. Consider also rendering a placeholder header row matching the default column set (rank, player, team, pos, PPG, etc.) during skeleton phase, or applying `contain: layout` on `.table-wrap` to isolate reflows.

## Why it matters

CLS directly impacts first impression. A Reddit user clicking a Screener link sees a visible jump. Google Core Web Vitals penalizes CLS. The Screener is the growth engine — every screenshot starts here.
