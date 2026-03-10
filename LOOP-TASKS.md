# Razzle Loop — Phase 60 Task List

> Boom/Bust Analyzer — Weekly score distributions, consistency metrics, and volatility profiles

**Current Phase**: 60 — Boom/Bust Analyzer
**Exit Criterion**: Users can analyze any player's weekly fantasy score distribution via a "Boom/Bust" button in the player profile. Backend endpoint returns weekly scores, boom rate (% weeks above 1.5× position average), bust rate (% weeks below 0.5× position average), consistency score (inverse coefficient of variation, 0-100), median, floor (10th percentile), ceiling (90th percentile). Frontend shows: histogram of weekly scores with boom/bust threshold lines, consistency grade badge (A+ through F), floor/ceiling/median stat cards, and position-percentile ranking. Compare two players' volatility profiles side by side. Exportable as branded PNG. Comic-strip design with chunky borders, sand bg, position colors.

---

## Task 1: Backend boom/bust endpoint
**Status**: PENDING
**Acceptance**: GET /api/players/{player_id}/boom-bust?season=0 returns JSON with: weekly_scores array, boom_rate (float 0-100), bust_rate (float 0-100), consistency_score (0-100), median_ppg, floor_ppg (10th percentile), ceiling_ppg (90th percentile), position_avg_ppg, boom_threshold, bust_threshold, games_played, grade (A+ through F), position_rank (consistency rank within position). Min 4 games required. Position-specific thresholds based on position average PPG.
**Attempts**: 0
**Notes**:

## Task 2: Frontend boom/bust UI in player profile
**Status**: PENDING
**Acceptance**: "Boom/Bust" button in profile header (chunky, terracotta border, next to Find Comps). Loading state: "studying the game log variance..." Results render in profileBoomBustSection div. Grade badge (comic-strip rotated sticker, color-coded: A+=green, C=orange, F=red). Stat cards for median, floor, ceiling, boom%, bust%, games. Position-colored accents. Click shows detailed view.
**Attempts**: 0
**Notes**:

## Task 3: Visual histogram + volatility chart
**Status**: PENDING
**Acceptance**: Canvas-rendered histogram of weekly fantasy scores. X-axis: score buckets (0-5, 5-10, 10-15, etc.), Y-axis: frequency. Boom threshold line (green dashed, labeled "BOOM"), bust threshold line (red dashed, labeled "BUST"). Bars colored: green above boom line, red below bust line, position-color for middle. Caveat annotation explaining boom/bust criteria. Below histogram: horizontal bar showing floor-median-ceiling range with position color gradient.
**Attempts**: 0
**Notes**:

## Task 4: PNG export of boom/bust report
**Status**: PENDING
**Acceptance**: "Export Boom/Bust PNG" button generates canvas-rendered PNG: header "BOOM/BUST PROFILE — [Name]", position badge, grade sticker, stat cards row (median, floor, ceiling, boom%, bust%), histogram chart, floor-ceiling range bar, razzle.lol watermark. Downloads as razzle-boombust-[name].png.
**Attempts**: 0
**Notes**:

## Task 5: Deploy + smoke test
**Status**: PENDING
**Acceptance**: node -c lab.js passes. py_compile passes on server.py and live_data.py. All function references verified (loadBoomBust, renderBoomBust, drawBoomBustHistogram, exportBoomBustImage). Backend endpoint exists at /api/players/{id}/boom-bust. No design rule violations.
**Attempts**: 0
**Notes**:

---

## Loop State
```
Current Phase: 60
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/5
```
