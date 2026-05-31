# Evidence — League L5 Bureau Trade Finder copy link

**Date:** 2026-05-31  
**Slice:** `bureau-trade-finder-copy-link` — copy link beside export card on Trade Finder tab  
**Epic:** League L5 — Bureau share parity finish (atom 1/3)

## Gate C — OG PNG

| Check | Command | Result | Verdict |
|-------|---------|--------|---------|
| Trade Finder OG | `curl /og/trade-finder?download=1&league=test&user=test` | **200 57773** bytes PNG | PASS |

## Build / tests

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |

## UI change

- `BureauTradeFinder.tsx` hero share row: `copy link` button before `export card` — mirrors Trade Network / Monte Carlo pattern.

**Reality:** PASS
