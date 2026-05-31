# Evidence — Bureau Schedule tab (league-schedule-tab)

**Date:** 2026-05-31  
**Atom:** `league-schedule-tab`  
**Verdict:** PASS

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |

## UI claim

- `strength-of-schedule` removed from `HIDDEN_BUREAU_SLUGS` — Schedule tab visible in Bureau nav.
- `BureauStrengthOfSchedule.tsx` renders Octo header, slate verdict, your PPG vs avg opponent bars.
- No OG route in this atom — Gate C N/A.

## Files

- `apps/web/components/league/BureauStrengthOfSchedule.tsx` (new)
- `apps/web/components/league/BureauFeatureBody.tsx`
- `apps/web/lib/bureau-features.ts`
