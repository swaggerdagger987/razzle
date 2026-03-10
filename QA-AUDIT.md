# QA + UX Audit — Phases 126-129

**Date**: 2026-03-10
**Scope**: FPTS Breakdown (126), Handcuff Rankings (127), Weekly MVP Grid (128), Stack Correlation Finder (129)

## Findings

### QA-1: HIGH — get_db() should be get_conn() in 12 backend functions
- **File**: backend/live_data.py (lines 10216, 10372, 10457, 10545, 10717, 10787, 10908, 11005, 11164, 11263, 11356, 11410)
- **Issue**: All functions added since Phase 116 used `get_db()` which does not exist. The correct function is `get_conn()` (defined at line 101). This would cause NameError on all recent API endpoints.
- **Fix**: Replaced all 12 occurrences of `get_db()` with `get_conn()`
- **Status**: FIXED

## Passing Checks
- All 4 pages: escapeHtml on all dynamic content (16/12/8/11 calls)
- All 4 pages: fetch() resp.ok checks with .catch() error handlers
- All 4 pages: "pulling film..." loading states
- All 4 pages: PNG export with html2canvas + "razzle.lol" watermark
- All 4 pages: analytics pageview tracking
- All 4 pages: URL state preservation (season + position where applicable)
- All 4 pages: correct CSS vars, 3px borders, 4px 4px 0 box-shadows
- All 4 pages: responsive media queries (768px breakpoint)
- All 4 backend functions: fantasy_relevant = 1 filter present
- All 4 backend endpoints: try/except with logger.error()
- JS brace balance: fptsbreakdown 69/69, handcuffs 48/48, weeklymvp 51/51, stacks 55/55
- Position colors: QB=#5b7fff, RB=#2ec4b6, WR=#d97757, TE=#8b5cf6
- No XSS vulnerabilities
