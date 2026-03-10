# Razzle Loop — Phase 97 Task List

> Dynasty Roster Builder — Build and grade a hypothetical roster

**Current Phase**: 97 — Dynasty Roster Builder
**Exit Criterion**: /rosterbuilder.html page lets users add players via autocomplete search to build a hypothetical dynasty roster (up to 25 slots). Shows live roster grade (A+ to F) based on composite score (trade value, VORP, age balance, positional depth). Visual breakdown cards for each dimension. Position group summaries. Total roster trade value. PNG export with watermark.

---

## Task 1: Backend /api/roster-grade endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: POST /api/roster-grade accepts player_ids array, reuses compute_trade_value + VORP thresholds, returns overall_grade/score, 4 dimension scores (trade_value, vorp, age_balance, positional_depth), position_summary, per-player details. Grade thresholds A+ (95) to F (<40). fetch_roster_grade added to live_data.py.

## Task 2: Roster Builder page (frontend/rosterbuilder.html)
**Status**: PASS
**Attempts**: 1
**Notes**: Player search autocomplete (quick-search API), add/remove players, live grade card (big letter grade + score), dimension progress bars (colored by metric), position group summary grid (QB/RB/WR/TE count + avg TV + VORP), per-player rows with headshot/pos/name/team/age/TV/VORP. Clear/Export/Share URL buttons. URL state (?players=id1,id2). 14 escapeHtml calls, 58/58 braces balanced.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Roster Builder" nav link added to all 35 HTML pages (nav + footer). 32/32 nav links consistent. Sitemap entry. Analytics tracking. Added to tools-hub catalog under Team & League.

## Task 4: Smoke test
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid. JS braces balanced (58/58). 14 escapeHtml. All 35 pages have /rosterbuilder.html link. 14/14 design checks pass. Hover-lift fixed on action buttons.

---

## Loop State
```
Current Phase: 97
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
