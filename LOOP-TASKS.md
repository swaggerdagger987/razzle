# Razzle Loop — Phase 98 Task List

> Scoring Format Comparison — PPR vs Half-PPR vs Standard ranking shifts

**Current Phase**: 98 — Scoring Format Comparison
**Exit Criterion**: /scoring.html page shows how player rankings shift across PPR, Half-PPR, and Standard scoring formats.

---

## Task 1: Backend /api/scoring-comparison endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/scoring-comparison returns risers (rank higher in PPR than Standard) and fallers (rank lower in PPR). Each player: ppg_ppr, ppg_half, ppg_std, rank_ppr, rank_half, rank_std, rank_diff. Min 6 games + 2 PPG. Season + position params.

## Task 2: Scoring Format page (frontend/scoring.html)
**Status**: PASS
**Attempts**: 1
**Notes**: Two sections (PPR Risers + PPR Fallers), sortable tables, position badge, headshot, 3 PPG columns, rank shift badges (green up / red down), position filter tabs, season selector, PNG export with watermark. 8 escapeHtml, 22/22 braces balanced.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Scoring" nav link on all 36 pages (33/33 nav links consistent). Sitemap entry. Tools hub catalog entry under Performance Analysis. Analytics tracking.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid. JS balanced. 36/36 pages have scoring link. Design compliance verified.

---

## Loop State
```
Current Phase: 98
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
