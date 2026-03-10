# Razzle Loop — Phase 96 Task List

> Tools Hub — Bloomberg-style Dashboard Directory

**Current Phase**: 96 — Tools Hub
**Exit Criterion**: /tools.html page organizes all 25+ analytical dashboards into categorized cards with descriptions, tool counts per category, direct links, and search/filter. Users can discover tools they didn't know existed. Screenshottable as "look at everything this free tool has."

---

## Task 1: Backend /api/tools-hub endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/tools-hub returns static JSON with 7 categories, 30 tools total. Each tool has name, desc, url, positions array. Categories: Rankings & Values (6), Player Discovery (5), Performance Analysis (5), Usage & Opportunity (4), Matchup & Schedule (3), Visualizations (3), Team & League (3).

## Task 2: Tools Hub page (frontend/tools.html)
**Status**: PASS
**Attempts**: 1
**Notes**: Categorized card grid with category headers (icon + name + count badge), tool cards with name/desc/position chips, category-colored top stripes, search input, category filter tabs, hover-lift, PNG export with watermark, responsive at 768px + 480px. 14 escapeHtml calls, 29/29 braces balanced.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Tools" nav link added to all 34 HTML pages (nav + footer). 31/31 nav links consistent across all pages. Sitemap entry added. Analytics pageview tracking via __razzleAnalytics.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS braces balanced (29/29). escapeHtml: 14 calls. All 34 pages have /tools.html link. Design compliance: all 15 checks pass (sand bg, chunky borders, position colors, responsive, watermark, no gradient, no dark mode).

---

## Loop State
```
Current Phase: 96
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
