# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
npm run dev --workspace=apps/web -- -p 3000
JWT_SECRET=test ENVIRONMENT=development .venv-v2/bin/uvicorn apps.api.main:app --port 8000
curl -s -o /tmp/og-college-q.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/explore?universe=college&sort=total_yards&dir=desc&q=ward&download=1'
curl -s -o /tmp/og-nfl-q.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/explore?universe=nfl&sort=fantasy_points_ppr&dir=desc&q=chase&download=1'
curl -s -o /tmp/og-college.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/explore?universe=college&sort=total_yards&dir=desc&download=1'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| college + q=ward | 200 | 40950 | 1200×630 |
| nfl + q=chase | 200 | 32455 | 1200×630 |
| college default | 200 | 44174 | 1200×630 |

## Change

- `buildExploreOgSearchParams()` — shared universe/sort/q/pos for preview + export links.
- `effectiveExploreSortKey()` — college remaps `fantasy_points_ppr` → `total_yards` in export URL.
- College OG card shows `COLLEGE · CFB screener` Caveat sticker (QB blue `#5b7fff`).
