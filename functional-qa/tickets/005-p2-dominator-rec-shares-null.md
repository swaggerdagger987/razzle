---
id: FUNC-005
severity: P2
flow: 35 (Opportunity Share)
status: OPEN
file: backend/live_data/analytics.py
function: fetch_opportunity_share
created: 2026-03-20
---

# P2: Dominator rec_yd_share and rec_td_share always null

## What's broken

The `/api/opportunity-share` endpoint's `dominators` list returns `rec_yd_share: null` and `rec_td_share: null` for all 30 players. These fields should show what percentage of team receiving yards and receiving TDs the player accounts for.

## Evidence

```
Jonathan Taylor: DOM=85.4%, rec_yd%=None, rec_td%=None
Ashton Jeanty: DOM=84.4%, rec_yd%=None, rec_td%=None
Chase Brown: DOM=83.8%, rec_yd%=None, rec_td%=None
Bijan Robinson: DOM=69.4%, rec_yd%=None, rec_td%=None
```

All 30 dominator entries have null for both rec_yd_share and rec_td_share.

## Impact

- Dominator rating section is missing key breakdown data
- Users can't see whether a player's domination is from receiving, rushing, or both
- Makes the dominator panel less useful for dynasty evaluation (WR/TE dominator ratings depend on rec_yd_share)

## Likely cause

The query computing dominator ratings may not be joining receiving-specific team totals. The `dominator_rating` itself is populated (computed from overall production share), but the receiving-specific breakdowns are not being calculated.

## Fix

Check the SQL in `fetch_opportunity_share` — the rec_yd_share and rec_td_share computations may reference a table/column that doesn't exist or the join condition is wrong.
