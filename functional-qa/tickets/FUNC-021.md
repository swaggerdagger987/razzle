# FUNC-021: Efficiency Rankings PPO metric broken for QBs

**Severity**: P0 — "I just made a bad trade because of this tool"
**Flow**: 36 (Efficiency metrics)
**Found**: Session 25 (2026-03-20)
**Status**: OPEN (confirmed still live on prod as of Session 26)

## Summary

The Efficiency Rankings panel's PPO (Points Per Opportunity) metric is fundamentally broken for QBs. `opportunities = targets + carries` ignores pass attempts entirely, making QBs appear 3-6x more efficient than all other positions. The top 10 "most efficient" players are ALL QBs, every one graded A+.

## Prod Evidence (Session 26, 2026-03-20)

```
=== most_efficient top 10 (ALL QBs) ===
Dak Prescott (QB): PPO=5.92, opps=53  ← 53 = just rushing carries
Baker Mayfield (QB): PPO=4.94, opps=55
Patrick Mahomes (QB): PPO=4.40, opps=65
Trevor Lawrence (QB): PPO=4.12, opps=82
Bryce Young (QB): PPO=4.04, opps=54
Caleb Williams (QB): PPO=4.03, opps=79
Bo Nix (QB): PPO=3.63, opps=84
Justin Herbert (QB): PPO=3.46, opps=83
Drake Maye (QB): PPO=3.38, opps=104
Josh Allen (QB): PPO=3.26, opps=112

=== volume_kings (RBs, correct) ===
McCaffrey: PPO=0.95, opps=440  ← 440 = carries + targets (correct)
```

## Root Cause

`backend/live_data/dashboards.py:118-119`:
```python
# Opportunities = targets + carries (for QBs: attempts/carries)
opportunities = targets + carries  # <-- comment says "attempts/carries" but code ignores attempts
```

The comment acknowledges the QB issue but the code never branches on position.

## Fix

```python
if pos == "QB":
    opportunities = carries + (pass_att or 0)  # rushing carries + pass attempts
else:
    opportunities = targets + carries
```

Also fix `td_rate` on line 133 (same formula used for QBs):
```python
td_rate = round(total_tds / touches * 100, 1) if touches > 0 else 0
```
For QBs, should be `pass_tds / pass_att * 100`.

## Also fix the SQL version

`dashboards.py:1956` has the same broken formula in SQL:
```python
"td_rate": ("CASE WHEN (SUM(s.carries) + SUM(s.targets)) > 0 THEN SUM(s.touchdowns) * 100.0 / (SUM(s.carries) + SUM(s.targets)) ELSE NULL END", "TD Rate"),
```

## Related

- FUNC-022: Same root cause affecting screener td_rate/fumble_rate in core.py
