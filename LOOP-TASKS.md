# Razzle Loop — Phase 69 Task List

> Breakout Candidate Finder — Opportunity vs Production Gap Analysis

**Current Phase**: 69 — Breakout Candidate Finder
**Exit Criterion**: /breakouts.html page shows top breakout candidates ranked by a Razzle Breakout Score (RBS) that measures the gap between opportunity metrics (snap share, target share, carries, air yards) and actual fantasy production (PPG). Each candidate rendered as a comic-strip card with position badge, team, age badge, RBS score, opportunity vs production bars, and key stat callouts (snap%, target share, PPG, production gap). Position filter tabs (All/QB/RB/WR/TE). Season selector dropdown. PNG export with watermark. Click card → player profile. "Breakouts" nav link added to all 13 HTML pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font headers, Caveat annotations.

---

## Task 1: Backend /api/breakout-candidates endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/breakout-candidates?season=N&position=X returns JSON. Breakout Score composite: opportunity_percentile (snap%, target_share/carry_share, air_yards) vs production_percentile (PPG) with age bonus. Position-specific opportunity weighting (QB: attempts, RB: carries+targets, WR/TE: target_share+air_yards). Only fantasy-relevant players age ≤27 with 6+ games. Sorted by RBS desc, top 50. Available seasons for dropdown.

## Task 2: Build breakouts.html with candidate cards and opportunity gauges
**Status**: PASS
**Attempts**: 1
**Notes**: Each candidate as a comic-strip card: position-colored top stripe, rank badge, headshot, name (display font), team, age badge (young/prime/aging). RBS score prominently displayed. Opportunity vs Production horizontal bars showing the gap. Caveat annotations per card. Position filter tabs (All/QB/RB/WR/TE). Season selector. PNG export via html2canvas with watermark. Click card → /player/{id}. Loading state "scouting the film...". Responsive at 768px and 480px. 14/14 design checks pass.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Breakouts" link added to nav and footer on all 12 other HTML pages. Sitemap entry added (priority 0.8, weekly). Analytics pageview tracking via inline fetch. OG tags set for title/description/image.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py, live_data.py). JS syntax valid (1 script block). 14/14 design checks pass — 3px borders, 4px offset shadows, display/mono/hand fonts, card bg, ink colors, XSS protection (escapeHtml), watermark, responsive 768px + 480px, all 4 position colors, analytics tracking, hover lift, html2canvas export. Nav: breakouts references across all 13 HTML files. No XSS vectors.

---

## Loop State
```
Current Phase: 69
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
