# Evidence — Lab L5 OG position on trade values + efficiency

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Changes

- `TradeValuesRenderer` — `LabOgExportLink` passes `position={position || undefined}`
- `EfficiencyRenderer` — completes atom-1 gap; same `position` prop (aging already on base)
- `ProspectsRenderer` — dedup; `position` already wired on base

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 52 passed, 2 screener snapshot errors (pre-existing)
```

## Gate C (curl)

```bash
curl -s -o /tmp/og-tradevalues-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# 200 51115

curl -s -o /tmp/og-eff-rb.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?download=1&position=RB'
# 200 45113
```

PNG verified ≥ 40KB.
