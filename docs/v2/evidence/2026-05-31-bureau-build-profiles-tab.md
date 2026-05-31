# Evidence — Bureau Build Profiles tab (2026-05-31)

**Slice:** `league-build-profiles-tab` — Unhide Build Profiles with Atlas renderer  
**Atom:** 4/6 — League L5 unhide Bureau epic

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
```

## Verification

- `build-profiles` removed from `HIDDEN_BUREAU_SLUGS` in `apps/web/lib/bureau-features.ts`
- `BureauBuildProfiles.tsx` renders archetype grid with Atlas header + hallway links
- `BureauFeatureBody` routes `build-profiles` to bespoke renderer (no scaffold fallback)

## Verdict

PASS — in-product Bureau tab; no OG slice this atom (Gate C N/A).
