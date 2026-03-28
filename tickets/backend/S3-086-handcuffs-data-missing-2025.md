---
id: S3-086
severity: S3
confidence: MEDIUM
category: data-gap
source: BUG-003
status: OPEN
---

# Handcuff Rankings panel has no data for 2025 season

## Root Cause

Handcuff data requires manual curation or a different data source — it is not auto-derivable from nflverse stats alone. The panel needs a curated mapping of RB1 to RB2 handcuff relationships per team.

Currently the Handcuff Rankings panel shows empty/no data for 2025.

## Fix

Options:
1. Curate handcuff mappings manually per team per season (e.g., JSON config file)
2. Derive heuristic from snap share + target share data (RB with highest share = starter, next = handcuff)
3. Show graceful empty state explaining data is not yet available for current season

## Files

- Backend endpoint serving handcuff data (needs investigation)
- `frontend/handcuffs.html` — panel display

## Acceptance Criteria

- Handcuff Rankings panel shows data for 2025 (either curated or heuristic)
- OR panel shows branded empty state explaining the gap
