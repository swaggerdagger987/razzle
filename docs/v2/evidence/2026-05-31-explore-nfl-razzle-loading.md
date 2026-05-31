# Evidence — explore-nfl-razzle-loading

**Date:** 2026-05-31  
**Atom:** `explore-nfl-razzle-loading`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web
grep -n 'loadingCopyForAgent("razzle")' apps/web/components/explore/ExplorePageClient.tsx
```

## Results

- build exit 0
- line 185: NFL universe uses Razzle loading copy; college unchanged on Hawkeye
