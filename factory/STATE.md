# State

## NOW

- **Active slice:** none — S-001 is next
- **Blockers:** none
- **Last commit:** (seed)
- **Date:** 2026-06-09

## BACKLOG

### S-001 nflverse-ingest [OPEN]
- **Pillar/Layer:** Data (Explore L0 prerequisite) · **Trust:** T1 substrate
- **Goal:** Fresh nflverse adapter fills `players` + `player_week_stats` via the Alembic schema; expose `GET /api/players`.
- **Scope:** `apps/api/src/razzle_api/ingest/` (new module ok inside src), `scripts/sync_data.py`, `apps/api/src/razzle_api/api/routers/players.py` + schema, `apps/api/src/razzle_api/services/`, tests, one migration only if a column is genuinely missing.
- **Gates:** G1–G4; G5: `python scripts/sync_data.py --quick` loads ≥500 players for the current + prior season, re-run is idempotent (row counts stable), `data/razzle.db` < 100MB, `curl -s 'localhost:8000/api/players?position=RB' | jq length` ≥ 20.
- **Notes:** Reference (read-only, never import): `legacy/adapters/nflverse_adapter.py` in the old razzle repo — URLs, column mappings for the `stats_player_week_YYYY.csv` format. See `spec/DATA.md`.

### S-002 explore-screener [OPEN]
- **Pillar/Layer:** Explore L0–L1 · **Trust:** T1, T6
- **Goal:** `/explore` screener — TanStack Table over `/api/players` stats, position filter, sortable columns, nuqs URL state, position colors, "pulling film..." loading state.
- **Scope:** `apps/web/src/app/explore/`, `apps/web/src/features/explore/`, API screener endpoint + service, tests.
- **Gates:** G1–G4; G5: ≥20 rows render, sort/filter updates URL, refresh preserves state, no 500s, tokens-only styling, screenshot attached.

### S-003 player-sheet-v0 [OPEN]
- **Pillar/Layer:** Player Sheet · **Trust:** T3
- **Goal:** `/player/[gsis_id]` — header (name/team/position color), season + weekly stat table, prev/next player switch; every Explore row links here.
- **Scope:** `apps/web/src/app/player/`, `apps/web/src/features/player-sheet/`, players API detail endpoint, tests.
- **Gates:** G1–G4; G5: Explore row click lands on sheet, switching players feels instant, hallway check `playerIdentityConsistent`, screenshot.

### S-004 explore-custom-scoring [OPEN]
- **Pillar/Layer:** Explore L3 · **Trust:** T1, T3
- **Goal:** Scoring preset picker (PPR/half/standard/TEP from `domain/scoring/presets.py`) + editable core rules; fantasy-points column computed server-side by `score_week` over real week stats.
- **Scope:** screener API (accept scoring config), `apps/web/src/features/explore/` controls, `apps/web/src/features/scoring-preview/` integration, tests.
- **Gates:** G1–G4; G5: points column changes when rules change, values match engine unit-test fixtures, URL carries the preset.

### S-005 lab-vorp-panel [OPEN]
- **Pillar/Layer:** Lab L1 (Launch-10 `vorp`) · **Trust:** T1, T5, T6
- **Goal:** `/lab/vorp` — `value_players` over a real season with the active scoring config; tier-colored table, Octo header, screenshot-worthy.
- **Scope:** `apps/web/src/app/lab/`, `apps/web/src/features/lab/`, valuation service wiring to real data, tests.
- **Gates:** G1–G4; G5: real top-200 renders, position ranks correct vs `test_vorp.py` logic, links back to Player Sheet (hallway `crossRoomLinkPresent`), screenshot.

### S-006 sleeper-connect [OPEN]
- **Pillar/Layer:** Bureau L0 · **Trust:** T2
- **Goal:** Sleeper username → league list → pick league; persist `LeagueConfig` (new `leagues` migration); context bar shows `@user · league`.
- **Scope:** to be fenced by a frontier planning pass before activation.
- **Gates:** to be defined when fenced.

## LEDGER

| Slice | Date | Commit | Gates | Note |
|-------|------|--------|-------|------|
| seed | 2026-06-09 | — | G1–G4 | Repo seeded: specs, factory, domain spine (scoring+VORP), tokens, personas, web skeleton |
