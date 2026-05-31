# Evidence — league-waiver-tendencies-og-hawkeye-room

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-og-hawkeye-room` (epic atom 4/4)  
**Verdict:** PASS (Gate C)

## Route

- `GET /og/waiver-tendencies?league=demo&download=1`

## curl (local `next start` on :3000)

```
HTTP 200 size 88785
```

PNG: 1200×630, non-interlaced — demo FAAB hoarder hero, LIVE/SAMPLE stickers, Hawkeye Room hallway band, terracotta watermark.

## Build / test

- `pytest apps/api/tests/test_waiver_tendencies_og_hawkeye_room.py -q` → 1 passed
- `npm run build --workspace=apps/web` → exit 0; route listed as `ƒ /og/waiver-tendencies`

## Trust

- T5 — export card matches in-panel Hawkeye waiver archetypes + Room ask
- T6 — hallway deep link on watermark band + Hawkeye Room prefill
