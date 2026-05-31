# Evidence — League L5 strength-of-schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`

## In-product

- `HIDDEN_BUREAU_SLUGS` empty — Schedule tab visible in Bureau nav
- `BureauStrengthOfSchedule` Octo renderer: rank, PPG vs avg opp, verdict, Room hallway link

## Build / tests

```
JWT_SECRET=test python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped

npm run build --workspace=apps/web
# exit 0
```

**Verdict:** PASS
