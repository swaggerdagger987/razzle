# Razzle Loop — Phase 64 Task List

> Stat Leaders Dashboard — Visual Leaderboards by Category

**Current Phase**: 64 — Stat Leaders Dashboard
**Exit Criterion**: /leaders.html page shows top 10 players in 10 key fantasy stat categories (PPG, Passing Yards, Passing TDs, Rushing Yards, Rushing TDs, Receiving Yards, Receiving TDs, Receptions, Target Share, Yards Per Carry). Each category rendered as a comic-strip card with rank numbers, player headshot/initials, position badge (color-coded), team, stat value in mono font. Gold/silver/bronze badges for top 3. Season selector dropdown. Position filter tabs (All/QB/RB/WR/TE). PNG export of leaderboard. Nav link "Leaders" on all pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font for headers, Caveat for annotations.

---

## Task 1: Backend — stat leaders endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/stat-leaders?season=&position=&limit=10 in server.py. fetch_stat_leaders() in live_data.py — queries player_week_stats + player_week_metrics. 10 categories with position-specific filtering (e.g., passing stats only show for QBs, receiving stats for WR/RB/TE). Returns categories array with leaders, plus available seasons for dropdown. Min 3 games, min 30 carries for YPC.

## Task 2: Frontend — leaders.html page with category cards
**Status**: PASS
**Attempts**: 1
**Notes**: Full page with category card grid (2 cols desktop, 1 col mobile). Each card: category name in display font, Caveat annotation, top 10 list with gold/silver/bronze rank badges (circular, ink border, offset shadow), player headshot with fallback initials, name, position badge (color-coded), team, stat value in mono font. Cards have 3px ink borders, 4px offset shadows, hover lift. Click player row → navigate to /player/{id}. Sand bg, card bg, all fonts correct per DESIGN.md.

## Task 3: Position filters + season selector + PNG export + nav link
**Status**: PASS
**Attempts**: 1
**Notes**: Chunky segmented position filter tabs (All/QB/RB/WR/TE) with active state using position colors. Season dropdown populates from API response. PNG export via html2canvas (lazy-loaded) with watermark. "Leaders" nav link added to all 9 HTML pages (nav + footer where applicable). Active state on leaders.html. Sitemap updated with /rankings.html and /leaders.html.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (py_compile both files). JS syntax valid (Function constructor check). All 9 HTML pages have Leaders nav link. Design matches DESIGN.md (3px borders, 4px shadows, position colors, correct fonts, sand bg, Caveat annotations, hover lift). XSS safe (escapeHtml/escapeAttr on all player data). Route order clean. Sitemap includes new pages.

---

## Loop State
```
Current Phase: 64
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
