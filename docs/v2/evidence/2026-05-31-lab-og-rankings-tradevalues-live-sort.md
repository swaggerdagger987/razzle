# Evidence — lab-og-rankings-tradevalues-live-sort

**Date:** 2026-05-31  
**Atom:** Rankings + Trade Values OG rank by dynasty_value / trade_value on live fetch  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?position=WR&download=1'
# 200 50251

curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?position=WR&download=1'
# 200 51115

file /tmp/og-rankings.png /tmp/og-tradevalues.png
# PNG 1200x630 both
```

- Routes: `/og/rankings`, `/og/tradevalues` with `position=WR`
- Sizes ≥40KB (demo fallback when API empty; live fetch uses dynasty_value / trade_value sort)

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
