# FUNC-063: Grade scale inconsistency across panels

**Severity**: P1
**Flow**: Cross-panel (Stock Watch, Report Card, Efficiency Rankings, Season Awards)
**File**: backend/live_data/dashboards.py
**Found**: Session 61 (2026-03-21)

## Problem

Three different `grade_from_percentile()` functions in dashboards.py use inconsistent grade scales:

1. **6-tier scale** (Efficiency Rankings line 172, Stock Watch line 803):
   - A+ (>=95), A (>=85), B (>=70), C (>=45), D (>=25), F (<25)

2. **8-tier scale** (Report Card line 1333, Season Awards line 1676):
   - A+ (>=95), A (>=85), B+ (>=75), B (>=65), C+ (>=50), C (>=35), D (>=25), F (<25)

## Impact

46 grade mismatches across 32 common players. Same player shows different grades depending on which panel a user views:

| Player | Metric | Stock Watch | Report Card |
|--------|--------|-------------|-------------|
| McCaffrey | efficiency | D | C |
| Bijan Robinson | efficiency | D | C |
| Bijan Robinson | consistency | B | A |
| Amon-Ra St. Brown | efficiency | B | B+ |
| Ja'Marr Chase | efficiency | C | B |

Some difference is expected from different player pools, but the B->B+ and C->C+ patterns are clearly from the different grade scales (no B+ or C+ exists in the 6-tier scale).

## Fix

Standardize on the 8-tier scale (A+/A/B+/B/C+/C/D/F) everywhere. Replace the 6-tier `grade_from_percentile` in Stock Watch (line 803) and Efficiency Rankings (line 172) with the 8-tier version.

Alternatively, extract a single `grade_from_percentile` at module level and use it everywhere.

## Verification

After fix: query both `/api/stock-watch` and `/api/report-cards` for the same player. Grades should match (allowing for player pool differences but not scale differences).
