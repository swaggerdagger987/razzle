# Evidence — Lab OG position filter (efficiency, trade values, buy/sell)

**Slice:** `lab-og-position-efficiency-tradevalues-buysell`  
**Date:** 2026-05-31  
**Trust:** T5, T6

## Curl (dev server port 3000)

| Route | Result |
|-------|--------|
| `/og/efficiency?download=1&position=WR` | 200 — 48610 bytes PNG |
| `/og/tradevalues?download=1&position=RB` | 200 — 42142 bytes PNG |
| `/og/buysell?download=1&position=WR` | 200 — 44258 bytes PNG |

## Tests

- pytest 51 passed; `npm run build --workspace=apps/web` exit 0

**Verdict:** PASS — Gate C
