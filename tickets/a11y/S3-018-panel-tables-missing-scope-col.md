# S3-018: Panel table <th> elements missing scope="col"

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #16
**WCAG**: 1.3.1 (Info and Relationships)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

60+ panel pages generate HTML tables via JavaScript with `<thead>` and `<th>` but no `scope="col"` attributes. Screen readers cannot associate data cells with their column headers.

The main screener table in `lab.js` correctly uses `scope="col"` (8 instances) — this pattern should be replicated across all panel pages.

## Affected Files

All panel pages that generate tables via JS, including but not limited to:
`drops.html`, `breakdown.html`, `comptable.html`, `fptsbreakdown.html`, `gamelog.html`, `gamescript.html`, `garbagetime.html`, `handcuffs.html`, `records.html`, `seasonpace.html`, `snapefficiency.html`, `stacks.html`, `streaks.html`, `successrate.html`, `targetpremium.html`, `tdregression.html`, `workload.html`, `dualthreat.html`, `aging.html`, `awards.html`, `airyards.html`, `buysell.html`, `consistency.html`, `efficiency.html`, `leaders.html`, `matchups.html`, `opportunity.html`, `redzone.html`, `schedule.html`, `scoring.html`, `stocks.html`, `targets.html`, `usage.html`, `vorp.html`, `weekly.html`, `weeklyleaders.html`, `weeklymvp.html`, `yoy.html`

## Fix

In each file's table-generating JavaScript, change `<th>` to `<th scope="col">`:
```javascript
// BEFORE
let html = '<table><thead><tr><th>#</th><th>Player</th>...'
// AFTER
let html = '<table><thead><tr><th scope="col">#</th><th scope="col">Player</th>...'
```

## Accept When

1. All `<th>` elements in panel table headers have `scope="col"`
2. `grep -r '<th>' frontend/*.html` shows zero `<th>` without scope (excluding `<th scope="col">`)
