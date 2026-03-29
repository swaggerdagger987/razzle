---
id: S2-104
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa/flows.md flow #40 (P2: QBs absent, DTI=rush+rec not pass+rush)
status: OPEN
---

# Dual Threat Index excludes QBs — uses rush+rec instead of pass+rush

## Root Cause

`backend/live_data/tools.py:2359-2363` — DTI uses geometric mean of rushing and receiving yards per game:

```python
rush_component = max(rush_yd_pg, 0.1)
rec_component = max(rec_yd_pg, 0.1)
dti = math.sqrt(rush_component * rec_component)
```

The query at `tools.py:2328` fetches `rushing_yards, receiving_yards` for all positions. For QBs, `receiving_yards` is 0 or NULL, and `passing_yards` (their primary production) is not fetched. QBs like Lamar Jackson and Jalen Hurts — the most dual-threat players in football — are either absent or ranked impossibly low.

Fantasy reality: "dual threat QB" is the most common use of this phrase. A dual-threat index that excludes QBs is fundamentally broken.

## Fix

Modify the query to also fetch `passing_yards`, then split logic by position:

```python
if pos == "QB":
    rush_component = max(rush_yd_pg, 0.1)
    pass_component = max(pass_yd_pg, 0.1)
    dti = math.sqrt(rush_component * pass_component)
    total_yd_pg = pass_yd_pg + rush_yd_pg
else:
    rush_component = max(rush_yd_pg, 0.1)
    rec_component = max(rec_yd_pg, 0.1)
    dti = math.sqrt(rush_component * rec_component)
    total_yd_pg = rush_yd_pg + rec_yd_pg
```

## Files to Change

- `backend/live_data/tools.py` — dual threat function, around lines 2328-2363

## Accept When

1. Lamar Jackson, Jalen Hurts, Josh Allen appear in dual threat results
2. QBs use pass_yards + rush_yards for DTI calculation
3. RB/WR/TE dual threat calculations unchanged
4. Position filter still works correctly

## Do NOT Touch

- The geometric mean formula approach (it correctly rewards balance)
- RB/WR/TE calculation logic
- Frontend display logic
