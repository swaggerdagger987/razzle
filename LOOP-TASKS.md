# Razzle Loop — Phase 82 Task List

> Red Zone & Goal-Line Dashboard

**Current Phase**: 82 — Red Zone & Goal-Line Dashboard
**Exit Criterion**: /redzone.html page shows goal-line usage leaders with two sections: "Goal-Line Dominators" (most GL opportunities) and "TD Dependent" (highest TD% of fantasy scoring). Each player row shows: position badge, headshot, name, team, GL carries, GL targets, GL TDs, GL TD rate, total TDs, fantasy PPG, TD% of fantasy points, GP. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns. Click player row → player profile. PNG export with watermark. Responsive at 768px + 480px. /api/redzone-usage endpoint returns data from player_season_pbp + player_week_stats. "Red Zone" nav link added to all 23 HTML pages. Sitemap entry. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/redzone-usage endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/redzone-usage returns `dominators` (sorted by gl_opportunities, min 3 GL opps) and `td_dependent` (sorted by td_pct_of_fantasy, min 2 TDs). Queries player_week_stats for fantasy points + TDs + games, joins player_season_pbp for gl_carries/gl_targets/gl_tds. Computes gl_td_rate, td_pct_of_fantasy. Season + position params. Parameterized SQL, position whitelist.

## Task 2: Red Zone dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /redzone.html with two-section table layout. Dominators table: Player, GL Opp, GL Car, GL Tgt, GL TD, GL TD%, TDs, PPG, GP, annotation. TD Dependent table: Player, TD%, TDs, RuTD, ReTD, PPG, GL TD, GL Opp, GP, annotation. GL TD% badge (green/yellow/red by rate). TD% badge (red=heavy, orange=moderate, green=light). Position tabs, season selector, sortable columns, row click → profile, PNG export with watermark. Responsive hide-mobile columns. Caveat annotations.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Red Zone" link added to nav + footer of all 23 HTML pages (23/23 verified). Sitemap entry added ("/redzone.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (redzone.html). 23/23 pages have Red Zone nav link. XSS: 9 escapeHtml calls covering all dynamic content. SQL: parameterized queries, position whitelist. Design compliance: 3px borders (3), 4px shadows (2), display font (6), mono font (5), hand font (7), position colors present.

---

## Loop State
```
Current Phase: 82
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
