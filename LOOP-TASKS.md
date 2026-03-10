# Razzle Loop — Phase 56 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 51-55)

**Current Phase**: 56 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from the Phases 51-55 audit are resolved. XSS vulnerabilities patched. SQL column references fixed. Heat coloring has user-facing legend and proper universe handling.

---

## Task 1: XSS patches — escape all Sleeper API data in league-intel.html
**Status**: PASS
**Notes**: All Sleeper API values (league.name, p.name, p.team, userId, pos, league_id) now wrapped in escapeHtml()/escapeAttr(). Applied to league cards, roster rendering, and position badges.

## Task 2: Fix FILTER_COLUMN_MAP column names in live_data.py
**Status**: PASS
**Notes**: Changed pass_attempts to SUM(s.attempts) and total_tds to SUM(s.touchdowns) to match actual player_week_stats schema. No more runtime SQL errors on filter.

## Task 3: Heat coloring legend and universe handling
**Status**: PASS
**Notes**: Heat button tooltip expanded to explain per-position percentile scale (green = elite 90th+, red = below avg 10th-). Heat button now hidden in college/prospect modes where numeric data is sparse. Press H shortcut also noted.

## Task 4: MEDIUM fixes — Sleeper caching, borders, headshot fallback, formatTimeAgo
**Status**: PASS
**Notes**: Sleeper /players/nfl cached in module variable via getSleeperPlayers(). .profile-stat border 1px->2px. .roster-pos border 1.5px->2px. formatTimeAgo returns "just now" for <60s entries.

## Task 5: Deploy + smoke test
**Status**: PASS
**Notes**: All syntax checks pass (node -c, py_compile). 15 escapeHtml/escapeAttr calls in league-intel.html. FILTER_COLUMN_MAP matches DB schema. Heat button correctly hidden in non-NFL modes.

---

## Loop State
```
Current Phase: 56
Current Task: 5
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 5/5
```
