---
id: S3-088
severity: S3
confidence: LOW
category: feature-request
source: BUG-005
status: OPEN
---

# Tiers panel only goes to 2024, missing S-tier players in 2015-2016

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Endpoint**: `backend/server.py:2941-2950` — `GET /api/tier-list`
**Handler**: `backend/live_data/dynasty.py:1418-1419` — `fetch_tier_list()` with caching
**Computation**: `dynasty.py:1327-1410` — `_fetch_tier_list_uncached()`

**Good news**: Historical age adjustment IS implemented at `dynasty.py:1368-1376`:
```python
current_year = _current_nfl_season()
age_offset = current_year - season if season and season < current_year else 0
age = (r[4] or 25) - age_offset  # Adjusted for historical season
```

**Remaining issue**: Tier thresholds (S=80+, A=65+, B=50+, C=35+, D=20+, F=<20) are static values that don't adapt to era-specific scoring distributions. Pre-2017 seasons had different PPG distributions, so the same trade value thresholds may produce skewed tier distributions (e.g., fewer S-tier players in 2015 when scoring was lower).

## Fix

1. Compute tier thresholds per-season using percentiles of that season's trade values (e.g., S = top 5%, A = 5-15%, etc.) instead of fixed cutoffs
2. Or limit tier display to 2017+ with a notice for earlier seasons
3. Age adjustment is already correct — no changes needed there

## Files

- `backend/live_data/dynasty.py:1327-1410` — tier computation with static thresholds
- `backend/live_data/dynasty.py:1368-1376` — age adjustment (already correct)
- `frontend/tiers.html` — tier display

## Acceptance Criteria

- Tiers render accurately for all available seasons (2015-2025)
- OR panel clearly indicates which seasons have reliable tier data
