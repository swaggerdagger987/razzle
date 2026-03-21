# FUNC-060: Stock Watch PPO null for 20/21 TEs — misleading efficiency grades

**Severity**: P2
**Flow**: 43 (VORP) / Stock Watch panel
**Found**: Session 55, 2026-03-21
**Status**: OPEN

## Summary

The Stock Watch endpoint requires > 50 opportunities (targets + carries) to compute PPO (Points Per Opportunity). TEs rarely have carries, so their only opportunities are targets. TEs with fewer than ~50 season targets get `ppo: null`, which triggers a 50th-percentile fallback in the stock score and always assigns "C" efficiency grade — regardless of actual efficiency.

## Impact

- **20 of 21 TEs** in the rising/falling stock lists have null PPO (95%)
- All affected TEs show efficiency_grade = "C" (the fallback)
- Stock score uses 50th percentile for the PPO component (25% weight), making it inaccurate
- A dynasty veteran sees a TE with great per-target efficiency still rated "C" and doesn't trust the tool
- Frontend displays ppo as "-" (safe), but the grade badge misleads

## Root Cause

`backend/live_data/dashboards.py:745-746`:
```python
else:
    opportunities = opps_d["targets"] + opps_d["carries"]
ppo = round(total_pts / opportunities, 2) if opportunities > 50 else None
```

TEs typically have 0 carries. A TE needs ~3 targets/game over 17 games to reach 51. Mid-tier or partial-season TEs (Ben Sinnott: 9 games, ~40 targets) fall below.

`dashboards.py:815`:
```python
ppo_pct = percentile_rank(p["ppo"], ppo_vals, n_ppo) if p["ppo"] is not None else 50
```
Null PPO → hard-coded 50th percentile → always "C" grade.

## Evidence

```
Ben Sinnott (TE, WAS): 9 GP, 3.16 PPG, ppo=None, efficiency_grade="C", stock_score=45
Rising stocks: 19/20 TEs have null ppo (95%)
Falling stocks: 1/1 TE has null ppo (100%)
```

## Fix

Use position-specific opportunity thresholds:
```python
OPP_THRESHOLD = {"QB": 50, "RB": 50, "WR": 40, "TE": 30}
threshold = OPP_THRESHOLD.get(pos, 50)
ppo = round(total_pts / opportunities, 2) if opportunities > threshold else None
```

This reflects that TEs accumulate fewer total opportunities than other positions but their per-opportunity efficiency is still meaningful at lower volumes.

## Verification

After fix:
```python
# Should show < 5 TEs with null ppo (instead of 20)
curl -s 'http://localhost:8000/api/stock-watch?season=2025' | python -c "
import json, sys
d = json.loads(sys.stdin.read())
for section in ['rising', 'falling']:
    nulls = sum(1 for p in d[section] if p['position'] == 'TE' and p['ppo'] is None)
    total = sum(1 for p in d[section] if p['position'] == 'TE')
    print(f'{section}: TE null ppo = {nulls}/{total}')
"
```
