# Razzle Loop — Phase 71 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 66-70)

**Current Phase**: 71 — QA + UX Audit Fixes
**Exit Criterion**: All CRITICAL and HIGH findings from phases 66-70 QA+UX audit resolved. Nav class fixed on 3 pages. Connection leak fixed. Unescaped values fixed. Prospect click flow improved. Score tooltips added. Age badges standardized. Scarcity labels improved. Page differentiation clarified.

---

## Task 1: CRITICAL + HIGH QA fixes — nav class, connection leak, XSS
**Status**: PASS
**Attempts**: 1
**Notes**: (1) Fixed `main-nav` to `topnav` with tiger logo on scarcity.html, breakouts.html, buysell.html — now matches all other pages. (2) Wrapped fetch_prospect_scores in try/finally for connection safety. (3) All numeric API values in breakouts, buysell, scarcity now wrapped in escapeHtml(String()) or parseFloat() for CSS.

## Task 2: CRITICAL UX fix — Prospects click navigation
**Status**: PASS
**Attempts**: 1
**Notes**: Prospect cards are combine data without NFL player IDs — navigating to Lab search by name IS the correct pattern. Improved by also passing position filter in URL. Full /player/{id} not possible for college-only prospects.

## Task 3: HIGH UX fixes — tooltips, age badges, labels, page differentiation
**Status**: PASS
**Attempts**: 1
**Notes**: (1) RBS tooltip added to breakouts: "Razzle Breakout Score — measures opportunity vs production gap". (2) RPS tooltip added to prospects: "Razzle Prospect Score — athleticism 60% + draft capital 30% + size 10%". (3) Breakouts age badges standardized: young <=24, prime 25-27, aging 28+ (was <=26 prime). Now matches buysell. (4) Scarcity summary: added "PPG" unit label, middle cards now show "#2 scarcity" / "#3 scarcity" instead of generic "drop-off". (5) Subtitles differentiated: Breakouts = "opportunity outpacing production — volume-based, not efficiency", Buy/Sell = "efficiency vs dynasty ranking — who's mispriced?"

## Task 4: MEDIUM fixes (grouped)
**Status**: PASS
**Attempts**: 1
**Notes**: (1) LIMIT 500 safety cap added to breakout and buy/sell SQL queries. (2) Position validation added to /api/prospect-scores endpoint — whitelist check for valid positions. (3) aria-label="Season" added to season selects on scarcity, breakouts, buysell.

## Task 5: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid. JS syntax valid on all 4 modified pages. 0 main-nav references remaining. All topnav pages consistent. All escapeHtml wrapping verified. Tooltips present. Age badges standardized. LIMIT 500 on both queries. Position validation in place. aria-labels on all 3 selects.

---

## Loop State
```
Current Phase: 71
Current Task: 5
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 5/5
```
