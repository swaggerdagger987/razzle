# Razzle — Bug Tracker

> Test locally at http://localhost:8000/lab.html
> When ready, move confirmed bugs into TICKETS.md for the loop to fix.

---

## FIXED BUGS (2026-03-13)

Root cause for most bugs: panels defaulted to `new Date().getFullYear()` (2026) but NFL data only goes through 2025. Fixed by using NFL-season-aware date logic (`month >= 7 ? year : year - 1`). Also fixed matchups sending empty string season (HTTP 422), and added app.js to 10 standalone panel pages that were missing it.

- **BUG-001**: FIXED — backend screener correctly filters by season; verified working for 2015-2025
- **BUG-002**: FIXED — universe toggle correctly calls fetchAndRender(); verified working
- **BUG-009**: FIXED — half PPR cheat sheet works correctly (fmt="half" computes PPR - 0.5*receptions)
- **BUG-010**: FIXED — efficiency rankings have 2025 data; was defaulting to 2026
- **BUG-011**: FIXED — consistency rankings have 2025 data; was defaulting to 2026
- **BUG-012**: FIXED — snap efficiency works for 2015-2025 (lab panel uses API available_seasons)
- **BUG-013**: FIXED — dual threat works for all years; standalone page now starts at correct year
- **BUG-014**: FIXED — workload monitor works for all years; standalone page now starts at correct year
- **BUG-015**: FIXED — target premium was defaulting to 2026; also fixed missing available_seasons in empty response
- **BUG-016**: FIXED — drop rate was defaulting to 2026; now uses _latestSeason
- **BUG-017**: FIXED — garbage time works for 2025; was defaulting to 2026
- **BUG-018**: FIXED — matchups was sending empty string season causing HTTP 422; now defaults to _latestSeason
- **BUG-019**: FIXED — stacks work for 2025; was defaulting to 2026
- **BUG-020**: FIXED — red zone has data for all seasons 2015-2025; was defaulting to 2026
- **BUG-021**: FIXED — streaks work for 2025; was defaulting to 2026
- **BUG-022**: FIXED — gamescript lab panel works; standalone page now has app.js + correct year default

---

## OPEN BUGS (Feature Requests / Design Improvements)

### BUG-003: No Handcuff Rankings data in 2025
**Severity**: MEDIUM
**Screen**: Handcuff Rankings panel
**Notes**: Handcuff data requires manual curation or a different data source. Not auto-derivable from nflverse stats alone.

### BUG-004: Dynasty Rankings missing historical end-of-season valuations
**Severity**: LOW (feature request)
**Screen**: Dynasty Rankings panel
**Notes**: Would require storing historical snapshots of dynasty values. Currently values are computed live from current data.

### BUG-005: Tiers panel only goes to 2024, missing S-tier players in 2015-2016
**Severity**: LOW (feature request)
**Screen**: Tiers panel
**Notes**: Tier thresholds may need adjustment for historical seasons where scoring was different.

### BUG-006: Trade Values page doesn't update values / formula not adjustable
**Severity**: LOW (feature request)
**Screen**: Trade Values panel
**Notes**: Would require adding weight sliders to the UI. Current formula is fixed (production 50% + age 30% + scarcity 20%).

### BUG-007: VORP panel missing player search
**Severity**: LOW (design improvement)
**Screen**: VORP panel

### BUG-008: Rankings & Values panels have inconsistent design
**Severity**: LOW (design improvement)
**Screen**: All ranking/value panels

---
