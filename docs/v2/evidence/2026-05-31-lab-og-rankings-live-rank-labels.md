# Evidence — Lab L5 rankings OG live #rank labels

**Date:** 2026-05-31  
**Atom:** `lab-og-rankings-live-rank-labels`  
**Epic:** Lab L5 — OG live panel rows match in-product rank readout (atom 1/3)

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/rankings?download=1` | 200 | 66806 | PNG 1200×630 |

```bash
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1'
file /tmp/rankings-og.png
```

## Tests

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_rankings_live_rank_labels.py -q --noconftest
# 2 passed

npm run build --workspace=apps/web
# exit 0
```

**Verdict:** PASS — `extractRankingsRows` assigns `#1`–`#6` statLabels after dynasty_value sort; demo fallback unchanged.
