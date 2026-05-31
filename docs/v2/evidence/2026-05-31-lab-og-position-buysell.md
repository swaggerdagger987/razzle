# Evidence — Lab L5 OG position filter (buysell + tradevalues + efficiency)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-buysell` (epic capstone)  
**Verdict:** PASS

## Changes

- `BuySellRenderer`, `TradeValuesRenderer`, `EfficiencyRenderer` — `position={position || undefined}` on `LabOgExportLink`

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## Gate C (curl)

```bash
curl -s -o /tmp/og-buysell-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/buysell?download=1&position=WR'
# 200 44258

curl -s -o /tmp/og-buysell-rb.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/buysell?download=1&position=RB'
# 200 42961
```

PNG ≥ 40KB. Lab L5 position-filter epic complete.
