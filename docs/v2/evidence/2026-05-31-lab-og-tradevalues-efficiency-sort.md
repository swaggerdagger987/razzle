# Evidence — Lab OG tradevalues + efficiency direct sort (2026-05-31)

**Atom:** `lab-og-tradevalues-efficiency-sort`  
**Epic:** Lab L5 — OG direct-link stat sort (atom 1/3)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-tradevalues.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?position=WR&download=1'
# 200 51115
curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?position=RB&download=1'
# 200 45113
file /tmp/og-tradevalues.png /tmp/og-efficiency.png  # PNG 1200×630
```

## Verdict

PASS — Gate C satisfied (PNG ≥40KB, ranked stat sort on direct OG links).
