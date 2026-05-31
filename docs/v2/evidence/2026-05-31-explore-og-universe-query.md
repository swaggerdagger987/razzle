# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Epic:** Explore L5 — OG card matches screener query state (atom 1/3)  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/explore-og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&universe=college&sort=total_yards&dir=desc&pos=QB&season=2024'
file /tmp/explore-og-college.png
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl college+season+pos | `200 36951` |
| PNG | 1200×630, ≥15KB |

## Notes

- `ExploreShareButton` forwards `season`, `team`, and API `sort` (not formula_*).
- `/og/explore` fetch uses teams/season; band link built via `buildExplorePageLink`.
