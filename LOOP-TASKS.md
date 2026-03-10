# Razzle Loop — Phase 74 Task List

> Team Target Distribution — treemap showing team usage breakdown

**Current Phase**: 74 — Team Target Distribution
**Exit Criterion**: /targets.html page shows team-by-team target and carry distribution as stacked horizontal bars. Each team shows player segments sized by share, color-coded by position. Click player → profile. Team selector. Targets/Carries mode toggle. Season selector. PNG export with watermark. "Targets" nav link on all pages. Sitemap updated. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/target-distribution endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/target-distribution endpoint added to server.py. fetch_target_distribution() in live_data.py queries player_week_stats grouped by team to compute: targets, carries, receptions, yards, TDs, PPR pts per player, with target_share and carry_share percentages. Season + team parameters. Top 8 players per team. LIMIT 500 safety cap. Min 3 games filter.

## Task 2: Frontend targets.html with distribution bars
**Status**: PASS
**Attempts**: 1
**Notes**: Team cards with: stacked horizontal distribution bars (segments sized by share, position-colored), player name labels on segments >8%, "other" bucket. Targets/Carries mode toggle. Player detail rows showing position badge, name, count, share%. Team header with name + total count. Caveat annotations ("owns this target tree", "spread it around"). Click player → profile. Team selector dropdown. Season selector. PNG export with watermark. Position color legend. Sand bg, chunky 3px borders, 4px offset shadows, all 3 fonts, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Targets" nav link added to all 17 HTML pages (nav + footer where applicable). 404.html and lab.html: nav only. Sitemap entry added with 0.8 priority. Analytics pageview tracking on targets.html.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py, server.py). JS syntax valid (targets.html). 18/18 design checks passed (sand bg, 3px borders, 4px shadows, 3 fonts, 4 position colors, escapeHtml, topnav, watermark, analytics, html2canvas, responsive 768+480, aria-label). Nav links: 17 files with targets.html references.

---

## Loop State
```
Current Phase: 74
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
