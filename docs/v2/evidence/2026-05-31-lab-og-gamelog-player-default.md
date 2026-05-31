# Evidence — Gamelog OG default player_id

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Slice:** Lab L5 — OG live fetch epic atom 3/3

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1` (no `player_id`) | 200 | 60634 | PASS |
| `/og/gamelog?download=1&player_id=` (blank) | 200 | 60634 | PASS |

Both return PNG 1200×630 ≥40KB with live week rows (Ja'Marr Chase default `00-0036900`).

## Build / tests

- `JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_lab_og_gamelog_player_default.py -q --noconftest` — 3 passed
- `npm run build --workspace=apps/web` — exit 0

## Change

`/og/[panel]` treats omitted or whitespace-only `player_id` / `id` query as missing and falls back to `DEFAULT_OG_PLAYER_ID` before `apiParams.player_id` is set for player-scoped panels (gamelog).
