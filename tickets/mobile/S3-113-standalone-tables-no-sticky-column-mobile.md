---
id: S3-113
severity: S3
category: mobile
title: Standalone page tables lack sticky first column — player names scroll off-screen on mobile
source: DEEP-AUDIT-TICKETS.md (Phase 6 Mobile Assessment)
status: open
---

## Problem

On mobile (375-480px), all 49 standalone panel pages have `overflow-x: auto` table wrappers for horizontal scroll, but none have a sticky first column (player name). When users scroll right to view advanced stats, they lose track of which player each row belongs to.

The Lab screener (lab.html) has a sticky player column implemented in Phase 88 (`position: sticky; left: 0; z-index: 5` at lab.html:1143), but standalone pages do not.

## Affected Pages (49 total)

All pages with `overflow-x: auto` table wrappers:
`advantage.html`, `airyards.html`, `auction.html`, `breakouts.html`, `buysell.html`, `career-compare.html`, `career.html`, `comptable.html`, `consistency.html`, `dashboard.html`, `draftclass.html`, `drops.html`, `dualthreat.html`, `efficiency.html`, `fptsbreakdown.html`, `gamelog.html`, `gamescript.html`, `garbagetime.html`, `handcuffs.html`, `matchups.html`, `opportunity.html`, `playoffs.html`, `records.html`, `redzone.html`, `regression.html`, `reportcard.html`, `schedule.html`, `scoring.html`, `seasonpace.html`, `snapefficiency.html`, `stacks.html`, `stocks.html`, `streaks.html`, `successrate.html`, `targetpremium.html`, `tdregression.html`, `tradefinder.html`, `usage.html`, `vorp.html`, `waivers.html`, `weekly.html`, `weeklyleaders.html`, `weeklymvp.html`, `workload.html`, `yoy.html`

## Fix

Add a shared CSS rule in `frontend/lab-panels.css` or each standalone page's `<style>` block:

```css
@media (max-width: 768px) {
  .table-wrapper table td:first-child,
  .table-wrapper table th:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    background: var(--bg-card);
  }
  [data-theme="dark"] .table-wrapper table td:first-child,
  [data-theme="dark"] .table-wrapper table th:first-child {
    background: var(--bg-card);
  }
}
```

Note: This requires the first column to be the player name column across all pages. Verify column order per page before applying.

## Files to Change

- `frontend/lab-panels.css` — add shared sticky first-column rule for mobile
- Alternatively, add to each standalone page's `<style>` block if column structure varies

## Accept When

1. On 375px viewport, scrolling a data table right keeps the player name column visible
2. Background matches theme (no see-through overlap)
3. No z-index conflicts with other sticky elements (thead)
