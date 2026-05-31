# Evidence — League Strength of Schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`

## Build

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
```

## UI

- `BureauStrengthOfSchedule.tsx` — Octo header, rank/PPG/opp avg grid, verdict + Room link
- `HIDDEN_BUREAU_SLUGS` — empty set; all Bureau tabs visible
- `BureauFeatureBody` — routes `strength-of-schedule` to bespoke renderer

## Verdict

**PASS** — Schedule tab unhidden; unhide Bureau epic complete.
