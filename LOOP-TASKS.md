# Razzle Loop — Phase 66 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 61-65)

**Current Phase**: 66 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from QA-AUDIT.md resolved. fantasy_relevant column issue fixed. SQL injection pattern in fetch_stat_leaders replaced with parameterized queries. Connection leak fixed. trackPageview standardized. DVS label and methodology added to rankings page. Medium fixes applied.

---

## Task 1: CRITICAL — Fix fantasy_relevant column + SQL injection + connection leak
**Status**: PASS
**Attempts**: 1
**Notes**: (Q1) Check if fantasy_relevant column exists in nflverse_adapter.py schema. If not, either add it to migrate_add_columns or remove the filter from all queries in live_data.py. (Q2) Replace f-string position filter in fetch_stat_leaders with parameterized queries. (Q3) Fix connection leak: combine double connection into single session with try/finally. (Q5) Move seasons query before conn.close().

## Task 2: HIGH — Fix trackPageview + analytics standardization
**Status**: PASS
**Attempts**: 1
**Notes**: (Q4) Replace trackPageview calls in team.html and leaders.html with inline fetch pattern matching rankings.html. Or define trackPageview in app.js. Ensure all new pages (team, leaders, rankings) consistently track pageviews.

## Task 3: HIGH — Rankings DVS label + methodology explainer
**Status**: PASS
**Attempts**: 1
**Notes**: (U1, U3) Add "DVS" text label next to dynasty value number on rankings.html player cards. Add one-line methodology note near page header: "ranked by Dynasty Value Score (production x age curve)." Make the number meaningful for Reddit screenshots.

## Task 4: MEDIUM fixes — design borders, age badge consistency, profile overlay link, contextual back nav
**Status**: PENDING
**Attempts**: 0
**Notes**: (Q6) Change team.html age badge and group count borders from 1px to 2px. (U4) Standardize PPG label across team.html, rankings.html, player.js. (U5) Standardize age badge terminology to "Young/Prime/Aging" on both team.html and rankings.html. (U6) Add "View full profile" link in Lab profile overlay. (U7) Make player.js back link contextual based on referrer. (U8) Hide rate stat categories on leaders.html when "All" position filter is active.

## Task 5: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Notes**: Python syntax valid. JS syntax valid. All fixes verified against QA-AUDIT.md findings. No regressions.

---

## Loop State
```
Current Phase: 66
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
