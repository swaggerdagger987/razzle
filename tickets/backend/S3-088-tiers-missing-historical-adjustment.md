---
id: S3-088
severity: S3
confidence: LOW
category: feature-request
source: BUG-005
status: OPEN
---

# Tiers panel only goes to 2024, missing S-tier players in 2015-2016

## Root Cause

Tier thresholds (S/A/B/C/D/F based on trade value percentiles) may need era-adjustment for historical seasons where scoring distributions were different. The current thresholds are tuned for modern scoring which started shifting around 2017.

Pre-2017 seasons may have different player value distributions that don't map well to current tier breaks.

## Fix

Options:
1. Compute tier thresholds per-season based on that season's value distribution (percentile-based)
2. Apply era-adjustment multiplier for pre-2017 seasons
3. Limit tiers to 2017+ and show notice for earlier seasons

## Files

- Backend tier computation logic
- `frontend/tiers.html` — tier display

## Acceptance Criteria

- Tiers render accurately for all available seasons (2015-2025)
- OR panel clearly indicates which seasons have reliable tier data
