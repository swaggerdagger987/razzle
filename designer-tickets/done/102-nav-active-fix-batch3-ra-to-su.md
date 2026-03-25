<!-- PM: ready -->
---
id: DQ-403c
priority: P1
area: frontend HTML
section: navigation
type: nav consistency
status: open
parent: DQ-403
---

# Remove incorrect Screener active class — Batch 3 (Ra–Su)

## What's wrong

17 secondary pages incorrectly mark the "Screener" nav link as `class="active"` even though the user is not on the Screener. Only `lab.html` should have Screener active.

## Files (17)

1. `frontend/rankings.html`
2. `frontend/recap.html`
3. `frontend/records.html`
4. `frontend/redzone.html`
5. `frontend/regression.html`
6. `frontend/reportcard.html`
7. `frontend/rosterbuilder.html`
8. `frontend/scarcity.html`
9. `frontend/schedule.html`
10. `frontend/scoring.html`
11. `frontend/seasonpace.html`
12. `frontend/snapefficiency.html`
13. `frontend/stacks.html`
14. `frontend/stocks.html`
15. `frontend/streaks.html`
16. `frontend/strengths.html`
17. `frontend/successrate.html`

## Fix

In each file, find the nav `<a>` that links to the Screener (lab.html) and remove `class="active"` from it. The link itself stays — only the active class is removed.

## Verification

After changes, grep all 17 files for Screener `class="active"` — expected 0 matches.
