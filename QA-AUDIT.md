# QA + UX Audit — Phases 116-119

**Date**: 2026-03-10
**Scope**: Pace & Milestones (116), Game Log (117), Hot & Cold Streaks (118), Season Recap (119)

## Findings

### QA-1: MEDIUM — Quick-search missing fantasy_relevant filter
- **File**: backend/live_data.py (quick_search_players)
- **Issue**: The /api/players/quick-search endpoint used by gamelog and other search pages was missing `fantasy_relevant = 1` filter
- **Fix**: Added `AND p.fantasy_relevant = 1` to WHERE clause
- **Status**: FIXED

### QA-2: LOW — Numeric formatting in gamelog totals
- **File**: frontend/gamelog.html
- **Issue**: Totals row displays raw float sums that could show decimals for stats like pass_yd
- **Impact**: Minimal — integer stats sum to integers naturally
- **Status**: NO ACTION — acceptable behavior

### QA-3: LOW — Hardcoded status colors in pace milestones
- **File**: frontend/pace.html
- **Issue**: ON PACE/OFF PACE badges use hardcoded hex colors not in design system
- **Impact**: None — these are semantic status colors, consistent with other pages
- **Status**: NO ACTION — acceptable pattern

### QA-4: LOW — Streak window edge case undocumented
- **File**: backend/live_data.py (fetch_streaks)
- **Issue**: Players with fewer than window+2 games are filtered out silently
- **Impact**: Minimal — correct logic, users see fewer results for small windows
- **Status**: NO ACTION — correct behavior

## Passing Checks
- All 4 pages: escapeHtml on all dynamic content
- All 4 pages: fetch() resp.ok checks with error handlers
- All 4 pages: "pulling film..." loading states
- All 4 pages: PNG export with watermark
- All 4 pages: URL state persistence
- All 4 pages: analytics pageview tracking
- All 4 pages: responsive media queries
- All 4 backend functions: fantasy_relevant = 1 filter
- JS brace balance: pace 79/79, gamelog 120/120, streaks 68/68, recap 73/73
- Design compliance: correct fonts, colors, borders
- No XSS vulnerabilities
- No missing error handling
