# Evidence — League L5 Waiver Tendencies tab

**Date:** 2026-05-31  
**Slice:** `league-waiver-tendencies-tab`  
**Verdict:** PASS (no OG — in-product Bureau only)

## Commands

```text
JWT_SECRET=test python3 -m pytest apps/api/tests -q
→ 51 passed, 5 skipped

npm run build --workspace=apps/web
→ success (Next.js 15 build complete)
```

## Product check

- Removed `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS` — nav + route live
- `BureauWaiverTendencies` renders Hawkeye header, archetype chips, team cards from API `rows`
- Hallway link: ask Hawkeye about waiver blocking

## Gate C

N/A — no OG route touched this cycle.
