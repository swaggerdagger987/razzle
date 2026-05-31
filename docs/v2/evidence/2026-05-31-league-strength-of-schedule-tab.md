# Evidence — League L5 Bureau Schedule tab

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS (in-product Bureau tab, not OG)

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
```

## UI claim

- `strength-of-schedule` removed from `HIDDEN_BUREAU_SLUGS` in `apps/web/lib/bureau-features.ts`
- `BureauStrengthOfSchedule.tsx` renders Octo header, slate verdict, you-vs-avg-opponent bars
- `BureauFeatureBody.tsx` routes feature slug to bespoke renderer (no `BureauRowsTable` fallback)

## Gate C

Not an OG slice — Gate C3 satisfied by in-product Bureau layout with live API fields
(`your_rank`, `your_ppg`, `opponent_avg_ppg`, `verdict` from `/api/bureau/strength-of-schedule`).

**Follow-up:** Wire Sleeper `matchups/{week}` for true remaining-opponent list (API comment Phase 5.5).
