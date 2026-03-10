# Razzle Loop — Phase 83 Task List

> Fantasy Efficiency Dashboard

**Current Phase**: 83 — Fantasy Efficiency Dashboard
**Exit Criterion**: /efficiency.html page shows fantasy efficiency rankings with two sections: "Most Efficient" (highest fantasy points per opportunity, min 50 opportunities) and "Volume Kings" (most total opportunities with efficiency grade). Each player row shows: position badge, headshot, name, team, PPO (fantasy points per opportunity), Yards/Touch, Catch Rate (WR/RB/TE), YAC/Rec (WR/TE), TD Rate per Touch, total opportunities (targets + carries), fantasy PPG, GP, efficiency grade badge (A+ to F based on PPO percentile). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/efficiency-rankings endpoint queries player_week_stats for touches/targets/carries/yards/TDs/fantasy points, computes PPO/YPT/catch rate/YAC per rec/TD rate, grades by PPO percentile, splits into most_efficient (top PPO) and volume_kings (top opportunities). Min 4 games + 50 opportunities filter. "Efficiency" nav link added to all 24 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Task 1: Backend /api/efficiency-rankings endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/efficiency-rankings returns `most_efficient` (sorted by PPO desc) and `volume_kings` (sorted by opportunities desc). Queries player_week_stats for fantasy points, targets, carries, receptions, yards, air yards, TDs. Computes PPO, yards per touch, catch rate, YAC per reception, TD rate per touch. Grades by PPO percentile (A+ >= 95th, A >= 85th, B >= 70th, C >= 45th, D >= 25th, F < 25th). Season + position params. Parameterized SQL, position whitelist. Min 4 games + 50 opportunities.

## Task 2: Efficiency dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /efficiency.html with two-section table layout. Most Efficient: Player, PPO, Grade, Y/Tch, Catch%, YAC/R, TD%, Opps, PPG, GP, annotation. Volume Kings: Player, Opps, Touches, PPO, Grade, Y/Tch, TD%, PPG, TDs, GP, annotation. Grade badges color-coded (A+/A green, B blue, C yellow, D orange, F red). Position tabs, season selector, sortable columns, row click → profile, PNG export with watermark. Responsive hide-mobile columns. Caveat annotations. 10 escapeHtml calls for XSS.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Efficiency" link added to nav + footer of all 24 HTML pages (24/24 verified). Sitemap entry added ("/efficiency.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (efficiency.html). 24/24 pages have Efficiency nav link. XSS: 10 escapeHtml calls covering all dynamic content. SQL: parameterized queries, position whitelist. Design compliance: 3px borders, 4px shadows, display font, mono font, hand font, position colors (26 design rule references).

---

## Loop State
```
Current Phase: 83
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
