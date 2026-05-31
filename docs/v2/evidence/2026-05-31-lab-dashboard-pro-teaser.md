# Evidence — Lab L4 dynasty dashboard Pro teaser

**Date:** 2026-05-31  
**Atom:** `lab-dashboard-pro-teaser`  
**Route:** `/lab/dashboard` (free tier → ProUpgradeGate on 402)

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `teaserRowsForPanel("dashboard")` | 3 rows (riser / value / faller) |
| `upgradePitchForPanel("dashboard", "Razzle")` | mentions risers + fallers |
| `GET /api/panels/dashboard` (free plan) | 402 upgrade_required |
| `test_panels.py` | pass |

## Verdict

**PASS** — Pro gate shows Razzle-voiced dynasty pulse preview rows, not generic DEFAULT_ROWS.
