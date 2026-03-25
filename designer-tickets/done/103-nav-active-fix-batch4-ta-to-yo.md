<!-- PM: ready -->
---
id: DQ-403d
priority: P1
area: frontend HTML
section: navigation
type: nav consistency
status: open
parent: DQ-403
---

# Remove incorrect Screener active class — Batch 4 (Ta–Yo)

## What's wrong

16 secondary pages incorrectly mark the "Screener" nav link as `class="active"` even though the user is not on the Screener. Only `lab.html` should have Screener active.

## Files (16)

1. `frontend/targets.html`
2. `frontend/targetpremium.html`
3. `frontend/tdregression.html`
4. `frontend/team.html`
5. `frontend/tiers.html`
6. `frontend/tools.html`
7. `frontend/tradevalues.html`
8. `frontend/tradefinder.html`
9. `frontend/usage.html`
10. `frontend/vorp.html`
11. `frontend/waivers.html`
12. `frontend/weekly.html`
13. `frontend/weeklyleaders.html`
14. `frontend/weeklymvp.html`
15. `frontend/workload.html`
16. `frontend/yoy.html`

## Fix

In each file, find the nav `<a>` that links to the Screener (lab.html) and remove `class="active"` from it. The link itself stays — only the active class is removed.

## Verification

After changes, grep all 16 files for Screener `class="active"` — expected 0 matches.
