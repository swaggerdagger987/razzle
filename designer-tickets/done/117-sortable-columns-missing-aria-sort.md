# DES-117: Sortable columns missing aria-sort attribute

**Priority:** P1 — Accessibility
**Component:** lab.js, standalone pages
**Affects:** 50+ tables across 46 pages

## Problem

Zero `aria-sort` attributes exist anywhere in the codebase. The screener and all standalone panel tables show sort direction with visual arrows (Unicode &#9650;/&#9660;) but never set `aria-sort="ascending"` or `aria-sort="descending"` on the active `<th>`. Screen readers cannot announce which column is sorted or in what direction.

The screener already tracks `state.sortKey` and `state.sortDir` (and `sortKey2`/`sortDir2` for multi-sort). The data is there — it just isn't exposed to assistive tech.

## Evidence

- `lab.js:1549-1555` — visual arrows rendered, no aria-sort set
- `lab.js:1598` — `<th>` has `tabindex="0"`, `scope="col"`, `onclick`, `onkeydown` — but no `aria-sort`
- `grep -r "aria-sort" frontend/` — **0 results**
- 45+ standalone pages have sortable tables with the same gap

## Fix

In `lab.js` `renderTableHead()`:
- When `state.sortKey === key`, add `aria-sort="${state.sortDir === 'asc' ? 'ascending' : 'descending'}"` to the `<th>`
- When `state.sortKey2 === key`, add `aria-sort="${state.sortDir2 === 'asc' ? 'ascending' : 'descending'}"` (secondary sort)
- All other sortable `<th>` elements: `aria-sort="none"`

For standalone pages: each page's sort handler should set `aria-sort` on the active column header after re-sorting.

## Why it matters

Keyboard-first dynasty power users (the primary audience) already use J/K navigation, Enter to open profiles, H for heat coloring. Missing `aria-sort` is inconsistent with the keyboard-first design philosophy. WCAG 2.1 Level AA requires sort state to be programmatically determinable.
