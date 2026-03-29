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

**File**: `adapters/cfbfastr_adapter.py:250-252`

The receiving TD attribution logic credits a receiver whenever ANY `touchdown_player_id` exists on a reception play:

```python
# line 250-252
if td_id and comp_id:
    p["rec_tds"] += 1
    p["total_tds"] += 1
```

The condition `if td_id and comp_id` checks that (a) a `touchdown_player_id` exists and (b) a `completion_player_id` exists — but does NOT verify that the touchdown was scored by the receiver. The comment at line 249 acknowledges cfbfastR "sets touchdown_player_id to the passer, not receiver."

This over-counts rec_tds when:
- A reception occurs on a play where a different player scores (e.g., fumble recovery TD)
- cfbfastR marks `touchdown_player_id` on a play that was later nullified by penalty
- Multiple scoring events exist in the same play row

For Kokosioulis, the adapter likely credited 6 rec_tds on plays where `td_id` was set but the receiver didn't actually score. The verifier (using box-score totals) correctly counts 2.

**Related logic**: Passing TD at line 222 has the same pattern (`if td_id and rec_id: p["pass_tds"] += 1`) — same over-counting risk for QBs.

## Fix

1. At `cfbfastr_adapter.py:250`, add a guard: only credit rec_td if the play's `touchdown_player_id` matches the `reception_player_id` (or is the `completion_player_id`, since cfbfastR may set it to the passer):
   ```python
   if td_id and comp_id and (td_id == rec_id or td_id == comp_id):
       p["rec_tds"] += 1
   ```
2. Apply the same guard at line 222 for pass_tds
3. Re-import all CFB seasons: `python adapters/cfbfastr_adapter.py`
4. Verify Kokosioulis 2022 rec_tds drops from 6 to ~2

## Accept When

- The root cause of the +4 TD discrepancy is identified
- If the adapter is wrong, the fix is applied and the player's rec_tds corrected
- If the adapter is right, this ticket is closed as "verifier issue"
