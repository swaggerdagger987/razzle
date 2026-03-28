---
id: S2-077
severity: S2
confidence: HIGH
category: a11y
source: DQ-499,DQ-388
status: OPEN
---

# 8 newer standalone pages + 17 earlier pages — position tabs missing ARIA role="tab"

## Root Cause

Position filter buttons (QB/RB/WR/TE) across 25 standalone pages are `<button>` elements with no `role="tab"`, no `aria-selected`, and no `role="tablist"` on the parent container. Screen readers announce them as generic buttons, not as a tab group.

## Affected Pages (8 newer — DQ-499)

drops.html, gamescript.html, seasonpace.html, snapefficiency.html, targetpremium.html, garbagetime.html, workload.html, successrate.html

## Affected Pages (17 earlier — DQ-388)

aging.html, airyards.html, awards.html, breakouts.html, buysell.html, consistency.html, efficiency.html, leaders.html, opportunity.html, rankings.html, redzone.html, reportcard.html, scarcity.html, stocks.html, targets.html, tiers.html, yoy.html

## Fix

Add `role="tablist"` to the position filter container, `role="tab"` and `aria-selected` to each button:

```html
<div class="position-tabs" role="tablist">
  <button role="tab" aria-selected="true" data-pos="ALL">All</button>
  <button role="tab" aria-selected="false" data-pos="QB">QB</button>
  ...
</div>
```

## Acceptance Criteria

- All 25 pages have proper ARIA tab roles on position filters
- `aria-selected` updates when tab is clicked
