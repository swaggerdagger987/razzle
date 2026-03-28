---
id: S3-036
severity: S3
category: backend
title: CFB TD attribution edge case — Fotis Kokosioulis 2022 rec_tds (DB=6, source=2)
source: stat-audit
status: open
---

## Problem

The stat audit found 1 CFB discrepancy out of 1,500 checks (99.93% accuracy):

| Player | Season | Stat | Source (verifier) | DB | Delta |
|--------|--------|------|-------------------|-----|-------|
| Fotis Kokosioulis | 2022 | rec_tds | 2 | 6 | +4 |

## Root Cause

cfbfastR play-level data inconsistently assigns `touchdown_player_id` — sometimes to the scorer, sometimes to the passer. The adapter's and verifier's TD attribution logic can produce different counts for edge-case players with unusual play coding. The DB values were imported by the adapter which uses `completion_player_id` and `rush_player_id` role-specific columns.

This is a known limitation of play-by-play derived stats for low-volume players.

## Fix

1. Investigate Fotis Kokosioulis's 2022 plays in the cfbfastR source CSV
2. Determine whether the adapter or verifier has the correct TD count
3. If the adapter over-counts, fix the TD attribution logic in `adapters/cfbfastr_adapter.py`
4. If the verifier under-counts, no action needed (DB is correct)

## Accept When

- The root cause of the +4 TD discrepancy is identified
- If the adapter is wrong, the fix is applied and the player's rec_tds corrected
- If the adapter is right, this ticket is closed as "verifier issue"
