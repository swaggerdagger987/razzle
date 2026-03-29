---
id: STAT-S1-001
severity: S1
category: data-accuracy
title: "Deploy stat audit fixes to production DB on Render"
status: open
audit: STAT-AUDIT-REPORT.md
---

# STAT-S1-001: Deploy stat audit fixes to production DB on Render

## Finding

The stat audit (2026-03-28) discovered and fixed two data issues on the **local** database (`data/terminal.db`). These fixes have NOT been deployed to the production Render database at `/data/terminal.db`.

### Fix 1: Season 2024 missing Phase 29 columns

All 5,597 rows in season 2024 had NULL for `passing_first_downs`, `rushing_first_downs`, `receiving_first_downs`, `sacks_taken`, `rushing_fumbles`, `receiving_fumbles`. Fixed locally by re-running the adapter for 2024.

### Fix 2: fantasy_points_half_ppr NULL for 2015-2023

48,882 rows across 2015-2023 had NULL `fantasy_points_half_ppr`. The new nflverse CSV format (`stats_player_week_YYYY.csv`) doesn't include this column. Fixed locally via SQL backfill:

```sql
UPDATE player_week_stats
SET fantasy_points_half_ppr = fantasy_points_std + COALESCE(receptions, 0) * 0.5
WHERE fantasy_points_half_ppr IS NULL AND fantasy_points_std IS NOT NULL;
```

## Root Cause

**File: `render.yaml:11-12`** — Comment says: "DB lives on persistent disk at /data (mounted below). Uploaded manually via gh release + SCP. No download needed during build."

The production DB on Render's persistent disk is a **manual upload**. Local fixes don't propagate unless the DB is re-uploaded. The adapter was re-run locally but the production instance still has the old data.

**File: `adapters/nflverse_adapter.py:48-54`** — Phase 29 columns (`passing_first_downs`, `rushing_first_downs`, `receiving_first_downs`, `sacks_taken`, `rushing_fumbles`, `receiving_fumbles`) were added after the initial 2024 import.

## Impact

- **Half-PPR scoring**: Any page using `fantasy_points_half_ppr` for 2015-2023 shows NULL or falls back to PPR. This affects the scoring comparison page (`scoring.html`), the Lab screener's Half-PPR mode, and any half-PPR rankings.
- **First downs / fumbles**: 2024 season missing these columns means workload, snap efficiency, and advanced stats pages show incomplete data for the current season.
- This is a **silent data gap** — pages render without errors but show wrong/missing values.

## Fix Plan

1. Re-run `python adapters/nflverse_adapter.py --seasons 2024` on local DB (if not already done)
2. Run the half_ppr backfill SQL on local DB (if not already done)
3. Upload the fixed `terminal.db` to the GitHub release or SCP directly to Render
4. Verify on production: `SELECT COUNT(*) FROM player_week_stats WHERE season=2024 AND passing_first_downs IS NOT NULL` should be > 0
5. Verify: `SELECT COUNT(*) FROM player_week_stats WHERE fantasy_points_half_ppr IS NULL AND fantasy_points_std IS NOT NULL` should be 0

## Files to Modify

- None (operational task — DB upload to Render)

## Acceptance Criteria

- [ ] Production DB has non-NULL `passing_first_downs` for 2024 season
- [ ] Production DB has non-NULL `fantasy_points_half_ppr` for all seasons 2015-2023
- [ ] Scoring comparison page shows correct Half-PPR values for historical seasons
- [ ] Lab screener Half-PPR mode returns data for all seasons
