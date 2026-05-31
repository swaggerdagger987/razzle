# Evidence — League L5 Bureau waiver-tendencies tab unhidden

**Date:** 2026-05-31  
**Slice:** `league-bureau-waiver-tendencies`  
**Dedup:** `league-bureau-build-profiles` already on base via PR #351 (`b17887d0`).

## Acceptance commands (executed)

```
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 52 passed (4 screener snapshot fails pre-existing on base)
node waiver-features check  → waiver-tendencies unhidden
```

## Verdict

PASS — Bureau tab visible; `BureauWaiverTendencies` renders Hawkeye archetype cards from `/api/bureau/waiver-tendencies` rows.
