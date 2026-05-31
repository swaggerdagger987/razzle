# Evidence — Explore NFL Razzle loading voice (2026-05-31)

**Atom:** `explore-loading-razzle-nfl`  
**File:** `apps/web/components/explore/ExplorePageClient.tsx`

## Claim

NFL screener result-count loading uses `loadingCopyForAgent("razzle")`; college keeps Hawkeye.

## Verification

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q  # 58 passed, 5 skipped
```

## Verdict

**PASS** — AGENTS.md Explore loading TODO cleared for NFL universe.
