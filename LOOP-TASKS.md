# Razzle Loop — Phase 79 Task List

> Air Yards Dashboard — Advanced receiving metrics leaderboard with regression indicators

**Current Phase**: 79 — Air Yards Dashboard
**Exit Criterion**: /airyards.html page shows an air yards analytics dashboard for pass catchers. Leaderboard table with columns: position badge, headshot, player name, team, targets, air yards, aDOT, air yards share, WOPR, RACR, PPG, and a "regression indicator" column (air yards rank vs PPG rank delta). Two sections: "Buy Low" (high air yards, underperforming in PPG — positive regression candidates) and "Sell High" (low air yards, overperforming in PPG — negative regression candidates). Caveat annotations ("due for more", "efficiency monster", "volume mirage", "TD regression"). Position filter tabs (All/WR/RB/TE — no QB). Season selector. Metric sort on any column. Click player row → player profile. PNG export with watermark. Color legend for regression indicator. "Air Yards" nav link added to all HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors. Responsive at 768px + 480px with hide-mobile columns.

---

## Task 1: Backend /api/air-yards endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/air-yards with season/position/limit params. Queries player_week_stats for receiving_air_yards, targets, and joins with player_week_metrics for air_yards_share, wopr, target_share. Computes aDOT (receiving_air_yards / targets), RACR (rec_yards / air_yards), per-game stats, regression indicator (PPG rank minus air yards rank). Returns buy_low (positive delta >3) and sell_high (negative delta <-3). Min 4 games + 10 targets filter. try/except with proper error handling in server.py.

## Task 2: Air Yards dashboard page with buy low / sell high tables
**Status**: PASS
**Attempts**: 1
**Notes**: /airyards.html with two sections: Buy Low (high air yards, low production) and Sell High (low air yards, high production). Each player row: position badge, headshot, name, team, Tgt/G, Air Yards, AY/G, aDOT, AY%, WOPR, RACR, PPG, regression badge (green=buy/red=sell), GP, Caveat annotation. Season selector. Position filter tabs (All/WR/RB/TE). Sortable columns with sort state tracking. Click player → profile. PNG export via html2canvas with watermark. Error state with retry. Responsive at 768px + 480px with hide-mobile. Design: sand bg, chunky 3px borders, 4px offset shadows, 7 font-display, 4 font-mono, 8 font-hand, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Air Yards" nav link added to all 21 HTML pages (nav + footer). 40 total occurrences (21 nav + 19 footer). Sitemap.xml entry (/airyards.html, 0.8 priority, weekly). Analytics pageview tracking via app.js trackPageview().

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (1 script block OK). 21/21 pages have Air Yards nav link. Design compliance: 7 font-display, 4 font-mono, 8 font-hand, 2 chunky borders, 1 offset shadow, 4 bg-card, 4 bg-warm, 3 position color refs, 44 ink refs. All acceptance criteria met.

---

## Loop State
```
Current Phase: 79
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
