# Evidence — league-strength-of-schedule-tab (2026-05-31)

## Slice

Schedule Bureau tab unhidden with Octo SOS matchup renderer (verdict + PPG bars).

## Commands

```text
python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
npm run build --workspace=apps/web    → exit 0
```

## UI

- `HIDDEN_BUREAU_SLUGS` no longer includes `strength-of-schedule`
- Route: `/league/{id}/strength-of-schedule` (needs Sleeper user for POST body)
- Renderer: `BureauStrengthOfSchedule.tsx` — Octo header, verdict hero, matchup bars

## Verdict

PASS — build + pytest green; tab unhidden; no OG scope this atom.
