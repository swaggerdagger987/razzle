# Evidence — Lab L5 OG export links (prospects, weekly, tradevalues)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-link-prospects-weekly-tradevalues`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Routes

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/prospects?download=1` | 200 | 58084 | 1200×630 |
| `/og/weekly?download=1` | 200 | 63819 | 1200×630 |
| `/og/tradevalues?download=1` | 200 | 62488 | 1200×630 |

## Commands (executed)

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/prospects?download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/weekly?download=1'
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/tradevalues?download=1'
```

## Change

Replaced raw `<a href="/og/...">` footers with shared `LabOgExportLink` on ProspectsRenderer, WeeklyHeatmapRenderer, TradeValuesRenderer — matches rankings/breakouts pattern (epic atom 3/3).
