# QA + UX Audit — Phases 96-99

**Date**: 2026-03-10
**Phases audited**: 96 (Tools Hub), 97 (Roster Builder), 98 (Scoring Format), 99 (Draft Cheat Sheet)

---

## QA FINDINGS

### QA-1: Roster-grade player_ids not deduplicated or type-validated (HIGH)
- **File**: backend/server.py line 1344, backend/live_data.py line 8442
- **Issue**: POST /api/roster-grade accepts player_ids without validating each element is a string or deduplicating. Sending same ID 25 times creates a 25-player roster of one player.
- **Fix**: Validate each ID is a string, deduplicate with set(), then slice to 25.

### QA-2: Inconsistent standard scoring formula between scoring-comparison and cheat-sheet (HIGH)
- **File**: backend/live_data.py lines 8609 vs 8751
- **Issue**: scoring-comparison uses COALESCE(fantasy_points_std, ppr - receptions) in SQL. cheat-sheet fetches PPR then subtracts receptions in Python. Could produce different results.
- **Fix**: Use same formula in both — prefer Python-based (ppr - receptions) for consistency.

### QA-3: Missing escapeHtml on numeric values in scoring.html (MEDIUM)
- **File**: frontend/scoring.html lines 524-525
- **Issue**: rank_ppr and rank_std rendered directly without escapeHtml.
- **Fix**: Wrap in escapeHtml(String(...)).

### QA-4: Missing escapeHtml on age in rosterbuilder.html (MEDIUM)
- **File**: frontend/rosterbuilder.html line 746
- **Issue**: p.age rendered directly: (p.age || '-').
- **Fix**: Use escapeHtml(String(p.age || '-')).

### QA-5: Missing escapeHtml on rank in cheatsheet.html (MEDIUM)
- **File**: frontend/cheatsheet.html line 473
- **Issue**: p.rank rendered without escapeHtml.
- **Fix**: Use escapeHtml(String(p.rank)).

### QA-6: tools-hub endpoint missing Cache-Control header (MEDIUM)
- **File**: backend/server.py line 1356
- **Issue**: Static data endpoint returns full response on every request with no caching.
- **Fix**: Return JSONResponse with Cache-Control: public, max-age=3600.

### QA-7: Boom/Bust link in tools-hub points to /compare.html (LOW)
- **File**: backend/server.py line 1395
- **Issue**: Boom/Bust tool entry links to compare.html which is the Player Comparison page.
- **Fix**: Update tool name to "Player Comparison" or fix URL.

### QA-8: import math inside function body in fetch_roster_grade (LOW)
- **File**: backend/live_data.py line 8509
- **Issue**: Redundant import — math is already imported at module top.
- **Fix**: Remove the inner import.

### QA-9: No per-position LIMIT on cheat sheet query (LOW)
- **File**: backend/live_data.py line 8733
- **Issue**: All qualifying players returned per position. A printable cheat sheet showing 100+ WRs is excessive.
- **Fix**: Limit to top 40 per position in Python.

---

## UX FINDINGS

### UX-1: Nav has 34 links — overwhelming for new users (MEDIUM)
- **Issue**: The nav bar now contains 34 links. Tools Hub page helps discoverability, but nav itself is a wall of text.
- **Fix**: Logged for future structural redesign (nav dropdown grouping). Not tasked for immediate fix.

### UX-2: Roster Builder dimension bars lack tooltips (LOW)
- **Issue**: The 4 dimension bars (Trade Value, VORP, Age Balance, Positional Depth) lack explanation of what they measure.
- **Fix**: Add title attributes with brief explanations.

### UX-3: Cheat sheet tier thresholds are position-agnostic (LOW)
- **Issue**: Fixed PPG thresholds (20/15/10/5) mean QBs are mostly "Elite" and TEs mostly "Bench." Position-relative thresholds would be more useful.
- **Fix**: Logged for future enhancement.

---

**Summary**: 2 HIGH, 4 MEDIUM, 5 LOW. No CRITICALs.
