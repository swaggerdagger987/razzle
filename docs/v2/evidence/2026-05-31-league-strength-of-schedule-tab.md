# Evidence — League L5 Schedule tab (atom 3/3)

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS (no OG this cycle)

## Commands

```bash
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped

npm run build --workspace=apps/web
# exit 0
```

## Product

- `HIDDEN_BUREAU_SLUGS` empty — Schedule tab visible in Bureau nav
- `BureauStrengthOfSchedule` — Octo verdict + PPG vs league-average opponent bars + power context link
- Wired in `BureauFeatureBody` for `strength-of-schedule`

## Notes

- Bureau SOS API returns per-user `your_rank`, `your_ppg`, `opponent_avg_ppg`, `verdict` (no OG route this cycle)
