# Razzle Loop — Phase 63 Task List

> Dynasty Rankings Board — Visual Tiered Rankings Page

**Current Phase**: 63 — Dynasty Rankings Board
**Exit Criterion**: /rankings.html page shows top 200 dynasty-relevant players ranked by dynasty value (0-100), grouped into 8 visual tiers (Tier 1: Elite through Tier 8: Deep Stash). Each player card shows position badge (color-coded), team, age, dynasty value score, and PPG. Position filter tabs (All/QB/RB/WR/TE). Tiered card layout with tier labels and tier-colored left borders. PNG export of rankings. Nav link on all pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font for headers.

---

## Task 1: Backend — dynasty rankings endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/dynasty-rankings?position=&limit=200 in server.py. fetch_dynasty_rankings() in live_data.py — joins players + player_week_stats, computes dynasty value via compute_trade_value(), assigns tiers 1-8. Returns both flat player list and grouped tiers. Position filter, limit capped at 300, minimum 3 games.

## Task 2: Frontend — rankings.html page with tiered card layout
**Status**: PASS
**Attempts**: 1
**Notes**: Full page with tiered sections. Tier headers with rotated badge stickers (tier-colored), Caveat labels, player count. Player cards in responsive grid: rank number, headshot/initials, name (display font), position badge (color-coded), team, age badge (green/yellow/red by age), dynasty value + PPG (mono font). Cards have 3px ink borders, 4px offset shadows, hover lift. Sand bg, card bg, all fonts correct per DESIGN.md.

## Task 3: Position filters + PNG export + nav link
**Status**: PASS
**Attempts**: 1
**Notes**: Chunky segmented position filter tabs (All/QB/RB/WR/TE) with active state using position colors. Filtering re-fetches from API. PNG export via html2canvas (lazy-loaded) with watermark. "Rankings" nav link added to all 8 HTML pages (nav + footer). Active state on rankings.html.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (py_compile both files). JS syntax valid (Function constructor check). All 8 HTML pages have Rankings nav link. Design matches DESIGN.md (3px borders, 4px shadows, position colors, correct fonts, sand bg). XSS safe (escapeHtml/escapeAttr on all player data). Route order clean, no conflicts.

---

## Loop State
```
Current Phase: 63
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
