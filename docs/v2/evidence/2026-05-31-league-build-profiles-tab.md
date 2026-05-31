# Evidence — League L5 Build Profiles tab

**Date:** 2026-05-31  
**Atom:** `league-build-profiles-tab`  
**Slice:** Unhide Build Profiles tab with Atlas renderer

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests -q` | CI contract (51 passed, 5 skipped) |
| `build-profiles` not in `HIDDEN_BUREAU_SLUGS` | grep OK |
| `BureauBuildProfiles` wired in `BureauFeatureBody` | grep OK |

## Verdict

**PASS** — League L5 Bureau depth; roster-depth + power-rankings deduped on base before this ship.
