# Evidence — Lab OG position filter (trade values)

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects`  
**Slice:** Trade values `LabOgExportLink` passes `position` query param

## Acceptance

```text
npm run build --workspace=apps/web  → exit 0
curl -s -o /tmp/og-tv-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&position=WR'
→ 200 51115
file /tmp/og-tv-wr.png → PNG 1200×630
```

## Verdict

**PASS** — Gate C satisfied (≥40KB PNG, position-scoped live OG path).
