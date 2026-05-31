# Evidence — League L5 Bureau Trade Network copy link

**Date:** 2026-05-31  
**Slice:** `bureau-trade-network-copy-link` — copy link beside export card on Trade Network tab  
**Epic:** League L5 — Bureau behavioral share parity (atom 4/5)

## Gate C — OG PNG

| Check | Command | Result | Verdict |
|-------|---------|--------|---------|
| Trade Network OG | `curl /og/trade-network?download=1&league=test` | **200 68090** bytes PNG | PASS |

## Build / tests

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |

## UI change

- `BureauTradeNetwork.tsx` footer: `copy link` button before `export card` — mirrors Pressure Map / Manager Profiles pattern.

**Reality:** PASS
