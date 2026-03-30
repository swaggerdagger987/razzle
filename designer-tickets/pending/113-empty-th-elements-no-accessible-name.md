# DES-113: 11 empty `<th></th>` elements with no accessible name

**Priority**: P2 — screen reader confusion in data tables
**Category**: Screen reader accessibility
**WCAG**: 1.3.1 (Info and Relationships)

## Problem

11 standalone HTML pages have `<th></th>` — empty column headers used as spacer or action columns (typically for trend sparklines, expand toggles, or visual badges). Screen readers announce these as "column header, empty" which gives users no context about what data appears in that column.

## Affected Files

1. `frontend/advantage.html`
2. `frontend/drops.html`
3. `frontend/gamescript.html`
4. `frontend/garbagetime.html`
5. `frontend/league-intel.html`
6. `frontend/stacks.html`
7. `frontend/snapefficiency.html`
8. `frontend/targetpremium.html`
9. `frontend/successrate.html`
10. `frontend/tdregression.html`
11. `frontend/workload.html`

## Evidence

Example from advantage.html:
```js
html += '<th>#</th><th>Player</th><th>Pos</th><th>PPG</th><th>Pos Avg</th><th>Edge</th><th>% Above</th><th></th><th>GP</th>';
```

That empty `<th></th>` between "% Above" and "GP" has no label. Screen readers say: "column 8, column header, empty."

## Fix

Add `aria-label` to each empty `<th>` describing the column's purpose:
```html
<th aria-label="Trend"></th>
<th aria-label="Actions"></th>
<th aria-label="Sparkline"></th>
```

Choose the label based on what the column actually shows for each page.

## Why This Matters

Small fix, big clarity gain. Screen reader users navigating data tables hear "column header, empty" and have no idea what the column contains. A simple `aria-label` tells them it's a trend sparkline, action column, or visual indicator.
