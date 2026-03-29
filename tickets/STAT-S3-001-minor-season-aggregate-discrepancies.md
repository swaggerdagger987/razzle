---
id: STAT-S3-001
severity: S3
category: data-accuracy
title: "Minor season aggregate discrepancies — Tannehill passing_tds +1, Jones PPR +2"
status: open
audit: STAT-AUDIT-REPORT.md
decomposed-to: self (atomic — resolved by STAT-S2-001 re-import including 2019 2022)
---

# STAT-S3-001: Minor season aggregate discrepancies

## Finding

The stat audit found 2 minor season aggregate mismatches (excluding the David Johnson name-collision verifier bug):

| Player | Season | Stat | Source | DB | Delta | Root Cause |
|--------|--------|------|--------|-----|-------|------------|
| Daniel Jones | 2019 | fantasy_points_ppr | 214.98 | 216.98 | +2.00 | 2pt conversion included in PPR but not broken out |
| Ryan Tannehill | 2022 | passing_tds | 13 | 14 | +1 | Week count mismatch or post-import CSV correction |

## Root Cause

**Daniel Jones +2.00 PPR**: Per-week PPR values match the source exactly. The +2.00 difference in the season aggregate is consistent with a 2-point conversion that nflverse includes in `fantasy_points_ppr` but doesn't break out as a separate stat column. The aggregation (`SUM` of weekly values) correctly accumulates this.

**File: `adapters/nflverse_adapter.py:1404-1431`** — Season aggregation logic sums weekly values from `player_week_stats`. If nflverse corrected Tannehill's CSV after import (reducing a week's passing_tds by 1), the DB still has the old weekly value, and the season sum is +1.

**Ryan Tannehill +1 passing_td**: The DB has the correct number of regular season weeks. Either a single week's `passing_tds` value was corrected by nflverse after import (same root cause as STAT-S2-001 first_downs corrections), or there is a minor aggregation edge case.

## Fix

Both will be resolved by re-importing the affected seasons:
```bash
python adapters/nflverse_adapter.py --seasons 2019 2022
```

This is a subset of the STAT-S2-001 fix. If STAT-S2-001 includes 2019 and 2022 in its re-import, this ticket is automatically resolved.

## Impact

TRIVIAL. Within 1-2 stat units on season aggregates. Does not affect per-week data, rankings, or any derived metrics meaningfully. Daniel Jones's +2 PPR is a rounding/attribution difference, not wrong data.

## Acceptance Criteria

- [ ] Ryan Tannehill 2022 passing_tds matches current nflverse source after re-import
- [ ] Daniel Jones 2019 fantasy_points_ppr matches current nflverse source after re-import
