# Razzle Loop — Phase 88 Task List

> Opportunity Share & Dominator Rating Dashboard

**Current Phase**: 88 — Opportunity Share & Dominator Rating Dashboard
**Exit Criterion**: /opportunity.html page shows opportunity share analysis with two sections: "Alpha Dogs" (highest opportunity share — targets+carries as % of team total, min 30 opps) and "Dominator Rating Leaders" (highest dominator rating — receiving yards share + receiving TD share of team totals, WR/TE only). Each player: position badge, headshot, name, team, Opp Share % (color-coded badge), Dominator Rating (0-100 badge, WR/TE) or Rush Share (RB/QB), Targets/G, Carries/G, Total Opps, PPG, GP, Caveat annotation. Position filter tabs. Season selector. Sortable columns. Row click to profile. PNG export with watermark. Responsive at 768px + 480px. Nav links on all 28 pages. Sitemap entry. Analytics tracking.

---

## Task 1: Backend /api/opportunity-share endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/opportunity-share returns `alpha_dogs` and `dominators` arrays. Opportunity Share = (player targets + carries) / (team total targets + carries) * 100. Dominator Rating = ((player rec yards / team rec yards) + (player rec TDs / team rec TDs)) / 2 * 100 (WR/TE); Rush Share for RB/QB = player rush yards / team rush yards * 100. Min 30 opps + 4 games filter. Parameterized SQL. Fantasy_relevant filter. Python syntax valid.

## Task 2: Opportunity Share dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /opportunity.html with two-section table layout. Alpha Dogs: Player, Opp Share % badge (green>=25%, blue>=18%, yellow>=12%, orange>=8%, red<8%), Dom Rating, Tgt/G, Car/G, Total Opps, PPG, GP, annotation. Dominators: Player, Dom Rating badge (green>=30, blue>=20, yellow>=12, orange>=6, red<6), Opp Share, RecYd%, RecTD%, Tgt/G, PPG, GP, annotation. Position tabs, season selector, sortable columns with sort state per section, row click to profile, PNG export with watermark. 9 escapeHtml calls. Responsive hide-mobile. 71/71 braces, 184/184 parens, 16/16 brackets.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Opportunity" link added to nav + footer of all 28 HTML pages (28/28 verified). Sitemap entry added ("/opportunity.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS structure valid (71/71 braces, 184/184 parens). 28/28 pages have Opportunity nav link. XSS: 9 escapeHtml calls covering all dynamic content. Sitemap entry present. Design compliance: 3px borders, 4px shadows, font-display headers, font-mono data, font-hand annotations, position colors, watermark present, analytics present.

---

## Loop State
```
Current Phase: 88
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
