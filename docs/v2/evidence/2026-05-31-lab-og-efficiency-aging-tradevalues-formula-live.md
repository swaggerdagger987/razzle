# Evidence — lab-og-efficiency-aging-tradevalues-formula-live (2026-05-31)

**Atom:** `lab-og-efficiency-aging-tradevalues-formula-live`  
**Epic:** Lab L5 — OG formula_score live extract (atom 3/3)

## Commands

```bash
PATH=$HOME/.local/bin:$PATH JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_launch10_formula_live.py -q --noconftest
npm run build --workspace=apps/web

curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&force_demo=1'
curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/efficiency?download=1&force_demo=1'
curl -s -o /tmp/og-aging.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/aging?download=1&force_demo=1'
file /tmp/og-*.png
```

## Results

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| tradevalues | 200 | 67267 | PNG 1200×630 |
| efficiency | 200 | 64569 | PNG 1200×630 |
| aging | 200 | 63841 | PNG 1200×630 |

## Code

- `efficiencyStatKeys` / `agingStatKeys` — `formula_score` before `ppo` / `ppg`
- pytest guards for tradevalues, efficiency, aging (6 tests total)

## Verdict

PASS — Gate C2 satisfied on localhost with demo fallback.
