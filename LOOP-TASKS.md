# Razzle Loop — Phase 73 Task List

> Weekly Scoring Heatmap — player × week performance grid

**Current Phase**: 73 — Weekly Scoring Heatmap
**Exit Criterion**: /weekly.html page shows a color-coded grid of player weekly fantasy scores (rows = players, columns = weeks). Cells color-coded from red (bad) to green (good) based on positional percentiles. Position filter tabs (All/QB/RB/WR/TE). Season selector. Click player name → player profile. PNG export with watermark. "Weekly" nav link on all pages. Sitemap updated. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/weekly-heatmap endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/weekly-heatmap endpoint added to server.py. fetch_weekly_heatmap() in live_data.py queries player_week_stats to return: top players by total PPR points, per-week scores, positional percentile thresholds (p20/p40/p60/p80) for color coding. Season + position + limit parameters. LIMIT 50 safety cap. Min 4 games filter.

## Task 2: Frontend weekly.html with heatmap grid
**Status**: PASS
**Attempts**: 1
**Notes**: HTML table heatmap with: sticky player name column, week columns (W1-W18), PPG summary column. Cells color-coded in 5 tiers (red→yellow→sand→light green→strong green) based on positional percentile thresholds. Player row shows rank, position color dot, name, team. Click name → /player/{id}. Bye weeks shown as "bye". Hover highlights row. Position filter tabs (All/QB/RB/WR/TE). Season selector. PNG export with watermark. Color legend. Sand bg, chunky 3px borders, 4px offset shadows, all 3 fonts, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Weekly" nav link added to all 16 HTML pages (nav + footer where applicable). 404.html and lab.html: nav only. Sitemap entry added with 0.8 priority. Analytics pageview tracking on weekly.html.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py, server.py). JS syntax valid (weekly.html). 18/18 design checks passed (sand bg, 3px borders, 4px shadows, 3 fonts, 4 position colors, escapeHtml, topnav, watermark, analytics, html2canvas, responsive 768+480, aria-label). Nav links: 16 files with weekly.html references.

---

## Loop State
```
Current Phase: 73
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
