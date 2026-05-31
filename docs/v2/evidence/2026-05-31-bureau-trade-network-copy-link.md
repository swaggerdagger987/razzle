# Evidence — Bureau Trade Network copy link

**Date:** 2026-05-31  
**Atom:** `bureau-trade-network-copy-link`  
**Slice:** Trade Network copy link beside export card

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/trade-network?download=1&league=test` | **200 68090** bytes PNG |
| Share bar | `BureauTradeNetworkShareBar` copy link + export on same row |

## Verdict

**PASS** — League L5 Bureau share parity epic complete (5/5 atoms).
