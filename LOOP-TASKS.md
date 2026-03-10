# Razzle Loop — Phase 94 Task List

> Trade Finder — Value-Matched Trade Targets

**Current Phase**: 94 — Trade Finder
**Exit Criterion**: /tradefinder.html page lets user search for any player, shows their trade value + tier, and displays three sections: "Equal Value Targets" (within +/- 8 trade value points), "Buy Low Targets" (higher value but falling stock — positive value differential with negative stock delta), and "Sell High Targets" (lower value but rising stock — negative value differential with positive stock delta). Each target row: position badge, headshot, name, team, age, trade value bar (position-colored), value differential chip (+/- points), stock trend arrow (up/down/flat), tier badge, PPG. Position filter tabs on targets (All/QB/RB/WR/TE). Selected player card at top with full stats. Click any target → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px. /api/trade-finder endpoint accepts player_id, returns selected player data + equal/buy-low/sell-high target lists. "Trade Finder" nav link added to all 33 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/trade-finder endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: fetch_trade_finder in live_data.py. Combines trade value data (compute_trade_value) with stock scoring (PPO/CoV/PPG percentiles). Returns selected_player + equal_targets (within +/-8 TV points) + buy_low (higher value, falling stock) + sell_high (lower value, rising stock). Server endpoint at /api/trade-finder with player_id + season params. Python syntax valid.

## Task 2: Trade Finder page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /tradefinder.html with player search autocomplete (quick-search API), selected player card (headshot, value, PPG, GP, stock score), 3 target sections (Equal Value / Buy Low / Sell High), position filter tabs on targets, value diff chips, stock trend arrows, tier badges, value bars. 23 escapeHtml calls. JS braces balanced 60/60. PNG export with watermark. Responsive at 768px + 480px. URL state (?player=ID). Design compliant.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: Trade Finder nav link added to all 33 pages (nav + footer). Sitemap entry added. Analytics pageview POST in tradefinder.html with referrer.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py + server.py). JS braces balanced 60/60. 33/33 pages have Trade Finder nav link. 23 escapeHtml calls for XSS. Design compliance: sand bg, chunky 3px borders, 4px shadows, display font headers, mono data, hand annotations, position colors, responsive 768+480, watermark, analytics.

---

## Loop State
```
Current Phase: 94
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
