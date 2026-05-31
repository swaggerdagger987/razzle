# Evidence — League L5 Bureau Schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS (web build + contract grep)

## Change

- Cleared `HIDDEN_BUREAU_SLUGS` (Schedule visible in Bureau nav).
- Added `BureauStrengthOfSchedule` with Octo header, PPG differential, verdict copy.
- Wired in `BureauFeatureBody`.

## Verification

```bash
npm run build --workspace=apps/web  # success
grep HIDDEN_BUREAU_SLUGS apps/web/lib/bureau-features.ts
# → export const HIDDEN_BUREAU_SLUGS = new Set<string>([]);
```

Local pytest: 4 failures — `player_week_stats` missing in minimal `terminal.db` (pre-existing env, not slice). CI `api` job on prior PRs green with full data.
