# Evidence — Lab L5 OG panels API live rows

**Date:** 2026-05-31  
**Slice:** `lab-og-panels-api-live` — OG fetch via `/api/panels/{slug}`

## Gate C

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/rankings?download=1` | 200 | 59509 | PASS |
| `/og/dashboard?download=1` | 200 | 60034 | PASS |

Both PNG 1200×630 via `file`.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/rankings?download=1'
curl -s -o /tmp/og-dashboard.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/dashboard?download=1'
```

## Change summary

- OG cards fetch `/api/panels/{slug}` (same as Lab) instead of legacy catalog paths.
- `extractRows` handles `candidates`, `top5`+`risers`, `rank_diff`, `breakout_score`.
- Live rows show blurb suffix `· live tape`; demo keeps `· sample preview`.
- Optional `RAZZLE_OG_CARD_PLAN` header for non-prod live tier unlock.

**Reality:** PASS
