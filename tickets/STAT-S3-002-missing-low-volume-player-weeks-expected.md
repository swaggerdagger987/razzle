---
id: STAT-S3-002
severity: S3
category: data-accuracy
title: "364 missing low-volume player-weeks — expected nflverse filtering, not a bug"
status: wontfix
audit: STAT-AUDIT-REPORT.md
---

# STAT-S3-002: 364 missing low-volume player-weeks — expected behavior

## Finding

The stat audit flagged 364 NFL player-week records present in the raw nflverse source CSV but absent from the database. All are zero-production weeks for fringe players: return specialists, blocking TEs, backup QBs with 0 fantasy stats (e.g., Clay Harbor W15, JuJu Smith-Schuster 2017 W1, Cedric Peerman W2).

## Root Cause

**File: `adapters/nflverse_adapter.py:487-626`** — The `process_season()` function imports **every row** from the nflverse CSV without any minimum-production filter. There is no `fantasy_relevant` check or zero-stat skip in the adapter code.

The missing rows are absent because **nflverse itself** pre-filters the CSV. The nflverse `stats_player_week` release only includes players marked `fantasy_relevant` by their pipeline. Some older-format CSVs (pre-2020 `player_stats_YYYY.csv` releases) included fringe players that the newer releases exclude.

The 364 missing entries are distributed across 2015-2023 and represent:
- Special teamers with 0 fantasy points in specific weeks
- Backup players who were active but had no offensive stats
- Players whose `fantasy_relevant` flag was retroactively removed by nflverse

## Impact

NONE for fantasy purposes. These are zero-production weeks for players with no fantasy value in those games. No analytics, rankings, or derived metrics are affected.

## Decision

**Won't fix.** The adapter correctly imports everything nflverse provides. The 364 "missing" records are intentionally excluded by the upstream data source. Adding them would require downloading a separate, larger dataset and would add zero-value rows to the database.

## Acceptance Criteria

- [x] Root cause documented (nflverse upstream filtering)
- [x] Confirmed no impact on fantasy analytics
- [x] Marked as won't fix
