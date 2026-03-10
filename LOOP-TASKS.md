# Razzle Loop — Phase 56 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 51-55)

**Current Phase**: 56 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from the Phases 51-55 audit are resolved. XSS vulnerabilities patched. SQL column references fixed. Heat coloring has user-facing legend and proper universe handling.

---

## Task 1: XSS patches — escape all Sleeper API data in league-intel.html
**Status**: PENDING
**Acceptance Criteria**:
- All Sleeper API values (league.name, p.name, p.team, userId, pos, league_id) wrapped in escapeHtml() for innerHTML
- All values in onclick/attribute strings wrapped in escapeAttr()
- No unescaped external data in any innerHTML assignment

## Task 2: Fix FILTER_COLUMN_MAP column names in live_data.py
**Status**: PENDING
**Acceptance Criteria**:
- "pass_attempts" maps to "SUM(s.attempts)" (not SUM(s.pass_attempts))
- "total_tds" maps to "SUM(s.touchdowns)" (not SUM(s.total_tds))
- No runtime SQL errors when filtering by these keys

## Task 3: Heat coloring legend and universe handling
**Status**: PENDING
**Acceptance Criteria**:
- Heat button has tooltip explaining "Per-position percentile: green = elite, red = below average"
- Heat button hidden or disabled in college/prospect modes (sparse data)
- Visual legend strip near Heat button or as a tooltip

## Task 4: MEDIUM fixes — Sleeper caching, borders, headshot fallback
**Status**: PENDING
**Acceptance Criteria**:
- Sleeper /players/nfl response cached in module variable (not re-fetched per league)
- .profile-stat and .roster-pos borders changed from 1px to 2px
- Headshot img elements have CSS background color for seamless fallback
- formatTimeAgo returns "just now" for < 60 seconds

## Task 5: Deploy + smoke test
**Status**: PENDING
**Acceptance Criteria**:
- All syntax clean
- No XSS vectors in league-intel.html
- FILTER_COLUMN_MAP matches actual DB columns
- Heat coloring behaves correctly per universe

---

## Loop State
```
Current Phase: 56
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
