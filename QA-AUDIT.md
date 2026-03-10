# QA + UX Audit — Phases 111-114

**Date**: 2026-03-10
**Scope**: TD Regression (111), Player Strengths (112), Points Breakdown (113), Weekly Leaders (114)

---

## Findings

### QA-1 (MEDIUM): TD Regression missing fantasy_relevant filter
**File**: `backend/live_data.py` — `fetch_td_regression()`
**Issue**: Query does not filter by `p.fantasy_relevant = 1`. Non-relevant players (practice squad, low-usage) are included in the position average TD rate calculation, potentially skewing the averages.
**Fix**: Add `AND p.fantasy_relevant = 1` to the WHERE clause.

### QA-2 (LOW): Weekly Leaders stat cells not escaped
**File**: `frontend/weeklyleaders.html` — lines 599-606
**Issue**: Numeric stat values inserted without `escapeHtml()`. Low XSS risk (integers from own DB) but inconsistent with codebase pattern.
**Fix**: Wrap each stat output in `escapeHtml(String(...))`.

### QA-3 (LOW): Strengths page search "Loading..." on URL init
**File**: `frontend/strengths.html`
**Issue**: When loading from URL state, search input shows "Loading..." until fetch completes. Minor UX — same pattern used across all search pages.
**Fix**: No action.

### QA-4 (LOW): Weekly Leaders season change resets week to 0
**File**: `frontend/weeklyleaders.html`
**Issue**: Changing seasons sets `currentWeek = 0` which shows latest week. Correct behavior.
**Fix**: No action.

---

## Summary

| # | Severity | Description | Action |
|---|----------|-------------|--------|
| 1 | MEDIUM | TD regression missing fantasy_relevant filter | Fix |
| 2 | LOW | Weekly leaders stat cells not escaped | Fix |
| 3 | LOW | Search "Loading..." on URL init | No action |
| 4 | LOW | Season change resets week | No action |

**Verdict**: 1 MEDIUM, 3 LOW. Fix QA-1 and QA-2.
