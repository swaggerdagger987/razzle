---
id: DES-315
title: Mini-screener sort has no direction indicator and no aria-sort
priority: P2
page: index.html
category: UX / Accessibility
cycle: 28
---

## Problem

The home page mini-screener columns (PPG, GP, Age) are sortable via click. When sorted, the active column header turns orange (`sort-active` class). But there's no visual indicator for sort DIRECTION — users can't tell if the column is sorted ascending or descending.

Additionally, the Lab screener (lab.js:1553, 1603) correctly uses `aria-sort` attributes on sortable headers. The mini-screener does not — screen readers can't announce sort state.

The mini-screener is the first interactive element visitors encounter on the home page. It should feel polished and complete.

## Where

- `frontend/index.html` line 414: `.mini-table th.sort-active { color: var(--orange); font-weight: 700; }` — no arrow
- `frontend/index.html` lines 994-996: `_renderMiniRows` toggles `sort-active` class but doesn't set `aria-sort`
- `frontend/index.html` lines 671-673: `<th>` elements have no `aria-sort` attribute

## Fix

1. Add a sort direction arrow to the active header text:
   ```js
   var arrow = _miniSortDir === 'desc' ? ' ▼' : ' ▲';
   th.textContent = th.getAttribute('data-sort').toUpperCase() + (isActive ? arrow : '');
   ```
2. Add `aria-sort` attribute to the active header:
   ```js
   th.setAttribute('aria-sort', isActive ? (_miniSortDir === 'desc' ? 'descending' : 'ascending') : 'none');
   ```

## Evidence

- Lab screener has `aria-sort` on sortable columns ✅ (lab.js:1553)
- Mini-screener has no `aria-sort` ❌
- Mini-screener has no visual sort direction indicator ❌
