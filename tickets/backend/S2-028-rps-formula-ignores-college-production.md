# S2-028: Prospects RPS formula ignores college production

**Severity**: S2 (Minor)
**Category**: football-accuracy
**Source**: Deep Audit 2026-03-28, finding S2-007

## Problem

The Razzle Prospect Score (RPS) weights athleticism 60%, draft capital 30%, and
size 10%. College production (stats like PPG, dominator rating, breakout age)
receives 0% weight. This overvalues raw athletes and undervalues productive
college players.

## Root Cause

- `backend/live_data/prospects.py:857-862` — RPS formula:
  ```python
  rps = athletic_avg * 0.6 + draft_capital * 0.3 + size_score * 0.1
  ```
  No production component at all.

- `backend/live_data/prospects.py:862` — Fallback when no combine data:
  `draft_capital * 0.5 + size_score * 0.2` (still no production)

- `frontend/prospects.html:374` — Methodology chip correctly states the weights
  but doesn't note the production omission

## Expected

Consider reweighting to include a production component:
- Athleticism: 40%
- Draft Capital: 25%
- Production: 25% (college PPG, dominator rating, or yards/touch)
- Size: 10%

Or at minimum, add a "Production Score" column alongside RPS so users can
factor it in manually.

## Fix

1. Add a production score component in `prospects.py` using existing CFB data
   (e.g., college yards/game, TDs/game from `player_college_stats` table)
2. Reweight RPS formula to include production
3. Update methodology chip in `frontend/prospects.html`

## Scope

- 2 files: `backend/live_data/prospects.py`, `frontend/prospects.html`
- Medium effort — need to query CFB data and normalize to 0-100 scale
