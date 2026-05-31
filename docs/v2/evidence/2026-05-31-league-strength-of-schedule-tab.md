# Evidence — League L5 strength-of-schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`

## In-product

- `strength-of-schedule` removed from `HIDDEN_BUREAU_SLUGS` (set empty)
- `BureauStrengthOfSchedule` Octo renderer: verdict strip, PPG vs avg opponent bars, Room ask

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q --ignore=apps/api/tests/test_screener_snapshot.py` — 51 passed, 3 skipped

**Verdict:** PASS
