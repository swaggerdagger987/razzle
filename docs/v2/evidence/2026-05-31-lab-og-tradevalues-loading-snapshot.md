# Evidence — lab-og-tradevalues-loading-snapshot

**Cycle:** 162  
**Atom:** `lab-og-tradevalues-loading-snapshot`  
**Date:** 2026-05-31

## Change

`TradeValuesRenderer` exports sample value-curve rows on pending + empty board via
`TRADEVALUES_SAMPLE_OG_ROWS` (mirrors prospects loading pattern).

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/tradevalues?download=1&snapshot=eyJy…` | 200 | 50462 | PNG 1200×630 |
| `/og/tradevalues?download=1` | 200 | 67267 | PNG demo fallback |

```bash
curl -s -o /tmp/og-tv-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=eyJyIjpbeyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjoxMDIwMCwic2wiOiJWYWx1ZSJ9XX0'
curl -s -o /tmp/og-tv-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1'
```

## Tests

`pytest apps/api/tests/test_og_tradevalues_loading_snapshot.py -q` → 6 passed

## Verdict

PASS — loading-state export sample for trade values; loading OG epic atom 1/4.
