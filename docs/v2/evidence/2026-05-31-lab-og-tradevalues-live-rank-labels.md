# Evidence — lab-og-tradevalues-live-rank-labels

**Date:** 2026-05-31  
**Atom:** Trade Values OG — rank · Value statLabel on live value rows  
**Verdict:** PASS (pending merge)

## Contract

- `extractTradeValuesRows` in `apps/web/app/og/[panel]/route.tsx`
- `apps/api/tests/test_og_tradevalues_live_rank_labels.py` — 2 tests

## Executed checks

```bash
python3 -m pytest apps/api/tests/test_og_tradevalues_live_rank_labels.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-tradevalues.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/tradevalues?download=1"
# 200, ≥40000 bytes (live or demo rows)
```

## Gate C

Route `/og/tradevalues` returns PNG ≥40KB with player rows (demo fallback when API empty).
