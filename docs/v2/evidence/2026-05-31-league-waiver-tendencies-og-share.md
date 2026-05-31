# Evidence — league-waiver-tendencies-og-share

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-og-share` (epic atom 3/4)  
**Verdict:** PASS (Gate C)

## Route

- `GET /og/waiver-tendencies?league=demo&download=1`

## curl (local `next start` on :3000)

```
200 73121
```

PNG: 1200×630, non-interlaced — demo FAAB hoarder hero + four manager rows with archetype bars.

## Build / test

- `pytest apps/api/tests -q` → 51 passed, 5 skipped
- `npm run build --workspace=apps/web` → exit 0; route listed as `ƒ /og/waiver-tendencies`

## Trust

- T5 — export card matches in-panel Hawkeye waiver archetypes
- T6 — copy link + download on Bureau Waiver Tendencies tab
