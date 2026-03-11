# QA + UX Audit — Phases 36-40

**Date**: 2026-03-10
**Scope**: Phase 36 (player_season_stats fix), Phase 37 (adapter pipeline), Phase 38 (Athletic Radar), Phase 39 (critical bug fixes), Phase 40 (panel data coverage)

---

## QA FINDINGS

### CRITICAL-1: Wrong Column Names in `fetch_pace_tracker` SQL Query

**Severity**: CRITICAL
**File**: `backend/live_data/tools.py`, lines 737-742
**What's wrong**: Query references `s.pass_yards`, `s.pass_td`, `s.rush_yards`, `s.rush_td`, `s.rec_yards`, `s.rec_td` on `player_week_stats` table. Actual columns are `passing_yards`, `passing_tds`, `rushing_yards`, `rushing_tds`, `receiving_yards`, `receiving_tds`. SQLite silently returns NULL for non-existent columns, so all stat projections are zero.
**Fix**: Rename to correct column names.

### HIGH-1: XSS via `escapeHtml` in HTML Attribute Context

**Severity**: HIGH
**File**: `frontend/lab-prospect-radar.js`, line 163
**What's wrong**: `data-name` attribute uses `escapeHtml(p.player_name)` which doesn't escape double quotes. Should use `escapeAttr` for attribute contexts.
**Fix**: Change `escapeHtml` to `escapeAttr` in `data-name` attribute.

### MEDIUM-1: Redundant `import math` Inside Functions

**Severity**: MEDIUM
**File**: `backend/live_data/tools.py`, lines 1053 and 1980
**What's wrong**: `math` is already imported at module level. Inner imports are redundant.
**Fix**: Delete both `import math` lines.

### MEDIUM-2: 5 Panels Missing `available_seasons` + Frontend Hardcodes Years

**Severity**: MEDIUM
**Files**: `backend/live_data/tools.py` + `frontend/lab-panels.js`
**Panels**: Target Premium, Season Pace, Season Recap, TD Regression, Positional Advantage
**What's wrong**: Backend doesn't return `available_seasons`. Frontend generates season dropdown from `new Date().getFullYear()` down to 2020, showing 2025/2026 which have no data.
**Fix**: Add `available_seasons` to each backend function. Update frontend dropdowns.

### LOW-1: 1px Borders Still Present in Some Elements

**Severity**: LOW
**Files**: `frontend/styles.css` (lines 185, 731), `frontend/lab-panels.js` (lines 8522, 9029, 9560)
**What's wrong**: Design guide says "NO thin 1px borders". Small kbd elements and some inline styles still use 1px.
**Fix**: Change to 2px where visually appropriate.

---

## UX FINDINGS

### MEDIUM-3: Season Dropdowns Show Non-Existent Seasons (2025, 2026)

**Severity**: MEDIUM
**Panels**: Target Premium, Season Pace, Season Recap, TD Regression, Positional Advantage
**What's wrong**: Same root cause as MEDIUM-2. Users select 2025/2026 and get empty results with no explanation.
**Fix**: Use API-provided available_seasons (same fix as MEDIUM-2).

### LOW-2: Athletic Radar Lacks Cross-Year Season Comparison

**Severity**: LOW
**Panel**: proradar (Athletic Radar)
**What's wrong**: Only draft_year dropdown available. Can't easily compare combine metrics across historical years.
**Fix**: Low priority — current UX works for primary use case.

---

## Summary

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | QA | Wrong column names in pace tracker SQL — projections return 0 |
| 2 | HIGH | QA | XSS via escapeHtml in attribute context |
| 3 | MEDIUM | QA | Redundant import math (2 locations) |
| 4 | MEDIUM | QA/UX | 5 panels missing available_seasons, frontends hardcode years |
| 5 | LOW | QA | 1px borders in styles.css and inline styles |
| 6 | LOW | UX | Athletic Radar lacks cross-year comparison |
