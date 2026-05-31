# Evidence — League L5 Bureau Strength of Schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q → 51 passed, 5 skipped
```

## Wiring

- `HIDDEN_BUREAU_SLUGS` no longer includes `strength-of-schedule`
- `BureauFeatureBody` routes `strength-of-schedule` → `BureauStrengthOfSchedule`
- Octo header, PPG vs opponent-avg bar, verdict copy, hallway links to power-rankings / monte-carlo / self-scout

## Layer

League L5 — final hidden Bureau tab unhidden; epic complete (3/3 atoms).
