# Razzle Loop — Phase 67 Task List

> Rookie Big Board — Prospect Rankings Page

**Current Phase**: 67 — Rookie Big Board
**Exit Criterion**: /prospects.html page shows all prospects ranked by RPS (Razzle Prospect Score), grouped into tiers (Elite/Premium/Solid/Raw). Each prospect card shows rank, position badge, school, draft capital (round/pick), combine measurables with percentile bars, and RPS score. Position filter tabs (All/QB/RB/WR/TE). Draft year selector. PNG export with watermark. Click prospect → prospect profile in Lab. Nav links on all pages. Design matches DESIGN.md.

---

## Task 1: Build prospects.html with tiered prospect cards
**Status**: PASS
**Attempts**: 1
**Notes**: Created /frontend/prospects.html. Fetches /api/prospect-scores. Groups by RPS tiers: Elite (80+), Premium (60-79), Solid (40-59), Raw (<40). Each card: rank, position badge (colored), name, school, draft round/pick, combine percentile mini-bars (40yd, Vert, Broad, Bench, 3Cone, Shuttle) with color-coded fills, RPS score. Position filter tabs (All/QB/RB/WR/TE) with segmented control. Draft year selector dropdown via /api/prospect-options. PNG export with html2canvas + watermark. Loading state "scouting the board...". Click card → Lab prospect search.

## Task 2: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: Added "Prospects" link to nav and footer on all 11 HTML pages (10 existing + prospects.html itself). Added /prospects.html to sitemap.xml generator in server.py (priority 0.9, weekly). Analytics pageview tracking via inline fetch. OG tags set for title/description/image.

## Task 3: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: JS syntax valid (2 script blocks). Python syntax valid (server.py). Design rules: 14/14 checks pass — 3px borders, 4px offset shadows, display/mono/hand fonts, card bg, ink colors, XSS protection (escapeHtml + escapeAttr), watermark, responsive 768px + 480px, all 4 position colors, analytics tracking. Nav link count: 20 occurrences across 11 files (nav + footer on 9 pages, nav-only on lab.html and 404.html).

---

## Loop State
```
Current Phase: 67
Current Task: 3
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 3/3
```
