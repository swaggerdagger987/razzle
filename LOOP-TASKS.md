# Razzle Loop — Phase 91 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 86-90)

**Current Phase**: 91 — QA + UX Audit Fixes
**Exit Criterion**: All HIGH findings from QA-AUDIT.md (Phases 86-90) resolved. Position-filtered team totals use unfiltered aggregation for correct opp_share/dominator metrics. PNG export watermark overlay added to reportcard.html and awards.html. MEDIUM fixes applied: grade sort order, referrer field, promise catch. All fixes verified with Python syntax checks and JS structure validation.

---

## Task 1: HIGH fix — Position filter team totals (backend)
**Status**: PENDING
**Attempts**: 0
**Notes**: Fix fetch_opportunity_share, fetch_report_cards, and fetch_season_awards in live_data.py. Team totals must be computed from ALL positions (unfiltered), then the position filter applied only to the final player list. This ensures opp_share and dominator rating remain correct percentages of the full team.

## Task 2: HIGH fix — PNG export watermark overlay (frontend)
**Status**: PENDING
**Attempts**: 0
**Notes**: Add canvas watermark drawing (ctx.fillText('razzle.lol', ...)) to PNG export handlers in reportcard.html and awards.html. Match the pattern from stocks.html lines 700-704. Also fix awards.html toDataURL to include 'image/png' format.

## Task 3: MEDIUM fixes — Grade sort + analytics (frontend)
**Status**: PENDING
**Attempts**: 0
**Notes**: (a) Fix grade string sort in reportcard.html, stocks.html, opportunity.html: map grade strings to numeric values before comparison (A+=8, A=7, B+=6, B=5, C+=4, C=3, D=2, F=1). (b) Add referrer field to reportcard.html analytics POST. (c) Fix awards.html analytics to use .catch() instead of try/catch.

## Task 4: Smoke test
**Status**: PENDING
**Attempts**: 0
**Notes**: Python + JS syntax validation. Verify all fixes applied correctly. Design compliance check.

---

## Loop State
```
Current Phase: 91
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/4
```
