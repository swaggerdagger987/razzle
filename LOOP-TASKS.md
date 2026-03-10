# Razzle Loop — Phase 71 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 66-70)

**Current Phase**: 71 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from phases 66-70 QA+UX audit resolved. Nav class fixed on 3 pages. Connection leak fixed. Unescaped values fixed. Prospect click flow fixed. Score tooltips added. Age badges standardized. Scarcity labels improved. Page differentiation clarified.

---

## Task 1: CRITICAL + HIGH QA fixes — nav class, connection leak, XSS
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) Fix `main-nav` to `topnav` on scarcity.html, breakouts.html, buysell.html — align nav HTML structure with rest of site (QA-H3, UX-H6). (2) Add try/finally to fetch_prospect_scores in live_data.py (QA-H1). (3) Escape all numeric API values in innerHTML on breakouts.html, buysell.html, scarcity.html (QA-H2).

## Task 2: CRITICAL UX fix — Prospects click navigates by name instead of ID
**Status**: PENDING
**Attempts**: 0
**Notes**: Change prospect card click handler to navigate to /player/{id} like every other page, instead of /lab.html?mode=prospects&search={name} (UX-C1). This requires the API response to include a player_id. Check if prospect data has IDs available.

## Task 3: HIGH UX fixes — tooltips, age badges, labels, page differentiation
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) Add tooltip to RBS label on breakouts.html: "Razzle Breakout Score — opportunity vs production gap" (UX-H1). (2) Add tooltip to RPS label on prospects.html: "Razzle Prospect Score — athleticism 60% + draft capital 30% + size 10%" (UX-H2). (3) Standardize age badges: use same thresholds on breakouts and buysell — young <=24, prime 25-27, aging 28+ (UX-H4). (4) Add "PPG" unit to scarcity summary drop-off values and differentiate middle card labels (UX-H3). (5) Clarify Breakouts subtitle vs Buy/Sell subtitle to explain difference (UX-H5).

## Task 4: MEDIUM fixes (grouped)
**Status**: PENDING
**Attempts**: 0
**Notes**: (1) Add LIMIT 500 safety cap to breakout and buy/sell SQL queries (QA-M1). (2) Add position validation in fetch_prospect_scores (QA-M2). (3) Add aria-label="Season" to select elements on scarcity, breakouts, buysell (QA-M3). (4) Add season badge to PNG export headers for temporal context (UX-M1).

## Task 5: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Notes**: Verify all CRITICAL and HIGH findings resolved. Python syntax valid. JS syntax valid. Nav class correct on all pages. No XSS vectors. Design checks pass.

---

## Loop State
```
Current Phase: 71
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
