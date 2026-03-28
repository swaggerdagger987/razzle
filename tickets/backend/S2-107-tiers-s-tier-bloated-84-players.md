---
id: S2-107
severity: S2
confidence: MEDIUM
category: football-accuracy
source: functional-qa/flows.md flow #21 (P2: S-tier still bloated, 84 players)
status: OPEN
---

# Tiers panel S-tier has 84 players — should be elite-only (10-15)

## Root Cause

The tier assignment thresholds in the backend are too generous for S-tier. The current trade value threshold at `backend/live_data/core.py:818` defines elite PPR at 18.0 PPG. The tier break at the S-tier level (likely trade_value >= 80) captures too many players because the production component (50% weight) distributes values broadly.

With 84 players in S-tier, the label loses meaning. In real dynasty leagues, "S-tier" means untouchable — that's 10-15 players, not 84.

## Fix

Raise the S-tier threshold from its current value (likely 80) to approximately 90-92, which should limit S-tier to the top 10-15 dynasty assets. The existing tier breaks (`tiers.html` or backend tier assignment):

Current likely thresholds: S(80+) / A(65+) / B(50+) / C(35+) / D(20+) / F(<20)
Proposed: S(92+) / A(75+) / B(55+) / C(35+) / D(20+) / F(<20)

Check the exact threshold in the backend tier assignment function and adjust.

## Files to Change

- `backend/live_data/core.py` or `backend/live_data/dynasty.py` — tier threshold constants

## Accept When

1. S-tier contains 10-20 players max
2. A-tier contains ~30-50 players
3. All 4 positions represented in S-tier (not just RBs)
4. Players at S-tier cutoff are genuinely elite dynasty assets (top-5 at position)

## Do NOT Touch

- D/F tier thresholds (these are fine for replacement-level)
- The trade value composite formula
- Frontend tier display logic
