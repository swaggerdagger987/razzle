# Evidence — league-strength-of-schedule-tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS (in-product Bureau tab)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## Wiring

- `HIDDEN_BUREAU_SLUGS` no longer includes `strength-of-schedule`
- `BureauStrengthOfSchedule` — Octo header, verdict strip, PPG pressure bar, Room + footer hallway
- `BureauFeatureBody` routes `strength-of-schedule` slug

## Dedup

- `league-waiver-tendencies-tab` already on base (`a2536dcc`); not rebuilt this cycle.
