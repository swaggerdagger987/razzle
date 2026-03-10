# QA + UX Audit — Phase 5: College Football Integration

**Date**: 2026-03-10
**Scope**: Phase 5 Tasks 1-8 (NFL/College universe toggle, college endpoints, panel wiring, season expansion)

---

## QA FINDINGS

### QA-1 — HIGH: DB connection leak in fetch_college_player_profile
**File**: `backend/live_data.py`, lines 2319-2418
**Issue**: Uses bare `conn.close()` without `try/finally`. If any query raises an exception, the connection leaks.
**Fix**: Wrap function body in `try: ... finally: conn.close()`.

### QA-2 — HIGH: College panels default to season 2024 instead of latest available
**File**: `frontend/lab-panels.js`, lines 6345, 6778, 7058, 7618
**Issue**: `seasonOptions(awCollege ? 2024 : 2025)` hardcodes 2024 for college even though 2025 data exists.
**Fix**: Change college default to 2025.

### QA-3 — HIGH: Usage Trends and Year-over-Year both call same /api/college/trends
**File**: `frontend/lab-panels.js`, lines ~3991 and ~4178
**Issue**: Both panels hit `/api/college/trends` in college mode, rendering identical data. YoY hides its controls, becoming a duplicate.
**Fix**: Add YoY to NFL_ONLY_MESSAGES or wire to dedicated endpoint.

### QA-4 — MEDIUM: Combine/draft name matching strips spaces only, not punctuation
**File**: `backend/live_data.py`, lines 2374-2408
**Issue**: `fetch_college_player_profile` uses `.replace(" ", "")` for name matching vs adapter's `normalize_name()` which strips all non-alpha.

### QA-5 — MEDIUM: fetch_college_season_recap shows blank body for empty seasons
**File**: `backend/live_data.py`, lines 4087-4121
**Issue**: No early return for empty season_rows — panel renders blank with no empty-state message.

### QA-6 — MEDIUM: fetch_college_aging_curves has no LIMIT on full table scan
**File**: `backend/live_data.py`, lines 3798-3808
**Issue**: Queries all 31K+ cfb rows with only `games >= 3` filter.

### QA-7 — LOW: .college-mode CSS in inline style in lab.html, not lab-panels.css
### QA-8 — LOW: /api/college/streaks endpoint unreachable from frontend
### QA-9 — LOW: f-string HAVING clause in fetch_college_leaders
### QA-10 — LOW: render.yaml adapter chain uses && — one failure kills all college data

---

## UX FINDINGS

### UX-1 — CRITICAL: 12 panels silently serve NFL data in college mode
**Panels**: buysell, drops, garbagetime, matchups, stacks, redzone, streaks, weeklymvp, playoffs, pace, tdregression, airyards
**Issue**: No `showNflOnlyMsg` guard. User sees NFL data with no indication they're in wrong universe.

### UX-2 — CRITICAL: NFL-only panels have no clickable "switch to NFL" button
**File**: `frontend/lab-panels.js`, showNflOnlyMsg function
**Issue**: Message says "switch to NFL" as plain text. No interactive element.

### UX-3 — HIGH: Sidebar has no visual distinction between college-enabled and NFL-only panels
**Issue**: All 60+ sidebar items look identical in college mode. No dimming or indicators.

### UX-4 — HIGH: YoY panel silently degrades in college mode
**Issue**: Drops all controls (season selectors, metric selector) without explanation. Same data as Usage Trends.

### UX-5 — HIGH: Sidebar labels mismatch panel titles in college mode
**Panels**: "Snap Efficiency" -> "Touch Efficiency", "Aging Curves" -> "College Experience Curves"

### UX-6 — HIGH: Rankings & Tiers silently serve NFL dynasty data in college mode
**Panels**: rankings, tiers — no isCollege check, render NFL data without warning.

### UX-7 — MEDIUM: "school" vs "team" terminology inconsistent across college panels
### UX-8 — MEDIUM: Conference abbreviations unexplained (CUSA, MWC, etc.)
### UX-9 — MEDIUM: Dual-Threat and Target Premium have no college handling

### UX-10 — LOW: Universe bar label hidden on mobile
### UX-11 — LOW: "Fantasy Only" toggle visible and confusing in college mode
### UX-12 — LOW: Football emoji on NFL-only message is generic, not Razzle-branded
### UX-13 — LOW: Game Log has no college gate — silently fails
### UX-14 — LOW: Player Tools category (9 panels) has no college awareness
