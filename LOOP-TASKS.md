# Razzle Loop — Phase 93 Task List

> Dynasty Trade Value Chart

**Current Phase**: 93 — Dynasty Trade Value Chart
**Exit Criterion**: /tradevalues.html page shows a dynasty trade value chart ranking ALL fantasy-relevant players by composite trade value (production 50% + age 30% + positional scarcity 20%). Visual horizontal bar chart with position-colored bars (QB blue, RB teal, WR terracotta, TE purple), grouped into 8 dynasty tiers (Elite/Blue Chip/Premium/Solid/Promising/Depth/Roster Clogger/Cut Bait). Player search/filter at top. Position filter tabs (All/QB/RB/WR/TE). Season selector. Each player row: rank number, position badge, headshot, name, team, age, trade value (0-100), value bar (width proportional to value, position-colored), PPG, tier badge, value component breakdown tooltip (production/age/scarcity scores). Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px. /api/trade-value-chart endpoint returns all fantasy-relevant players with trade values, components, tiers, sorted by value desc. Min 4 games + 2 PPG filter. "Trade Values" nav link added to all 32 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Task 1: Backend /api/trade-value-chart endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: fetch_trade_value_chart in live_data.py. Composite trade value (production 50% + age 30% + scarcity 20%), component breakdown (production_score, age_score, scarcity_score), 8-tier assignment (_tv_tier), min 4 games + 2 PPG. Server endpoint at /api/trade-value-chart with season/position/limit params. Python syntax valid.

## Task 2: Trade Value Chart page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /tradevalues.html with horizontal bar chart layout. Position-colored bars (QB blue, RB teal, WR terracotta, TE purple). 8 tier groups with tier headers. Rank numbers with gold/silver/bronze top-3 accents. Player search input. Component breakdown in tooltip. Methodology chips showing weight breakdown. 13 escapeHtml calls. JS braces balanced 37/37. Design compliant.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: Trade Values nav link added to all 32 pages (nav + footer). Sitemap entry added. Analytics pageview POST in tradevalues.html with referrer.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (live_data.py + server.py). JS braces balanced 37/37. 32/32 pages have Trade Values nav link. 13 escapeHtml calls for XSS. Design compliance: sand bg, chunky 3px borders, 4px shadows, display font headers, mono data, hand annotations, position colors, responsive 768+480, watermark, analytics.

---

## Loop State
```
Current Phase: 93
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
