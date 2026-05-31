# Evidence — League L5 Roster Depth Bureau tab

**Date:** 2026-05-31  
**Slice:** Unhide `roster-depth` with `BureauRosterDepth` Dolphin renderer

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Tab visible | `roster-depth` removed from `HIDDEN_BUREAU_SLUGS` |
| Renderer wired | `BureauFeatureBody` → `BureauRosterDepth` |
| Hallway | Dolphin thin-depth Room links; footer → self-scout, trade-finder, H2H |

**Verdict:** PASS — in-product Bureau tab with A–F grades and full position player lists.
