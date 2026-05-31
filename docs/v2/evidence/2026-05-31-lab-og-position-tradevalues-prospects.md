# Evidence — Lab OG position tradevalues/prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS (Gate C2)

## Change

- `TradeValuesRenderer`: `LabOgExportLink` now passes `position={position || undefined}` (matches efficiency/aging/rankings pattern).
- Prospects already had position on base — verified only.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# 200 51115

curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/prospects?download=1&position=WR'
# 200 49000
```

Both PNGs ≥40KB, valid PNG 1200×630.
