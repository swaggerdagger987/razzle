# Razzle Loop — Phase 91 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 86-90)

**Current Phase**: 91 — QA + UX Audit Fixes
**Exit Criterion**: All HIGH findings from QA-AUDIT.md (Phases 86-90) resolved. Position-filtered team totals use unfiltered aggregation for correct opp_share/dominator metrics. PNG export watermark overlay added to reportcard.html and awards.html. MEDIUM fixes applied: grade sort order, referrer field, promise catch. All fixes verified with Python syntax checks and JS structure validation.

---

## Task 1: HIGH fix — Position filter team totals (backend)
**Status**: PASS
**Attempts**: 1
**Notes**: Fixed fetch_opportunity_share, fetch_report_cards, and fetch_season_awards in live_data.py. Added separate unfiltered SQL query for team totals (GROUP BY p.team, all positions). Removed in-loop team_totals accumulation from filtered rows. 3/3 functions fixed. Python syntax valid.

## Task 2: HIGH fix — PNG export watermark overlay (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: Added canvas watermark drawing (ctx.fillText('razzle.lol', ...)) to PNG export handlers in reportcard.html and awards.html. Also fixed awards.html toDataURL to include 'image/png' format. Both files now match stocks.html pattern.

## Task 3: MEDIUM fixes — Grade sort + analytics (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: (a) Added GRADE_ORDER map to sortPlayers in reportcard.html, stocks.html, opportunity.html — grade strings now sort numerically (A+=8 > A=7 > B+=6 > B=5 > C+=4 > C=3 > D=2 > F=1). (b) Added referrer field to reportcard.html analytics POST. (c) Fixed awards.html analytics from try/catch to .catch().

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py + server.py). JS structure balanced in all 4 files (reportcard 266/266, awards 166/166, stocks 293/293, opportunity 277/277). 3 unfiltered team totals queries confirmed. 0 in-loop team_totals accumulations confirmed. GRADE_ORDER present in 3 table-based pages. Watermark fillText present in all 4 files. .catch() present in all 4 files.

---

## Loop State
```
Current Phase: 91
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
