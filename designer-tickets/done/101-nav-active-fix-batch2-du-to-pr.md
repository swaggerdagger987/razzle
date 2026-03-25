<!-- PM: ready -->
---
id: DQ-403b
priority: P1
area: frontend HTML
section: navigation
type: nav consistency
status: open
parent: DQ-403
---

# Remove incorrect Screener active class — Batch 2 (Du–Pr)

## What's wrong

17 secondary pages incorrectly mark the "Screener" nav link as `class="active"` even though the user is not on the Screener. Only `lab.html` should have Screener active.

## Files (17)

1. `frontend/drops.html`
2. `frontend/dualthreat.html`
3. `frontend/efficiency.html`
4. `frontend/explorer.html`
5. `frontend/fptsbreakdown.html`
6. `frontend/gamelog.html`
7. `frontend/gamescript.html`
8. `frontend/garbagetime.html`
9. `frontend/handcuffs.html`
10. `frontend/leaders.html`
11. `frontend/matchups.html`
12. `frontend/opportunity.html`
13. `frontend/pace.html`
14. `frontend/percentiles.html`
15. `frontend/player.html`
16. `frontend/playoffs.html`
17. `frontend/prospects.html`

## Fix

In each file, find the nav `<a>` that links to the Screener (lab.html) and remove `class="active"` from it. The link itself stays — only the active class is removed.

## Verification

After changes, grep all 17 files for Screener `class="active"` — expected 0 matches.
