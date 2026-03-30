---
id: DQ-496
title: 8 newer standalone panel pages missing 480px mobile breakpoint
severity: P2
status: open
component: Standalone Pages
phase: Phases 131-140
---

## Problem

Eight panel pages built in Phases 131-140 have a `@media (max-width: 768px)` breakpoint but NO `@media (max-width: 480px)` breakpoint. On small phones (375px width), tables and 2-column grids don't adapt further — column text truncates, horizontal scroll is required, and touch targets become cramped.

DQ-167 covered "22 pages missing 480px breakpoint" but was filed BEFORE these 8 pages were built. These are new instances of the same pattern.

## Affected Pages

1. `frontend/drops.html`
2. `frontend/gamescript.html`
3. `frontend/seasonpace.html`
4. `frontend/snapefficiency.html`
5. `frontend/targetpremium.html`
6. `frontend/garbagetime.html`
7. `frontend/workload.html`
8. `frontend/successrate.html`

## Fix

Add 480px breakpoint to each page's `<style>` block:

```css
@media (max-width: 480px) {
  .XX-page { padding: 12px 8px 32px; }
  .XX-header h1 { font-size: 20px; }
  .XX-controls { gap: 8px; }
  .XX-table { font-size: 11px; }
  .XX-table th, .XX-table td { padding: 4px 6px; }
}
```

## Acceptance Criteria

- [ ] All 8 pages have a `@media (max-width: 480px)` block
- [ ] Tables are usable on 375px viewport without horizontal scroll
- [ ] Font sizes reduce gracefully at small widths
