# Evidence — Bureau Schedule / SOS tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Slice:** Schedule tab unhidden with SOS matchup renderer

## Changes

- `BureauStrengthOfSchedule.tsx` — Octo header, your PPG vs avg opponent bars, verdict + Room hallway
- `BureauFeatureBody.tsx` — wire `strength-of-schedule` slug
- `bureau-features.ts` — clear `HIDDEN_BUREAU_SLUGS` (all Bureau tabs live)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
grep HIDDEN_BUREAU_SLUGS apps/web/lib/bureau-features.ts   # empty Set
```

## Verdict

**PASS** — Schedule visible in Bureau nav; bespoke Octo renderer (no OG this atom). Epic complete (3/3 atoms).
