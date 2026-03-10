# Razzle Loop — Phase 80 Task List

> Stat Explorer — Configurable scatter plot with user-selectable X/Y axes

**Current Phase**: 80 — Stat Explorer
**Exit Criterion**: /explorer.html page shows an interactive scatter plot where users can select any two metrics for X and Y axes from dropdown menus. Each dot is a player, color-coded by position. Hover/click dot shows player details. Position filter tabs. Season selector. Canvas-drawn scatter with axis labels, gridlines, tick marks, and trendline. PNG export with watermark. "Explorer" nav link added to all HTML pages. Sitemap entry. Analytics tracking. Design matches DESIGN.md. Responsive.

---

## Task 1: Backend /api/stat-explorer endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/stat-explorer with season/position/x_stat/y_stat params. 17 available metrics. Per-game computed from player_week_stats. Rate metrics enriched from player_week_metrics. Min 4 games filter. try/except error handling.

## Task 2: Scatter plot page with canvas-drawn chart
**Status**: PASS
**Attempts**: 1
**Notes**: /explorer.html with canvas-drawn scatter plot. X/Y axis dropdowns populated from API. Position-colored dots. Hover tooltip. Click dot → profile. Gridlines, trendline, axis labels. Position filter tabs. Season selector. Resize handler. PNG export. Error state with retry. Responsive.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Explorer" nav link added to all 22 HTML pages (nav + footer). 42 total occurrences. Sitemap.xml entry. Analytics pageview tracking.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python + JS syntax valid. 22/22 pages have Explorer nav link. Design compliance confirmed.

---

## Loop State
```
Current Phase: 80
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
