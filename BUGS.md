# Razzle — Bug Tracker

> Test locally at http://localhost:8000/lab.html
> When ready, move confirmed bugs into TICKETS.md for the loop to fix.

---

## BUG-001: NFL screener shows only 2024 data regardless of year selected
**Severity**: CRITICAL
**Screen**: Main Table (NFL)
**Steps**: Select any year (2015, 2016, etc.) — still shows 2024 players (Ja'Marr Chase etc.)
**Expected**: Each year should show players/stats from that actual season
**Root cause**: Likely backend query ignoring season filter, or frontend not sending season param correctly

## BUG-002: NFL/College toggle doesn't switch without changing year
**Severity**: CRITICAL
**Screen**: Main Table — universe toggle
**Steps**: Click NFL, then click College (or vice versa) — nothing happens. Must change the year dropdown to force a re-fetch.
**Expected**: Clicking NFL/College/Prospects should immediately re-fetch and render the correct data

## BUG-003: No Handcuff Rankings data in 2025
**Severity**: MEDIUM
**Screen**: Handcuff Rankings panel
**Steps**: Open Handcuff Rankings, select 2025 — empty
**Expected**: Should show current handcuff rankings for the upcoming season (or latest available)

## BUG-004: Dynasty Rankings missing historical end-of-season valuations
**Severity**: MEDIUM
**Screen**: Dynasty Rankings panel
**Steps**: Open Dynasty Rankings — no historical tier snapshots per season
**Expected**: Should show how dynasty values looked at the end of each season (like Tiers panel does), allowing year-over-year comparison

## BUG-005: Tiers panel only goes to 2024, missing S-tier players in 2015-2016
**Severity**: MEDIUM
**Screen**: Tiers panel
**Steps**: Select 2015 or 2016 — no S-tier players appear
**Expected**: Elite performers (Antonio Brown, Julio Jones, David Johnson, etc.) should be S-tier in those years. Tiers should also include 2025 data.

## BUG-006: Trade Values page doesn't update values / formula not adjustable
**Severity**: MEDIUM
**Screen**: Trade Values panel
**Steps**: Open Trade Values — values are static, no way to adjust the valuation formula
**Expected**: User should be able to tweak weights/formula inputs and see trade values recalculate live

## BUG-007: VORP panel missing player search — inconsistent with Trade Values design
**Severity**: LOW
**Screen**: VORP panel
**Steps**: Open VORP — no search bar to find specific players
**Expected**: VORP should have the same search-for-names pattern as Trade Values. All rankings/values panels should share a consistent layout (search bar, position filter, sortable table).

## BUG-008: Rankings & Values panels have inconsistent design
**Severity**: LOW
**Screen**: All ranking/value panels (Dynasty Rankings, Trade Values, VORP, Tiers, etc.)
**Steps**: Compare layouts across panels — each looks different
**Expected**: Consistent design pattern across all ranking panels: search bar, position filter chips, sortable table, same card style

## BUG-009: Half PPR doesn't work on Cheat Sheet
**Severity**: MEDIUM
**Screen**: Cheat Sheet panel
**Steps**: Select Half PPR scoring — values don't change or display incorrectly
**Expected**: Cheat Sheet should recalculate all values using half-PPR scoring (0.5 per reception)

## BUG-010: Efficiency Rankings only has data through 2024
**Severity**: MEDIUM
**Screen**: Efficiency Rankings panel
**Steps**: No 2025 season available
**Expected**: Should include 2025 data (or latest available season)

## BUG-011: Consistency Rankings only has data through 2024
**Severity**: MEDIUM
**Screen**: Consistency Rankings panel
**Steps**: No 2025 season available
**Expected**: Should include 2025 data

## BUG-012: Snap Efficiency only works 2020-2024
**Severity**: MEDIUM
**Screen**: Snap Efficiency panel
**Steps**: Select years outside 2020-2024 — empty or broken
**Expected**: Should work for all available years (2015-2025)

## BUG-013: Dual Threat Index only works 2020-2024
**Severity**: MEDIUM
**Screen**: Dual Threat Index panel
**Steps**: Select years outside 2020-2024 — empty or broken
**Expected**: Should work for all available years

## BUG-014: Workload Monitor only works 2020-2024
**Severity**: MEDIUM
**Screen**: Workload Monitor panel
**Steps**: Select years outside 2020-2024 — empty or broken
**Expected**: Should work for all available years

## BUG-015: Target Premium completely broken
**Severity**: CRITICAL
**Screen**: Target Premium panel
**Steps**: Open panel — doesn't load or displays errors
**Expected**: Should show target premium rankings for all years

## BUG-016: Drop Rate completely broken
**Severity**: CRITICAL
**Screen**: Drop Rate Dashboard panel
**Steps**: Open panel — doesn't load or displays errors
**Expected**: Should show drop rate data for all years

## BUG-017: Garbage Time barely works
**Severity**: HIGH
**Screen**: Garbage Time Detector panel
**Steps**: Open panel — partial/broken data
**Expected**: Should identify garbage time stats reliably across all seasons

## BUG-018: Matchups panel broken
**Severity**: CRITICAL
**Screen**: Matchup Heatmap panel
**Steps**: Open panel — doesn't work
**Expected**: Should show DEF points allowed heatmap by position/week

## BUG-019: Stacks doesn't work for 2025 and 2026
**Severity**: MEDIUM
**Screen**: Stack Correlation Finder panel
**Steps**: Select 2025 or 2026 — empty
**Expected**: Should show stack correlations for current/upcoming seasons

## BUG-020: Red Zone missing years
**Severity**: MEDIUM
**Screen**: Red Zone Usage panel
**Steps**: Some years unavailable or empty
**Expected**: Should have red zone data for all available seasons (2015-2025)

## BUG-021: Streaks missing 2025 and 2026
**Severity**: MEDIUM
**Screen**: Streaks panel
**Steps**: Select 2025 or 2026 — empty
**Expected**: Should show streak data for current/upcoming seasons

## BUG-022: Gamescript completely broken
**Severity**: CRITICAL
**Screen**: Gamescript Analysis panel
**Steps**: Open panel — doesn't load or errors out
**Expected**: Should show gamescript splits (ahead/behind/close) for all seasons

---
