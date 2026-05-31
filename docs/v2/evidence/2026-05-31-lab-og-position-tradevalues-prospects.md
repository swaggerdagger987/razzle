# Evidence — lab-og-position-tradevalues-prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Changes

- `TradeValuesRenderer` — `LabOgExportLink` passes `position={position || undefined}`
- `ProspectsRenderer` — already had position on export (dedup, no edit)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
curl -s -o /tmp/og-tv-wr.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&position=WR'
# 200 45113
```

PNG ≥ 40KB. Gate C PASS.
