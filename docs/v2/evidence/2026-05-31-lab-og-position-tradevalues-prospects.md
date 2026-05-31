# Evidence — Lab L5 OG position on tradevalues + prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS

## Changes

- `TradeValuesRenderer` — `LabOgExportLink` passes `position={position || undefined}`
- `ProspectsRenderer` — already wired; verified via curl (no code change)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## Gate C (curl)

```bash
curl -s -o /tmp/og-tradevalues-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# 200 51115

curl -s -o /tmp/og-prospects-rb.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/prospects?download=1&position=RB'
# 200 41941
```

PNG verified ≥ 40KB.
