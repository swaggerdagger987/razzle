# Data Contracts

## Identity

- **Primary player key:** nflverse `gsis_id`. Fallback: Sleeper `player_id` (stored as `sleeper_id`, nullable).
- All stat values stored as **floats**.

## One database, Alembic-owned

`data/razzle.db` (SQLite, gitignored). The Alembic migration chain in `apps/api/migrations/` is the machine truth for the schema; this doc explains intent. Every schema change is a migration — no ad-hoc DDL in app code.

Canonical tables (grow via migrations as slices demand):

| Table | Owns |
|-------|------|
| `players` | Identity: gsis_id PK, name, position, team, sleeper_id |
| `player_week_stats` | One row per player-season-week. **Column names mirror `razzle_api.domain.scoring.engine.PlayerWeekStats` fields** so rows load straight into the scoring engine with no mapping layer |
| `leagues` (later) | Sleeper league + `LeagueConfig` JSON |

**Size budget: dev database < 100 MB.** Sync scripts support a `--quick` mode (current + prior season) that stays lean.

## Adapter pattern

One adapter per source: **fetch → clean → normalize → write canonical tables.** Swapping or adding a data source means writing a new adapter — no other code changes. Adapters live in `apps/api/src/razzle_api/` (ingest is app code, not domain; the domain layer never does I/O). Sync entry point: `scripts/sync_data.py`. Syncs are **idempotent** — re-running upserts, never duplicates.

## Sources

| Source | What | Where |
|--------|------|-------|
| **nflverse** | NFL player identity + weekly stats. Releases API: `https://api.github.com/repos/nflverse/nflverse-data/releases` · players: `.../releases/download/players/players.csv` · weekly stats: release tag `stats_player`, files `stats_player_week_YYYY.csv` (2025+ format; columns renamed vs old `player_stats` — see the column-mapping notes in the old repo's `legacy/adapters/nflverse_adapter.py`) · also available: rosters, snap counts, injuries, schedule, combine | Weekly in-season |
| **cfbfastR** | College player season stats: `https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/player_stats/csv` | Offseason / draft season |
| **Sleeper API** | Leagues, rosters, picks, transactions, league scoring settings → `LeagueConfig` | Live per-user, cached |

Reference implementations (read-only, do not import): `legacy/adapters/` in the old `swaggerdagger987/razzle` repo — proven URL handling, column mappings, edge cases.

## Flow in one line

**nflverse + Sleeper → razzle.db → scoring/valuation domain (per-league rules) → rooms + staff context.**

Values (fantasy points, VORP) are computed from stats + `LeagueConfig` at request time — not stored — until profiling proves a cache is needed.
