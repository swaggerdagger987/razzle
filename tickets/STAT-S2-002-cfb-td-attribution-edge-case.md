---
id: STAT-S2-002
severity: S2
category: data-accuracy
title: "CFB TD attribution edge case — adapter can over-count rec_tds"
status: open
audit: STAT-AUDIT-REPORT.md
decomposed-to: self (atomic — cfbfastr_adapter.py:247-250 add play_type check)
---

# STAT-S2-002: CFB TD attribution edge case — adapter can over-count rec_tds

## Finding

The stat audit found 1 CFB error out of 1,500 checks (99.93% accuracy):

| Player | Season | Stat | Source (verifier) | DB | Delta |
|--------|--------|------|-------------------|-----|-------|
| Fotis Kokosioulis | 2022 | rec_tds | 2 | 6 | +4 |

The adapter over-counted receiving TDs by 4 for this edge-case player.

## Root Cause

**File: `adapters/cfbfastr_adapter.py:201-250`**

The adapter extracts player IDs from each play (lines 201-206):
```python
td_id = valid_id(row.get("touchdown_player_id"))   # line 201
rec_id = valid_id(row.get("reception_player_id"))   # line 204
```

Receiving TDs are credited when `td_id == rec_id` (lines 247-250):
```python
# Receiving TD: credit receiver only when they scored
if td_id and td_id == rec_id:        # line 248
    p["rec_tds"] += 1                 # line 249
    p["total_tds"] += 1              # line 250
```

QB passing TDs use the same condition (lines 221-223):
```python
# Passing TD: credit QB only when the receiver scored
if td_id and rec_id and td_id == rec_id:   # line 221
    p["pass_tds"] += 1                      # line 222
    p["total_tds"] += 1                     # line 223
```

### The edge case

cfbfastR play-level data **inconsistently assigns `touchdown_player_id`**:
- **Usually**: `touchdown_player_id` = the scorer (receiver on pass TDs, rusher on rush TDs)
- **Sometimes**: `touchdown_player_id` = the passer on passing TDs

When `touchdown_player_id` incorrectly points to the receiver on plays where they didn't actually score (or when duplicate play rows exist with different ID assignments), the adapter over-counts. The verifier's aggregation logic produces a different (likely more accurate) count.

### No play-type filtering

The adapter does **not** check whether a play is actually a pass play before crediting receiving stats. It relies entirely on whether `reception_player_id` is populated (line 235: `if rec_id:`). This means ambiguous rows with populated `reception_player_id` AND `touchdown_player_id` always generate a rec_td credit if the IDs match, even if the play was categorized differently by the source.

## Fix Plan

1. **Add play-type validation**: Check `row.get("play_type")` or `row.get("type")` before crediting TDs. Only count `rec_tds` on plays where the play type is "pass" or "reception".
2. **Deduplicate by game+play**: If cfbfastR provides multiple rows for the same play (different perspectives), only count TDs once per game+play combination.
3. **Re-import CFB data** after the fix and verify Kokosioulis 2022 rec_tds.

## Files to Modify

- `adapters/cfbfastr_adapter.py:247-250` — Add play-type check before crediting `rec_tds`
- `adapters/cfbfastr_adapter.py:221-223` — Add play-type check before crediting `pass_tds` (symmetry)

## Impact

LOW. 1 of 1,500 CFB checks (0.07%). Only affects TD counts for edge-case college players with ambiguous play data. No impact on NFL stats or dynasty rankings.

## Acceptance Criteria

- [ ] Receiving TD attribution checks `play_type` or equivalent field before crediting
- [ ] Fotis Kokosioulis 2022 rec_tds matches source data after re-import
- [ ] No regression in other CFB player TD counts (re-run stat audit CFB category)
