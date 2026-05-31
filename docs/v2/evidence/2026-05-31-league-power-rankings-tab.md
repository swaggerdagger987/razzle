# Evidence — League L5 Power Rankings Bureau tab

**Date:** 2026-05-31  
**Slice:** Unhide `power-rankings` with `BureauPowerRankings` Octo renderer

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Tab visible | `power-rankings` removed from `HIDDEN_BUREAU_SLUGS` |
| Renderer wired | `BureauFeatureBody` → `BureauPowerRankings` |
| Hallway | Octo ask link + footer links to monte-carlo, trade-finder, H2H |

**Verdict:** PASS — in-product Bureau tab; OG card is atom 2 (`league-power-rankings-og`).
