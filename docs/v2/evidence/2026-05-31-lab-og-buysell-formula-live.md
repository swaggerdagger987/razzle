# Evidence — lab-og-buysell-formula-live

**Date:** 2026-05-31  
**Atom:** Buy/sell OG live extract prefers formula_score + Buy/Sell lanes  
**Route:** `/og/buysell?download=1&position=WR`

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest
# 3 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-buysell.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&position=WR'
file /tmp/og-buysell.png
```

## Results

- pytest: 3 passed (includes `test_buysell_live_extract_prefers_formula_score_and_lanes`)
- web build: exit 0
- curl: `200` with PNG ≥ 40KB (live buy/sell rows)
- Code: `extractBuysellRows` + `buysellStatKeys` in `apps/web/app/og/[panel]/route.tsx`

## Verdict

PASS — Gate C satisfied for Lab L5 formula-sorted OG parity atom 2/3.
