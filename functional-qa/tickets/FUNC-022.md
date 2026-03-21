# FUNC-022: QB td_rate and fumble_rate broken in screener (position-agnostic formula)

**Severity**: P0 — "I just made a bad trade because of this tool"
**Flow**: 36 (Efficiency metrics)
**Found**: Session 26 (2026-03-20)
**Status**: OPEN

## Summary

The screener's `td_rate` and `fumble_rate` derived stats use position-agnostic formulas that are fundamentally broken for QBs. QBs can show `td_rate > 100%` (Stafford at 158.6% on prod), and `fumble_rate` is inflated because the denominator only uses rushing carries instead of all dropbacks.

## Root Cause

**td_rate** in `backend/live_data/core.py:258-263`:
```python
# TD Rate: total TDs / (carries + targets)
car = item.get("carries") or 0
tgt = item.get("targets") or 0
total_opps = car + tgt
tds = item.get("touchdowns") or 0
item["td_rate"] = round(tds / total_opps * 100, 1) if total_opps > 0 else None
```

For QBs:
- `touchdowns` = passing_tds + rushing_tds + receiving_tds (includes 40+ passing TDs)
- `carries` = rushing carries only (29 for Stafford)
- `targets` = 0 for QBs

Result: Stafford = 46 TDs / 29 carries = **158.6%**

**fumble_rate** in `backend/live_data/core.py:265-269`:
```python
# Fumble Rate: fumbles_lost / (carries + receptions)
rec = item.get("receptions") or 0
fl = item.get("fumbles_lost") or 0
touch_opps = car + rec
item["fumble_rate"] = round(fl / touch_opps * 100, 1) if touch_opps > 0 else None
```

For QBs: denominator = rushing carries + 0 receptions. Misses pass attempts and sacks.

## Affected Files

1. `backend/live_data/core.py:258-269` — screener derived stats (PRIMARY)
2. `backend/live_data/dashboards.py:118-133` — efficiency rankings (also broken, same formula in SQL at line 1956)
3. `backend/live_data/players.py:1010` — player profile season data
4. `backend/live_data/college.py:561` — college (may be fine, different stat model)
5. `backend/live_data/tools.py:459` — archetypes

## Already Correct (reference for fix)

`backend/live_data/analytics.py:909-919` has correct QB-specific formulas:
```python
if pos == "QB":
    td_rate = round((pass_tds / pass_att) * 100, 2) if pass_att > 0 else 0
```

## Prod Evidence

```
Stafford: td_rate=158.6%, fumble_rate=10.3%  (29 carries, 597 attempts)
Allen: td_rate=34.8%  (112 carries, 460 attempts)
Maye: td_rate=33.7%  (103 carries, 492 attempts)
```

## Fix

For QBs, use position-specific formulas:
- `td_rate` = `passing_tds / attempts * 100` (passing TD rate, the standard QB metric)
- `fumble_rate` = `fumbles_lost / (carries + attempts + sacks_taken) * 100` (total dropbacks + rushes)

For non-QBs, keep existing formulas:
- `td_rate` = `touchdowns / (carries + targets) * 100`
- `fumble_rate` = `fumbles_lost / (carries + receptions) * 100`

Must check `item.get("position")` to branch. The `position` field is available in all contexts where `_enrich_derived_stats` runs.

## Related

- FUNC-021: Efficiency Rankings PPO also broken for QBs (same root cause — `opportunities = targets + carries` ignores pass attempts)
