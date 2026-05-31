# Evidence — Explore OG universe pytest contract

**Cycle:** 124  
**Atom:** `explore-og-universe-query` (regression lock; feature on base `7dbd4b11`)  
**Date:** 2026-05-31

## Acceptance

```bash
JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_explore_og_universe.py -q
```

→ 1 passed

## Verdict

PASS — Contract test locks ExploreShareButton `universe` → `/og/explore` college vs nfl wiring.
