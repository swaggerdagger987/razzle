# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Route:** `/og/explore?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-explore-q.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3001/og/explore?download=1&universe=nfl&q=chase'
curl -s -o /tmp/og-explore-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3001/og/explore?download=1&universe=college'
JWT_SECRET=test pytest apps/api/tests -q
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl NFL + query | `200 59238` |
| curl college | `200 64392` |
| PNG | 1200×630, ≥40KB |
| pytest | 62 passed (snapshot tests need terminal.db in CI) |

## Notes

- Universe sticker: teal NFL vs blue COLLEGE; search query in Caveat terracotta box.
- Demo rows when screener API empty — Gate C sample fallback.
- Explore L5 epic atom 1/3.
