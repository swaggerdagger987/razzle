# Evidence — Bureau Build Profiles tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-build-profiles-tab`  
**Slice:** Build Profiles tab unhidden with Atlas roster archetype renderer

## Changes

- `BureauBuildProfiles.tsx` — Atlas header, league archetype counts, per-team build cards (Hero RB, Zero RB, Win Now, etc.), hallway to Roster Depth / Manager Profiles / Trade Finder / Room
- `BureauFeatureBody.tsx` — wire `build-profiles` slug
- `bureau-features.ts` — remove `build-profiles` from `HIDDEN_BUREAU_SLUGS`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
node hidden-slug check   # build-profiles not in HIDDEN_BUREAU_SLUGS Set
```

## Verdict

**PASS** — Build Profiles visible in Bureau nav; bespoke renderer (no OG this atom).
