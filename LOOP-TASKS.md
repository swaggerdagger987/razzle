# Razzle Loop — Phase 87 Task List

> Dynasty Stock Watch Dashboard

**Current Phase**: 87 — Dynasty Stock Watch Dashboard
**Exit Criterion**: /stocks.html page shows dynasty stock watch with Rising Stocks (undervalued by composite metrics) and Falling Stocks (overvalued). Composite stock score blends efficiency, consistency, SOS, and PPG percentiles into 0-100 score. Nav links on all 27 pages. Sitemap entry. Analytics tracking.

---

## Task 1: Backend /api/stock-watch endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/stock-watch returns `rising` and `falling` arrays. Composite stock score: PPO percentile (25%) + inverse CoV percentile (25%) + SOS difficulty percentile (25%) + PPG percentile (25%). Rising = stock_delta > 0 (undervalued). Falling = stock_delta < 0 (overvalued). Each player includes efficiency_grade, consistency_grade, sos_grade. Parameterized SQL, fantasy_relevant filter, min 6 games + 2 PPG + 50 opps for PPO. Python syntax valid.

## Task 2: Dynasty Stock Watch dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /stocks.html with two-section table layout. Rising Stocks: Player, Stock Score (0-100 color-coded badge), PPG, Eff grade, Con grade, SOS grade, Delta, Age, GP, annotation. Falling Stocks: same columns. Score badge colors: elite (80+) green, good (60-79) blue, avg (40-59) yellow, below (20-39) orange, poor (<20) red. Grade badges reuse A+/A green, B blue, C yellow, D orange, F red. Position tabs, season selector, sortable columns, row click → profile, PNG export with watermark. 13 escapeHtml calls. Responsive hide-mobile. 139/139 braces, 307/307 parens.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Stocks" link added to nav + footer of all 27 HTML pages (27/27 verified). Sitemap entry added ("/stocks.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS structure valid (139/139 braces, 307/307 parens). 27/27 pages have Stocks nav link. XSS: 13 escapeHtml calls covering all dynamic content. Sitemap entry present. Design compliance: 3px borders, 4px shadows, font-display headers, font-mono data, font-hand annotations, position colors, watermark present, analytics present.

---

## Loop State
```
Current Phase: 87
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
