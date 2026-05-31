# Evidence — League L5 Roster Depth Bureau tab

**Date:** 2026-05-31  
**Slice:** Unhide `roster-depth` with `BureauRosterDepth` Dolphin renderer

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Tab visible | `roster-depth` removed from `HIDDEN_BUREAU_SLUGS` |
| Renderer wired | `BureauFeatureBody` → `BureauRosterDepth` |
| Hallway | Dolphin injury-exposure ask; footer → self-scout, H2H, Hawkeye targets |

**Verdict:** PASS — in-product Bureau tab with medical depth framing; OG card out of scope this atom.
