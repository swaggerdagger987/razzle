# Evidence — Bureau Waiver Tendencies tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-tab`  
**Slice:** Waiver Tendencies tab unhidden with Bones FAAB style table

## Dedup

- `league-roster-depth-tab` and `league-build-profiles-tab` already on base — skipped rebuild.

## Changes

- `BureauWaiverTendencies.tsx` — Bones header, FAAB/adds/drops table, archetype styles, Room hallway
- `BureauFeatureBody.tsx` — wire `waiver-tendencies` slug
- `bureau-features.ts` — remove `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
```

## Verdict

**PASS** — Waiver Tendencies tab visible in Bureau nav; bespoke renderer ships.
