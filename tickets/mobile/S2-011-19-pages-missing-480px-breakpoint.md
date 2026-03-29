# S2-011: 19 standalone panel pages missing 480px mobile breakpoint

**Severity**: S2 (Medium)
**Category**: mobile
**Source**: DESIGN-TICKETS.md #7
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

19 later-phase standalone pages only have `@media (max-width: 768px)` but no `@media (max-width: 480px)`. On phones (375px), content overflows and text sizes aren't optimized.

**Pages missing 480px breakpoint:**
1. `frontend/drops.html`
2. `frontend/breakdown.html`
3. `frontend/comptable.html`
4. `frontend/fptsbreakdown.html`
5. `frontend/gamelog.html`
6. `frontend/gamescript.html`
7. `frontend/garbagetime.html`
8. `frontend/handcuffs.html`
9. `frontend/prompts.html`
10. `frontend/records.html`
11. `frontend/seasonpace.html`
12. `frontend/snapefficiency.html`
13. `frontend/stacks.html`
14. `frontend/streaks.html`
15. `frontend/successrate.html`
16. `frontend/targetpremium.html`
17. `frontend/tdregression.html`
18. `frontend/workload.html`
19. `frontend/dualthreat.html`

Earlier pages (aging.html, awards.html, etc.) all have proper 480px breakpoints.

## Fix

Add `@media (max-width: 480px)` rules to each page. Standard pattern from working pages:
```css
@media (max-width: 480px) {
  h2 { font-size: 20px; }
  .lp-card { padding: 10px; }
  table { font-size: 11px; }
  /* Stack horizontal layouts vertical */
}
```

## Files to Change

All 19 files listed above.

## Accept When

All 19 pages render without horizontal overflow at 375px viewport width.
