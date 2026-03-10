# Razzle Loop — Phase 68 Task List

> Positional Scarcity Dashboard — PPG Drop-off by Position

**Current Phase**: 68 — Positional Scarcity Dashboard
**Exit Criterion**: /scarcity.html page shows PPG drop-off curves for each position (QB, RB, WR, TE) as stepped bar charts. Each position group rendered as a comic-strip card with position-colored bars showing PPG from rank 1 to rank N. Tier break lines at key thresholds (e.g., QB1-12, RB1-24, WR1-36, TE1-12) with Caveat annotations ("the cliff", "streaming territory"). Replacement level highlighted. Position scarcity summary card showing which positions have the steepest drop-off. Season selector dropdown. PNG export with watermark. Click player bar → player profile. "Scarcity" nav link added to all 12 HTML pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font headers, Caveat annotations.

---

## Task 1: Backend /api/positional-scarcity endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/positional-scarcity?season=N returns JSON. Groups by QB/RB/WR/TE, sorted by PPG desc, includes player_id, name, team, ppg, rank. Tier breaks at standard league thresholds (QB1-12, RB1-24, WR1-36, TE1-12). Scarcity scores (drop-off from #1 to replacement level). Annotations for tier breaks. Available seasons for dropdown.

## Task 2: Build scarcity.html with drop-off charts and tier breaks
**Status**: PASS
**Attempts**: 1
**Notes**: DOM-based stepped bar charts with position-colored fills. Scarcity summary cards at top (ranked by drop-off). Position chart cards with bar rows (rank, name, bar, ppg). Tier break dividers with Caveat annotations. Season selector. PNG export via html2canvas with watermark. Click bar → player profile. Loading state "running the numbers...". Responsive at 768px and 480px. 14/14 design checks pass.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Scarcity" link added to nav and footer on all 11 other HTML pages (9 with nav+footer, 2 with nav only). Sitemap entry added (priority 0.8, weekly). Analytics pageview tracking via inline fetch. OG tags set for title/description/image.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py, live_data.py). JS syntax valid (1 script block). 14/14 design checks pass — 3px borders, 4px offset shadows, display/mono/hand fonts, card bg, ink colors, XSS protection (escapeHtml), watermark, responsive 768px + 480px, all 4 position colors, analytics tracking, hover lift, dashed dividers, html2canvas export. Nav: 118 occurrences of "scarcity" across 12 files.

---

## Loop State
```
Current Phase: 68
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
