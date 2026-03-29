---
id: S3-112
severity: S3
category: backend
title: 364 missing zero-production player-weeks for fringe players (2015-2018)
source: STAT-AUDIT-REPORT.md
status: open
---

## Problem

The stat audit cross-referenced 10,000 random stats against the nflverse source CSVs and found 364 player-week rows present in the source but missing from `data/terminal.db`. All are zero-production weeks for fringe players (return specialists, blocking TEs, backup QBs).

Examples:
- Clay Harbor (TE, S2015 W15): exists in DB for weeks 1,3,4,11,12,14,16,17 but missing week 15
- JuJu Smith-Schuster (WR, S2017 W1): has weeks 2-19 but missing rookie debut week 1
- Cedric Peerman (S2015 W2), Kellen Davis (S2015 W11), Jared Abbrederis (S2015 W8), etc.

Two entries are "Player not found in DB" entirely:
- Rashawn Scott (csv_id=00-0032621, WR, S2017 W11)
- Brendan Langley (csv_id=00-0033552, WR, S2017 W7)

## Root Cause

The nflverse adapter at `adapters/nflverse_adapter.py:510-527` processes every row from the CSV without filtering. The missing rows are likely due to:

1. **CSV version drift** — The nflverse CSV downloaded during the last import was an older release that didn't include these player-weeks. nflverse retroactively adds rows for players who appeared in games but had zero fantasy stats.
2. **Player ID resolution failure** — For the 2 "Player not found" entries, `resolve_player_id()` (line 419) returned None and `backfill_player()` (line 436) may have failed if the CSV row lacked a `player_id` (gsis_id) field.

## Impact

**NONE for fantasy purposes.** All 364 missing entries are zero-production weeks for players nobody drafts, trades, or starts. No analytics, rankings, or derived metrics are affected. The stat audit rates overall accuracy at 99.91% (9,627/9,636 matched checks).

## Fix

1. Re-run `python adapters/nflverse_adapter.py --seasons 2015 2016 2017 2018` to pick up any new rows from the latest nflverse release
2. For the 2 "Player not found" entries, check if `backfill_player()` handles rows where `row.get("player_id")` is empty — add a guard if needed at line 438
3. Upload updated `terminal_clean.db` to GitHub release

## Files to Change

- `adapters/nflverse_adapter.py:438` — add guard for empty gsis_id in backfill
- Re-run adapter for 2015-2018 seasons (data operation, not code change)

## Accept When

- Re-import of 2015-2018 reduces the "missing" count from 364 to <10
- The 2 "Player not found" entries are either imported or documented as expected exclusions
