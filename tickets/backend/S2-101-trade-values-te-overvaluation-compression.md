---
id: S2-101
severity: S2
confidence: HIGH
category: football-accuracy
source: functional-qa/flows.md flow #19 (P2 persists from S55)
status: OPEN
---

# Trade values TE overvaluation — top-30 compression

## Root Cause

`backend/live_data/core.py:821` — The TE scarcity multiplier (0.90) is too high relative to actual positional scarcity:

```python
_SCARCITY = {"QB": 0.85, "RB": 1.15, "WR": 1.0, "TE": 0.90}
```

Combined with the composite formula at `core.py:859` (production 50% + age 30% + scarcity 20%), TEs get nearly the same scarcity points (90) as WRs (100). This causes top-30 TE compression — too many TEs cluster near similar values despite the elite TE PPR threshold being only 14.0 PPG vs 18.0 for WR/RB (`core.py:818`).

Fantasy reality: elite TEs (Kelce, LaPorta, Andrews) are scarce and valuable, but the dropoff after TE5-TE8 is steep. The current formula treats TE12-TE30 as nearly interchangeable with WR equivalents, which no real dynasty manager would accept.

## Fix

Reduce TE scarcity multiplier from 0.90 to 0.70-0.75:

```python
_SCARCITY = {"QB": 0.85, "RB": 1.15, "WR": 1.0, "TE": 0.72}
```

This widens the gap between elite and replacement-level TEs while keeping the top 5-8 TEs correctly valued via their production component.

## Files to Change

- `backend/live_data/core.py:821` — adjust TE scarcity multiplier

## Accept When

1. Top-5 TEs (Kelce, LaPorta, Andrews, Bowers, Kittle) remain in the top 50 overall trade values
2. TE12-TE30 are clearly separated from equivalent-ranked WRs and RBs
3. No RB or WR trade values regress (only TE adjustment)

## Do NOT Touch

- Production or age components of the formula
- QB/RB/WR scarcity multipliers
