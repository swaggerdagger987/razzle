# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** `explore-og-universe-query`  
**Verdict:** PASS

## Changes

- `ExploreShareButton` — already passes `universe` in OG URLs (pytest guard)
- `apps/web/app/og/explore/route.tsx` — teal LIVE sticker when screener rows render (`LIVE · college rows` / `LIVE · nflverse rows`)
- `apps/api/tests/test_explore_og_universe.py` — 3 source guards

## Commands

```text
python3 -c "from test_explore_og_universe import *; ..."  → 3 passed
npm run build --workspace=apps/web  → exit 0
curl http://127.0.0.1:3000/og/explore?universe=college&download=1  → 200 37393 PNG
curl http://127.0.0.1:3000/og/explore?universe=nfl&download=1     → 200 34561 PNG
```

## Trust

T5 (Explore OG matches universe), T6 (screenshot-ready LIVE sticker)
