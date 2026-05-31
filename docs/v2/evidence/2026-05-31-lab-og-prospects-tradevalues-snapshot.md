# Evidence — Lab L5 prospects + tradevalues OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-tradevalues-snapshot`  
**Slice:** Prospects + tradevalues export snapshot rows from in-panel data

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?download=1&snapshot=…` | 200 | 58084 | PNG 1200×630, Travis Hunter row in snapshot |
| `/og/tradevalues?download=1&snapshot=…` | 200 | 62488 | PNG 1200×630, Ja'Marr Chase value row |

```bash
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&snapshot=eyJuIjoiVHJhdmlzIEh1bnRlciIsInAiOiJXUiIsInQiOiJKQVgiLCJzIjo5NCwic2wiOiJTY29yZSJ9XQ'

curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&snapshot=eyJuIjoiSmEnTWFyciBDaGFzZSIsInAiOiJXUiIsInQiOiJDSU4iLCJzIjoxMDIwMCwic2wiOiJWYWx1ZSJ9XQ'
```

## Build

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test pytest apps/api/tests -q` — 51 passed, 5 skipped

**Verdict:** PASS — export cards mirror visible panel rows via `snapshotRows` on ProspectsRenderer and TradeValuesRenderer.
