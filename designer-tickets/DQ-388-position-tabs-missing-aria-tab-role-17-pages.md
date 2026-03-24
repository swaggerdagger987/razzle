---
id: DQ-388
title: Position filter tabs missing role="tab"/aria-selected in 17 standalone pages
priority: P2
category: accessibility
page: 17 standalone pages
status: open
cycle: 50
---

## Problem

17 standalone pages use `.pos-tab` buttons for position filtering (ALL/QB/RB/WR/TE) but lack proper ARIA tab pattern attributes. Only 2 pages (regression.html, weeklyleaders.html) correctly implement `role="tablist"`, `role="tab"`, and `aria-selected`.

Screen readers announce these as generic buttons with no tab context, making the position filter pattern inaccessible.

## Evidence

Pages WITH proper ARIA (correct):
- `regression.html:346-351` — role="tablist", role="tab", aria-selected
- `weeklyleaders.html` — same pattern

Pages WITHOUT ARIA (17 files):
- advantage.html, drops.html, dualthreat.html, fptsbreakdown.html, gamescript.html, garbagetime.html, pace.html, playoffs.html, records.html, seasonpace.html, snapefficiency.html, streaks.html, successrate.html, targetpremium.html, tdregression.html, waivers.html, workload.html

Each uses `<button class="pos-tab">` without role="tab".

## Fix

Add ARIA attributes to each page's position tabs following the regression.html pattern:

```html
<!-- Before -->
<div class="pos-tabs">
  <button class="pos-tab active" data-pos="">ALL</button>
  <button class="pos-tab" data-pos="QB">QB</button>
  ...
</div>

<!-- After -->
<div class="pos-tabs" role="tablist" aria-label="Position filter">
  <button class="pos-tab active" data-pos="" role="tab" aria-selected="true">ALL</button>
  <button class="pos-tab" data-pos="QB" role="tab" aria-selected="false">QB</button>
  ...
</div>
```

Also update JS click handlers to toggle `aria-selected` when switching tabs.

## Verification

1. Open any of the 17 pages with a screen reader (VoiceOver/NVDA)
2. Navigate to position tabs
3. Should announce "Position filter, tab list, ALL tab, selected, 1 of 5"
