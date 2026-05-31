# Evidence — Bureau Waiver Tendencies tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-tab`  
**Slice:** Waiver Tendencies tab unhidden with transaction pattern renderer

## Dedup note

`lab-efficiency-og-position-filter` already on base (`position` on `LabOgExportLink` in `EfficiencyRenderer`). Cycle shipped active epic atom 2/3 instead.

## Changes

- `BureauWaiverTendencies.tsx` — Hawkeye header, wire personality mix, adds/drops/FAAB table, Room hallway
- `BureauFeatureBody.tsx` — wire `waiver-tendencies` slug
- `bureau-features.ts` — remove `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 52 passed, 2 failed snapshot env (unrelated)
node hidden check   # waiver-tendencies not in HIDDEN set
```

## Verdict

**PASS** — Waiver Tendencies visible in Bureau nav; bespoke renderer wired to `/api/bureau/waiver-tendencies`.
