# Razzle Loop — Phase 70 Task List

> Buy Low / Sell High Dashboard — Dynasty Value Mismatch Finder

**Current Phase**: 70 — Buy Low / Sell High Dashboard
**Exit Criterion**: /buysell.html page shows two columns: Buy Low candidates (high efficiency, low dynasty rank) and Sell High candidates (low efficiency, high dynasty rank). Each player rendered as a comic-strip card with position badge, team, age badge, dynasty rank, efficiency grade (A+ to F), value mismatch score, and key efficiency stats (yards/touch, TD rate, catch rate — position-specific). Position filter tabs (All/QB/RB/WR/TE). Season selector dropdown. PNG export with watermark. Click card → player profile. "Buy/Sell" nav link added to all 14 HTML pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font headers, Caveat annotations.

---

## Task 1: Backend /api/buy-sell-candidates endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/buy-sell-candidates?season=N&position=X returns JSON with buy_low[] and sell_high[]. Position-specific efficiency: QB=Y/A+TD%+INT%, RB=YPC+Y/TGT+TD%, WR/TE=Y/TGT+Catch%+YAC/R+TD%. Compared against dynasty value rank percentile. Age amplifier (young buy lows stronger, old sell highs stronger). Minimum 10-point mismatch threshold. Top 15 each. Available seasons for dropdown.

## Task 2: Build buysell.html with two-column layout and player cards
**Status**: PASS
**Attempts**: 1
**Notes**: Two-column layout: "Buy Low" (green accent, upward arrow) and "Sell High" (red accent, downward arrow). Each card: position-colored top stripe, rank, headshot, name (display font), team, age badge (young/prime/aging/veteran). Efficiency grade badge (A+ to F, color-coded). Value mismatch bar. Caveat annotation per card. Position-specific efficiency stats in mono font. Position filter tabs. Season selector. PNG export via html2canvas with watermark. Click card → /player/{id}. Loading state "studying the market...". Responsive 768px + 480px. 16/16 design checks pass.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Buy/Sell" link added to nav and footer on all 13 other HTML pages. Sitemap entry added (priority 0.8, weekly). Analytics pageview tracking via inline fetch. OG tags set for title/description/image.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py, live_data.py). JS syntax valid (1 script block). 16/16 design checks pass — 3px borders, 4px offset shadows, display/mono/hand fonts, card bg, ink colors, XSS protection (escapeHtml), watermark, responsive 768px + 480px, all 4 position colors, analytics tracking, hover lift, html2canvas export, loading state. Nav: buysell references across all 14 HTML files. No XSS vectors.

---

## Loop State
```
Current Phase: 70
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
