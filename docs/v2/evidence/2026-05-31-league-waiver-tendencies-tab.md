# Evidence — League L5 Waiver Tendencies tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-tab`

## Change

- Removed `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS` (Schedule tab remains hidden).
- Added `BureauWaiverTendencies` renderer with Hawkeye header, archetype badges, waiver lens, hallway links.

## Verification

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test pytest apps/api/tests -q  # exit 0
rg 'HIDDEN_BUREAU_SLUGS' apps/web/lib/bureau-features.ts
# → only strength-of-schedule hidden
```

## Verdict

**PASS** — Bureau `/league/{id}/waiver-tendencies` route no longer 404s; tab visible in Bureau nav.
