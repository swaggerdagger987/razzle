# Razzle Loop — Phase 90 Task List

> Fantasy Season Superlatives — The 2024 Razzle Fantasy Awards

**Current Phase**: 90 — Fantasy Season Superlatives Dashboard
**Exit Criterion**: /awards.html page shows fantasy season superlatives — data-driven awards crowning winners across all Razzle metric systems. Award categories: MVP (highest Fantasy GPA), Most Efficient (highest PPO grade), Iron Man (most consistent, lowest CoV), Schedule Survivor (best production despite hardest SOS), Volume King (highest opportunity share), Breakout Star (highest breakout score), Rising Stock (highest stock score delta), Dominator (highest dominator rating), Red Zone King (most GL TDs), and Best Floor (highest 10th-percentile weekly score). Each award: trophy/badge icon, award name, winner card with position badge, headshot, name, team, key stat, runner-up list (2nd-5th place). Position filter tabs (All/QB/RB/WR/TE). Season selector. PNG export with watermark. Responsive at 768px + 480px. /api/season-awards endpoint computes all award categories from existing metrics. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors. Nav links on all 30 pages. Sitemap entry. Analytics tracking.

---

## Task 1: Backend /api/season-awards endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/season-awards returns `awards` array with 10 categories. Each: key, name, description, stat_label, annotation, winner (player card), runners_up (2nd-5th). Computes: MVP (composite GPA), Most Efficient (PPO), Iron Man (inverse CoV), Schedule Survivor (PPG x SOS difficulty), Volume King (opp share), Breakout Star (age-weighted volume+production), Rising Stock (stock delta), Dominator (dominator rating), Red Zone King (GL TDs from player_season_pbp), Best Floor (10th percentile weekly score). Min 6 games + 2 PPG. Parameterized SQL. Fantasy_relevant filter. Season + position parameters. Python syntax valid.

## Task 2: Season Superlatives dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /awards.html with 2-column award card grid. Each card: trophy icon (per-award emoji map), header with name+description, winner showcase (headshot, name, pos badge, team, PPG, GPA/Eff/Con/SOS grade mini-badges, annotation, key stat highlight), runners-up list (rank, headshot, pos badge, name, key stat). Position tabs, season selector. 21 escapeHtml calls. Braces/parens/brackets balanced (163/163). resp.ok error check. PNG export with html2canvas + watermark. Click winner/runner → player profile. Responsive: 2-col→1-col at 768px. Design compliant: 3px borders, 4px shadows, font-display headers, font-mono data, font-hand annotations, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Awards" link added to nav + footer of all 30 HTML pages (30/30 verified). Sitemap entry added ("/awards.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS structure valid (braces/parens/brackets all balanced 163/163). 30/30 pages have Awards nav link. XSS: 21 escapeHtml calls covering all dynamic content. Sitemap entry present. Design compliance: 3px borders, 4px shadows, font-display headers, font-mono data, font-hand annotations, position colors, watermark present, analytics present, resp.ok check present.

---

## Loop State
```
Current Phase: 90
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
