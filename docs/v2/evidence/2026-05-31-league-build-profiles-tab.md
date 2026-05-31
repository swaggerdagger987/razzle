# Evidence — League L5 Build Profiles tab unhidden

**Date:** 2026-05-31  
**Slice:** `league-build-profiles-tab` — Unhide Build Profiles tab with Atlas renderer  
**Verdict:** PASS (non-OG Bureau tab — Gate C N/A)

## Changes

- Removed `build-profiles` from `HIDDEN_BUREAU_SLUGS` in `apps/web/lib/bureau-features.ts`
- Added `BureauBuildProfiles.tsx` — Atlas header, league meta skew, archetype cards with rotated badges, Room hallway per team
- Wired `BureauFeatureBody` for `build-profiles` slug

## Commands (executed)

```text
JWT_SECRET=test python3 -m pytest apps/api/tests -q
→ 51 passed, 5 skipped

npm run build --workspace=apps/web
→ success; build-profiles route in league feature bundle
```

## Manual check

- Nav shows **Build Profiles** for connected leagues
- `/league/{id}/build-profiles` POSTs `/api/bureau/build-profiles` and renders Atlas archetype grid (requires live league in dev)
