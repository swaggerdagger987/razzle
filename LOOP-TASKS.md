# Razzle Loop — Phase 72 Task List

> Aging Curves Dashboard — performance-by-age visualization

**Current Phase**: 72 — Aging Curves Dashboard
**Exit Criterion**: /aging.html page shows position-specific aging curves (PPG by age) as canvas-drawn line charts with individual player dots plotted. Position filter tabs (All/QB/RB/WR/TE). Click player dot → player profile. PNG export with watermark. "Aging Curves" nav link on all pages. Sitemap updated. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/aging-curves endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/aging-curves endpoint added to server.py. fetch_aging_curves() in live_data.py queries player_week_stats joined with players to compute: (1) aggregate PPG-by-age curve across all seasons per position, with age adjusted for season offset, (2) individual player data points for selected season. Returns curve points, players, peak_age, peak_ppg per position. Season + position parameters. LIMIT 500 safety cap. Min 6 games filter. Min 3 sample size for curve points.

## Task 2: Frontend aging.html with canvas charts
**Status**: PASS
**Attempts**: 1
**Notes**: Canvas-drawn line charts per position with: filled area under curve, 3px colored curve line, individual player dots (semi-transparent with ink stroke), peak age dashed marker with Caveat annotation, top 3 player name labels, grid lines with Space Mono axis labels. Tooltip on hover shows player name/age/PPG/team. Click dot → /player/{id}. Position filter tabs (All/QB/RB/WR/TE). Season selector. Summary cards showing peak age per position. Legend. PNG export with watermark. Resize-responsive canvas redraw. Sand bg, chunky borders, offset shadows, all 3 fonts, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Aging" nav link added to all 15 HTML pages (nav + footer where applicable). 404.html and lab.html: nav only. All others: nav + footer. Sitemap entry added. Analytics pageview tracking on aging.html.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py, server.py). JS syntax valid (aging.html). 18/18 design checks passed (sand bg, 3px borders, 4px shadows, all 3 fonts, all 4 position colors, escapeHtml, topnav, watermark, analytics, html2canvas, responsive 768+480, aria-label). Nav links: 28 total occurrences across 15 files.

---

## Loop State
```
Current Phase: 72
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
