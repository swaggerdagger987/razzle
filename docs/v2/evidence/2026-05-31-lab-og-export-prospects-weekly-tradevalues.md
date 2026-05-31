# Evidence — Lab OG export links (prospects, weekly, tradevalues)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-link-prospects-weekly-tradevalues`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Routes

| Panel | OG path | HTTP | PNG bytes |
|-------|---------|------|-----------|
| Big Board | `/og/prospects?download=1` | 200 | 58084 |
| Weekly Heatmap | `/og/weekly?download=1` | 200 | 63819 |
| Trade Values | `/og/tradevalues?download=1` | 200 | 62488 |

## Commands (executed)

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/prospects?download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/weekly?download=1'
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/tradevalues?download=1'
```

All PNGs ≥40KB with demo/live row layout (not loading-copy-only).
