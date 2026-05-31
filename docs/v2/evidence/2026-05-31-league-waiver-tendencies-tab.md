# Evidence — Bureau Waiver Tendencies tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-tab`  
**Slice:** Waiver Tendencies tab unhidden with Hawkeye transaction pattern renderer

## Changes

- `BureauWaiverTendencies.tsx` — Hawkeye header, league waiver-style counts, wire hawk + FAAB burner callouts, per-team add/drop/FAAB cards, Room hallway
- `BureauFeatureBody.tsx` — wire `waiver-tendencies` slug
- `bureau-features.ts` — remove `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
grep HIDDEN_BUREAU_SLUGS apps/web/lib/bureau-features.ts   # only strength-of-schedule hidden
```

## Verdict

**PASS** — Waiver Tendencies visible in Bureau nav; bespoke renderer (no OG this atom).
