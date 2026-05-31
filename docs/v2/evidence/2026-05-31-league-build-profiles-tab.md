# Evidence — league-build-profiles-tab (2026-05-31)

## Slice

Unhide Build Profiles Bureau tab with Atlas renderer + Room hallway links.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## Files

- `apps/web/lib/bureau-features.ts` — removed `build-profiles` from `HIDDEN_BUREAU_SLUGS`
- `apps/web/components/league/BureauBuildProfiles.tsx` — Atlas header, archetype cards, hallway
- `apps/web/components/league/BureauFeatureBody.tsx` — wire `build-profiles` renderer

## Trust

T2 — tab no longer dead-ends on scaffold copy; T5/T6 — league construction archetypes screenshot-ready.
