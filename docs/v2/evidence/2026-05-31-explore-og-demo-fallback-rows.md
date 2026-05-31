# Evidence — explore-og-demo-fallback-rows

**Date:** 2026-05-31  
**Atom:** `explore-og-demo-fallback-rows`  
**Epic:** Explore L5 — OG card matches screener query state (atom 2/3)  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/explore-og-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1&universe=nfl&sort=fantasy_points_ppr&dir=desc&pos=QB'
file /tmp/explore-og-demo.png
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl force_demo NFL | `200 64789` |
| PNG | 1200×630, ≥40KB |

## Notes

- `force_demo=1` skips live screener fetch for factory verification.
- Empty API responses use NFL/college `DEMO_*_ROWS` instead of `pulling film…`.
- Terracotta `SAMPLE · not live data` sticker on demo path.
