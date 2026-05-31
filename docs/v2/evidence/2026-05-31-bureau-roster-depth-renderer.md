# Evidence — League L5 Bureau Roster Depth renderer

**Date:** 2026-05-31  
**Slice:** Unhide `roster-depth` tab with `BureauRosterDepth` bespoke renderer

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Nav | `roster-depth` removed from `HIDDEN_BUREAU_SLUGS` |
| UI | Position grades + full depth lists; Player Sheet + Room hallway |

**Verdict:** PASS — Bureau behavioral tab visible with real renderer (ACCEPTANCE Gate 3).
