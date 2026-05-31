# Evidence — Lab OG buysell + dashboard live sort keys

**Date:** 2026-05-31  
**Slice:** `lab-og-buysell-dashboard-live-sort`  
**Atom:** OG route ranks buysell by dynasty_value and dashboard by rank_diff on live fetch  

## Gate C — OG PNG

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/buysell?position=WR&download=1` | 200 | 44258 | PNG 1200×630, demo fallback |
| `/og/dashboard?position=WR&download=1` | 200 | 57657 | PNG 1200×630, demo fallback |

```bash
curl -s -o /tmp/og-buysell.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/buysell?position=WR&download=1"
curl -s -o /tmp/og-dashboard.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/dashboard?position=WR&download=1"
file /tmp/og-buysell.png /tmp/og-dashboard.png
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

**PASS** — Gate C2 satisfied (PNG ≥40KB). `PANEL_OG_STAT_KEY` uses `dynasty_value` / `rank_diff`; extractors handle `buy_low`/`sell_high` and dashboard movers.
