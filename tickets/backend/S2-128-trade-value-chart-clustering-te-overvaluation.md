---
id: S2-128
severity: S2
confidence: MEDIUM
category: football-accuracy
source: FUNC-003
status: OPEN
---

# Trade value chart top-25 clustering (90.7-95.8) and TE overvaluation

## Root Cause

`backend/live_data/core.py:857` — `compute_trade_value()` produces a narrow spread at the top of the value distribution. The log compression parameter `D` was adjusted from 30 → 50 (code fix exists in local branch) but has not been deployed.

**Issues:**
1. Top 25 players all land in tier 1 with values between 90.7-95.8 — too compressed to differentiate elite from merely good
2. TE overvaluation: 5 TEs in top 25 (was reduced to 2 after D=50 fix, but still present)
3. Low-GP players (8 games) ranked highly because production component uses totals not PPG

**Separate from S2-107** (which covers tier panel S-tier bloat). This ticket covers the trade value chart specifically.

## Fix

1. Deploy the existing D=50 log compression fix
2. Consider additional spread at the top: use `min(value * 1.05, 100)` stretch or logarithmic rescaling for top-20 players
3. Add minimum games-played filter (e.g., GP >= 10) to exclude low-volume players from top-50
4. Reduce TE positional scarcity bonus or cap it — TE premium shouldn't override production reality

## Files to Change

- `backend/live_data/core.py:857` — compute_trade_value() spread parameters

## Accept When

1. Top-4 players have spread > 2.0 points (not 0.5)
2. No more than 2 TEs in top 25
3. Players with < 10 GP excluded from top-50
4. Value distribution shows meaningful differentiation at every tier level
