# Evidence — Lab L5 OG launch-10 demo stat labels

**Date:** 2026-05-31  
**Slice:** `lab-og-panel-specific-demos`  
**Route:** `/og/[panel]`

## Acceptance commands

```text
npm run build --workspace=apps/web — exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q — 51 passed, 5 skipped
curl http://localhost:3000/og/weekly?download=1 — 200 63819 bytes PNG 1200×630
curl http://localhost:3000/og/tradevalues?download=1 — 200 62488 bytes PNG
curl http://localhost:3000/og/gamelog?download=1 — 200 58408 bytes PNG
curl http://localhost:3000/og/prospects?download=1 — 200 58084 bytes
curl http://localhost:3000/og/aging?download=1 — 200 57934 bytes
curl http://localhost:3000/og/dashboard?download=1 — 200 60034 bytes
```

## Gate C verdict

PASS — all launch-10 slugs now have panel-specific demo stat columns (FPTS, Score, Rank, Value, Peak Age, Chg) when live API empty. PNGs ≥40KB with player rows visible.

## Follow-up

Atom 3: default `player_id` params for parameterized panel OG routes.
