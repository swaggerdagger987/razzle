# Evidence — lab-og-position-tradevalues-prospects

**Date:** 2026-05-31  
**Atom:** `lab-og-position-tradevalues-prospects` (tradevalues + efficiency; prospects deduped on base)  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-tv-rb.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3001/og/tradevalues?download=1&position=RB'
curl -s -o /tmp/og-eff-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3001/og/efficiency?download=1&position=WR'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG tradevalues RB | `200 42142` |
| OG efficiency WR | `200 48610` |

## Change

`TradeValuesRenderer` and `EfficiencyRenderer` pass `position` to `LabOgExportLink` so cold OG URLs match the active position tab.
