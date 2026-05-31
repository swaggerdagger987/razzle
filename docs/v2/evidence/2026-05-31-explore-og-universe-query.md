# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 59 passed, 5 skipped
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&universe=college&sort=total_yards&dir=desc'
curl -s -o /tmp/og-nfl.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&universe=nfl&sort=fantasy_points_ppr&dir=desc'
file /tmp/og-college.png /tmp/og-nfl.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| College OG export URL | `200 37393` PNG 1200×630 |
| NFL OG export URL | `200 34561` PNG 1200×630 |

## Change

`buildExploreShareQuery` + `ogSortForUniverse` centralize universe and college sort remapping in copy-link and export-card URLs (mirrors `/og/explore` route). Forwards `season`/`team` from Explore toolbar. College export button label reads "export college card".
