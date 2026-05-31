# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 59 passed, 5 skipped
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&season=2024'
curl -s -o /tmp/og-nfl.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc'
file /tmp/og-college.png /tmp/og-nfl.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| College OG + season | `200 41427` PNG 1200×630 |
| NFL OG | `200 38060` PNG 1200×630 |
| Band link | includes `universe`, `sort`, `dir`, optional `season`/`team` |

## Change

`ExploreShareButton` forwards `season` and `team` into preview/export URLs; `/og/explore` reads them for screener query parity and watermark band deep link.
