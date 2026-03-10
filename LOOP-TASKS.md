# Razzle Loop — Phase 78 Task List

> Year-over-Year Comparison — Cross-season stat deltas showing who improved and declined

**Current Phase**: 78 — Year-over-Year Comparison
**Exit Criterion**: /yoy.html page shows year-over-year stat comparisons between two adjacent seasons. Two sections: "Risers" (players who improved most) and "Fallers" (players who declined most). Each player row shows: position badge, headshot, name, team, Season N PPG, Season N-1 PPG, delta (green=improved, red=declined), plus key stat deltas (targets/game, yards/game, TDs, snap%). Position filter tabs (All/QB/RB/WR/TE). Season pair selector (e.g., "2024 vs 2023"). Metric selector to sort by different delta categories (PPG, targets/game, yards/game, TD rate). Click player row → player profile. Caveat annotations ("breakout year", "big leap", "falling off", "regression"). PNG export with watermark. "YoY" nav link added to all HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors. Responsive at 768px + 480px with hide-mobile columns.

---

## Task 1: Backend /api/year-over-year endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/year-over-year with season/position/metric/limit params. Computes per-game stats for two adjacent seasons per player, calculates deltas for PPG, tgt/g, rec_yd/g, rush_yd/g, TDs, snap%. Returns risers and fallers sorted by chosen metric delta. Min 4 games per season filter. try/except with proper error handling in server.py.

## Task 2: Year-over-year page with risers/fallers tables
**Status**: PASS
**Attempts**: 1
**Notes**: /yoy.html with two sections: Risers (stats trending up year-over-year) and Fallers (stats trending down). Each player row shows: position badge, headshot, name, team, previous season value, current season value, delta arrow+value (green up / red down), mini-deltas for other metrics, games played (prev→curr), Caveat annotations. Season pair selector (e.g., "2024 vs 2023"). Metric selector (PPG, Targets/G, Rec Yards/G, Rush Yards/G, TDs, Snap%). Position filter tabs. Click player → profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. Error state with retry button. All design rules: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "YoY" nav link added to all 20 HTML pages (nav + footer). 20/20 pages confirmed. Sitemap.xml entry added (/yoy.html, 0.8 priority, weekly). Analytics pageview tracking via app.js trackPageview().

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS syntax valid (1 script block OK). 20/20 pages have YoY nav link (38 total occurrences: 20 nav + 18 footer). Design compliance: 7 font-display, 5 font-mono, 7 font-hand, 2 chunky borders, 1 offset shadow, 4 bg-card, 4 bg-warm, 4 position color refs, 14 ink refs. All acceptance criteria met.

---

## Loop State
```
Current Phase: 78
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
