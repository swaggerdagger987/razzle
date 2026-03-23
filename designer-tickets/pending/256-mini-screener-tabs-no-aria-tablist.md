# DES-256: Mini-screener position filter tabs missing ARIA tablist semantics

**Priority**: P2
**Area**: index.html (home page)
**Cycle**: 24

## Problem

The home page mini-screener position filter tabs (ALL, QB, RB, WR, TE) at lines 656-662 are `<button>` elements with an `.active` CSS class but zero ARIA tab semantics:

```html
<div class="mini-screener-tabs" style="display:flex; gap:0; border-bottom:3px solid var(--ink);">
  <button class="mini-tab active" data-pos="" onclick="_miniFilter('')">ALL</button>
  <button class="mini-tab" data-pos="QB" onclick="_miniFilter('QB')">QB</button>
  ...
</div>
```

Missing:
- `role="tablist"` on the container
- `role="tab"` on each button
- `aria-selected="true"` on the active tab
- `role="tabpanel"` on the table body
- Arrow key navigation between tabs (Left/Right)

DES-189 covers the `<th>` keyboard accessibility within the table. This is about the POSITION FILTER TABS above it — a different set of interactive elements.

## Evidence

- `index.html:656-662` — zero role attributes, zero aria-selected
- `_miniFilter()` function (line 1009) toggles `.active` class but never updates ARIA

## Fix

```html
<div class="mini-screener-tabs" role="tablist" aria-label="Filter by position">
  <button class="mini-tab active" role="tab" aria-selected="true" data-pos="" onclick="_miniFilter('')">ALL</button>
  <button class="mini-tab" role="tab" aria-selected="false" data-pos="QB" onclick="_miniFilter('QB')">QB</button>
  ...
</div>
```

Update `_miniFilter()` to set `aria-selected` on the active tab.

## Why This Matters

The mini-screener is the first interactive element visitors encounter on the home page. Screen reader users hear "ALL button" instead of "ALL tab, selected, 1 of 5." Keyboard users can't arrow between tabs — they must Tab through all 5. The Lab screener's NFL/College toggle correctly uses `role="tab"`. The home page should match.
