# Evidence — explore-og-nfl-universe-default

**Date:** 2026-05-31  
**Atom:** `explore-og-nfl-universe-default`  
**Verdict:** PASS

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_share_og_universe.py -q --noconftest
npm run build --workspace=apps/web
```

## Results

| Check | Result |
|-------|--------|
| Pytest | 3 passed |
| Web build | exit 0 |

## Change

`ExploreShareButton` only adds `universe=college` to preview/export/copy URLs; default NFL dynasty screener links omit redundant `universe=nfl`, matching OG band `buildExplorePageLink` behavior.
