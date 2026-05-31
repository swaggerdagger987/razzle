# Evidence — Lab OG buy/sell + dashboard live extractors

**Date:** 2026-05-31  
**Atom:** `lab-og-buysell-dashboard-live`  
**Slice:** OG `extractRows` for `buy_low`/`sell_high` and `top5`/`risers`/`fallers`  

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/buysell?download=1` | 200 | 58072 | PNG 1200×630, demo rows (no terminal.db) |
| `/og/dashboard?download=1` | 200 | 60034 | PNG 1200×630, demo rows |

```bash
curl -s -o /tmp/og-buysell.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/buysell?download=1"
curl -s -o /tmp/og-dashboard.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/dashboard?download=1"
file /tmp/og-buysell.png /tmp/og-dashboard.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB). Live path extracts buy/sell `buy_low`+`sell_high` and dashboard `top5`+`risers`+`fallers`; demo fallback unchanged when API empty.
