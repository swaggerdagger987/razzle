# Evidence — League L5 Schedule / SOS tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`

## Change

- Cleared `HIDDEN_BUREAU_SLUGS` (all Bureau tabs now visible).
- Added `BureauStrengthOfSchedule` with Octo header, PPG vs opponent bars, verdict copy, Room hallway link.
- Wired `strength-of-schedule` in `BureauFeatureBody`.

## Verification

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test .venv-v2/bin/python -m pytest apps/api/tests -q  # 55 passed, 1 snapshot drift (dynasty_top_30)
rg 'HIDDEN_BUREAU_SLUGS' apps/web/lib/bureau-features.ts
# → export const HIDDEN_BUREAU_SLUGS = new Set<string>();
```

## Verdict

**PASS** — Bureau `/league/{id}/strength-of-schedule` route renders when Sleeper user connected; final hidden tab unhidden (epic 3/3).
