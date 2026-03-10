# Razzle Loop — Phase 84 Task List

> Consistency Rankings Dashboard

**Current Phase**: 84 — Consistency Rankings Dashboard
**Exit Criterion**: /consistency.html page shows fantasy consistency rankings with two sections: "Rock Solid" (lowest coefficient of variation, most consistent week-to-week scorers) and "Wild Cards" (highest coefficient of variation, most volatile scorers). Each player row shows: position badge, headshot, name, team, PPG, StdDev (standard deviation of weekly PPG), CoV (coefficient of variation = StdDev/PPG), Floor (10th percentile weekly score), Ceiling (90th percentile weekly score), Range (Ceiling - Floor), consistency grade badge (A+ to F based on inverse CoV percentile — lower CoV = higher grade), GP, and Caveat annotation. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/consistency-rankings endpoint queries player_week_stats for weekly fantasy_points_ppr per player, computes mean/stddev/CoV/floor(10th pctile)/ceiling(90th pctile)/range, grades by inverse CoV percentile (A+ = most consistent >= 95th, F = least consistent < 25th), splits into rock_solid (top N by lowest CoV) and wild_cards (top N by highest CoV). Min 6 games filter (need enough weeks for meaningful variance). "Consistency" nav link added to all 25 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Task 1: Backend /api/consistency-rankings endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/consistency-rankings returns `rock_solid` (sorted by CoV asc) and `wild_cards` (sorted by CoV desc). Queries player_week_stats for weekly fantasy_points_ppr. Computes PPG, StdDev, CoV, Floor (10th pctile), Ceiling (90th pctile), Range. Grades by inverse CoV percentile. Season + position params. Parameterized SQL, position whitelist. Min 6 games + 2 PPG floor.

## Task 2: Consistency dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /consistency.html with two-section table layout. Rock Solid: Player, PPG, Grade, StdDev, CoV, Floor, Ceiling, Range, GP, annotation. Wild Cards: Player, PPG, Grade, StdDev, CoV, Floor, Ceiling, Range, GP, annotation. Grade badges color-coded (A+/A green, B blue, C yellow, D orange, F red). Position tabs, season selector, sortable columns, row click → profile, PNG export with watermark. Responsive hide-mobile columns. Caveat annotations. 10 escapeHtml calls for XSS.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Consistency" link added to nav + footer of all 25 HTML pages (25/25 verified). Sitemap entry added ("/consistency.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (consistency.html). 25/25 pages have Consistency nav link. XSS: 10 escapeHtml calls covering all dynamic content. SQL: parameterized queries, position whitelist. Design compliance: 3px borders, 4px shadows, display font, mono font, hand font, position colors (26 design rule references).

---

## Loop State
```
Current Phase: 84
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
