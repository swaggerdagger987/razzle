# Razzle Loop — Phase 92 Task List

> Value Over Replacement Player (VORP) Dashboard

**Current Phase**: 92 — VORP Dashboard
**Exit Criterion**: /vorp.html page shows VORP analysis with two sections: "League Winners" (highest VORP — PPG above position replacement level, cross-position ranking) and "Replacement Level" (lowest VORP among fantasy-relevant starters — replaceable players). Each player: position badge, headshot, name, team, VORP value (color-coded badge: elite >=6 green, starter >=3 blue, flex >=1 yellow, fringe >=0 orange, replacement <0 red), PPG, Replacement PPG for position, VORP Rank, Position Rank, GP, Caveat annotation. Replacement thresholds: QB12, RB24, WR36, TE12 (standard 12-team league). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/vorp endpoint computes per-player VORP (PPG minus position replacement-level PPG), splits into league_winners (VORP > 0, sorted desc) and replacement_level (VORP <= 0 or bottom 25, sorted asc). Min 6 games + 2 PPG filter. "VORP" nav link added to all 31 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Task 1: Backend /api/vorp endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: fetch_vorp in live_data.py. Computes replacement-level PPG per position (QB12/RB24/WR36/TE12), VORP = PPG - replacement PPG, splits into league_winners (VORP > 0) and replacement_level (bottom 25). Min 6 games + 2 PPG. Server endpoint at /api/vorp with season/position/limit params. Python syntax valid.

## Task 2: VORP Dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /vorp.html with two-section table layout. VORP badge tiers (elite/starter/flex/fringe/replacement). Replacement threshold chips showing QB12/RB24/WR36/TE12 PPG. Position tabs, season select, sortable columns, click→profile, PNG export with canvas watermark. 10 escapeHtml calls. JS braces balanced 61/61. Design compliant.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: VORP nav link added to all 31 pages (nav + footer where applicable). Sitemap entry added. Analytics pageview POST in vorp.html with referrer.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py + server.py). JS braces balanced 61/61. 31/31 pages have VORP nav link. 10 escapeHtml calls for XSS. Design compliance: sand bg, chunky 3px borders, 4px shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Loop State
```
Current Phase: 92
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
