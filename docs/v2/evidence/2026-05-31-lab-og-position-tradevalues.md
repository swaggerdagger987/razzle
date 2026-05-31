# Evidence — Lab L5 trade values OG position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Build

```bash
npm run build --workspace=apps/web
# exit 0
```

## Product

- `TradeValuesRenderer` passes `position={position || undefined}` on `LabOgExportLink`
- Prospects renderer already had position param (dedup — no change)

## Gate C (when dev server available)

```bash
curl -s -o /tmp/og-tradevalues-wr.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/tradevalues?position=WR&download=1'
```

Expect 200 and PNG ≥40KB with WR-scoped subtitle when live data loads; snapshot path uses encoded rows from panel.
