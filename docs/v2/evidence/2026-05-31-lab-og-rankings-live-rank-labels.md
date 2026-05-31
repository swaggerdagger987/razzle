# Evidence — lab-og-rankings-live-rank-labels

**Date:** 2026-05-31  
**Atom:** `lab-og-rankings-live-rank-labels`  
**Epic:** Lab L5 — Launch-10 OG rows match in-product rank labels (atom 1/3)  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1'
file /tmp/rankings-og.png
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 62 passed, 5 skipped |
| curl rankings | `200 67083` |
| PNG | 1200×630, ≥40KB |

## Notes

- `extractRankingsRows` mirrors DynastyRankingsRenderer: dynasty value sort with `#rank` stat labels from API `rank` or post-sort index.
