# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Cycle:** 121  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q   # 58 passed, 5 skipped
curl -s -o /tmp/og-nfl.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&download=1'
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| NFL OG export | `200 34561` PNG 1200×630 |
| College OG export | `200 37393` |
| Copy link | Explicit `/explore?universe=…&sort=…` URL (not bare window.location) |
| OG fetch | `resolveApiOrigin(req)` same-origin screener query |
| Export sort | `apiSortKey` passed from ExplorePageClient (college total_yards) |

## Change

Explore share/export always encodes universe + API-aligned sort in OG and copy URLs; OG route fetches screener via same-origin `/api/screener/query`.
