# Evidence — Lab tradevalues OG position filter

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Verdict:** PASS (Gate C)

## Change

`TradeValuesRenderer` passes `position` to `LabOgExportLink` so WR-filtered charts export WR-scoped OG cards.

## curl

```bash
curl -s -o /tmp/og-tv-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
# 200 51115
```

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 52+ passed (snapshot flakes on cold DB)
