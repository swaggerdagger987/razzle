# Evidence — lab-og-buysell-aging-sort

**Date:** 2026-05-31  
**Atom:** Buy-sell + aging OG direct links sort top-6 by panel stat  
**Verdict:** PASS

## Gate C — OG PNG

```text
curl -s -o /tmp/og-buysell.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/buysell?position=WR&download=1'
→ 200 44258

curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/aging?position=RB&download=1'
→ 200 44952

file /tmp/og-buysell.png /tmp/og-aging.png
→ PNG 1200×630 both
```

## Build / tests

- `npm run build --workspace=apps/web` — PASS
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Change summary

- `DIRECT_STAT_SORT_SLUGS` adds `buysell`, `aging`
- `extractRows` handles `buy_low`/`sell_high` and `positions.*.players`
- BuySellRenderer + AgingCurvesRenderer snapshot rows sorted by panel stat before export
