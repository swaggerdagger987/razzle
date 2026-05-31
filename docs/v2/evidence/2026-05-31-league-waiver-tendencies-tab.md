# Evidence — league-waiver-tendencies-tab (2026-05-31)

## Slice

Waiver Tendencies Bureau tab — Hawkeye bespoke cards; unhide nav slug `waiver-tendencies`.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
python3 -m pytest apps/api/tests -q --maxfail=1   # 51 passed, 5 skipped
```

## UI

- `BureauWaiverTendencies.tsx` — archetype badges, FAAB/adds stats, Hawkeye room link
- `HIDDEN_BUREAU_SLUGS` — only `strength-of-schedule` remains hidden
- No OG route this cycle (out of scope)

## Verdict

PASS — Bureau tab renders bespoke layout; no `BureauRowsTable` fallback for waiver-tendencies.
