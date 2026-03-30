---
id: DQ-499
title: 8 newer standalone panel pages position tabs missing ARIA tab roles
severity: P2
status: open
component: Standalone Pages
phase: Phases 131-140
---

## Problem

Eight panel pages built in Phases 131-140 have position filter tabs (`<button class="pos-tab">`) with no ARIA tab pattern:

- No `role="tablist"` on parent `<div class="pos-tabs">`
- No `role="tab"` on individual `<button class="pos-tab">`
- No `aria-selected="true"` on active tab
- No `aria-controls` linking tabs to content panel

Screen readers announce these as generic buttons, not as a tabbed interface. Users can't navigate with arrow keys as expected in a tab pattern.

DQ-388 covers "position-tabs-missing-aria-tab-role-17-pages" but was filed before these 8 pages were built.

## Affected Pages

1. `frontend/drops.html:102-107`
2. `frontend/gamescript.html:102-107`
3. `frontend/seasonpace.html` (similar)
4. `frontend/snapefficiency.html` (similar)
5. `frontend/targetpremium.html` (similar)
6. `frontend/garbagetime.html` (similar)
7. `frontend/workload.html` (similar)
8. `frontend/successrate.html` (similar)

## Fix

```html
<div class="pos-tabs" role="tablist" aria-label="Position filter">
  <button class="pos-tab active" data-pos="" role="tab" aria-selected="true">ALL</button>
  <button class="pos-tab" data-pos="WR" role="tab" aria-selected="false">WR</button>
  ...
</div>
```

Update the tab click handler to toggle `aria-selected` on all tabs.

## Acceptance Criteria

- [ ] All 8 pages have `role="tablist"` on parent div
- [ ] All tab buttons have `role="tab"` and `aria-selected`
- [ ] Active tab has `aria-selected="true"`, others `"false"`
- [ ] Tab click handler toggles `aria-selected`
