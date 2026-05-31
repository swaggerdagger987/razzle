# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-explore-nfl-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&force_demo=1'
curl -s -o /tmp/og-explore-college-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?universe=college&sort=total_yards&dir=desc&force_demo=1'
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| NFL force_demo OG | `200 60059` PNG 1200×630 |
| College force_demo OG | `200 62556` |
| Subtitle | includes `sample preview` on demo path |

## Change

Explore `/og/explore` uses universe-specific demo rows when screener query is empty or `force_demo=1` — no loading-only card shell.
