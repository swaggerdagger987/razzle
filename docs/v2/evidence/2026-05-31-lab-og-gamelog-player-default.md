# Evidence — Gamelog OG blank player_id trim

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-blank-player-trim`  
**Slice:** Lab L5 — whitespace `player_id` / `id` query falls back to Ja'Marr Chase default

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/gamelog?download=1` (no `player_id`) | 200 | 60634 | PASS |
| `/og/gamelog?download=1&player_id=` (blank) | 200 | 60634 | PASS |

Both return PNG 1200×630 ≥40KB with live week rows (`00-0036900`).

## Build / tests

- `JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests/test_lab_og_gamelog_player_default.py -q --noconftest` — 3 passed
- `npm run build --workspace=apps/web` — exit 0

## Change

`/og/[panel]` uses `rawPlayerId?.trim() || DEFAULT_OG_PLAYER_ID` so whitespace-only query params do not bypass the nflverse default.
