# Evidence — Lab L4 dynasty comps Pro teaser

**Date:** 2026-05-31  
**Atom:** `lab-dynasty-comps-pro-teaser`  
**Route:** `/lab/dynasty-comps` (free tier → ProUpgradeGate on 402)

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `teaserRowsForPanel("dynasty-comps")` | 3 comp-tier rows (Chase, MHJ, BTJ) |
| `upgradePitchForPanel("dynasty-comps", "Hawkeye")` | mentions comp tiers + similarity |

## Verdict

**PASS** — Pro gate shows Hawkeye-voiced comp preview rows, not generic DEFAULT_ROWS.
