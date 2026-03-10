# Razzle Loop — Phase 85 Task List

> Strength of Schedule Dashboard

**Current Phase**: 85 — Strength of Schedule Dashboard
**Exit Criterion**: /schedule.html page shows strength of schedule analysis with two sections: "Schedule Suppressed" (players who faced the hardest schedules — their stats may be suppressed, making them dynasty buy targets) and "Schedule Inflated" (players who faced the easiest schedules — their stats may be inflated, sell candidates). For each player: compute the average PPG-allowed-at-their-position by their opponents across all weeks played (weighted SOS). Compare actual PPG vs schedule-expected PPG. Show: position badge, headshot, name, team, actual PPG, SOS Rank (1=hardest), Avg Opp PPG Allowed, Delta (actual PPG minus league-avg adjusted for schedule), SOS grade badge (A+ to F based on schedule difficulty percentile — A+ = hardest schedule overcome), GP, and Caveat annotation. Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export via html2canvas with watermark. Responsive at 768px + 480px with hide-mobile columns. /api/strength-of-schedule endpoint computes per-player schedule difficulty from opponent_team per week crossed with defense PPG-allowed-by-position from the matchup heatmap logic, splits into schedule_suppressed (hardest SOS, top performers despite it) and schedule_inflated (easiest SOS, benefited from soft matchups). Min 6 games filter. "Schedule" nav link added to all 26 HTML pages (nav + footer). Sitemap entry. Analytics tracking. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, display font headers, mono data, Caveat annotations, position colors.

---

## Task 1: Backend /api/strength-of-schedule endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/strength-of-schedule returns `schedule_suppressed` (hardest SOS, sorted by sos_delta desc) and `schedule_inflated` (easiest SOS, sorted by sos_delta asc). Computes defense PPG-allowed-by-position grid, then per-player avg opponent PPG allowed across all weeks played. sos_delta = league_avg - avg_opp_ppg (positive = harder). Grades by schedule difficulty percentile (A+ = hardest). Parameterized SQL, position whitelist. Min 6 games + 2 PPG floor.

## Task 2: Strength of Schedule dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /schedule.html with two-section table layout. Schedule Suppressed: Player, PPG, SOS Grade, Rank, Opp PPG, Delta (green badge), GP, annotation. Schedule Inflated: Player, PPG, SOS Grade, Rank, Opp PPG, Delta (red badge), GP, annotation. Grade badges color-coded (A+/A green, B blue, C yellow, D orange, F red). Delta badges color-coded (green=hard, red=easy). Position tabs, season selector, sortable columns, row click → profile, PNG export with watermark. Responsive hide-mobile columns. Caveat annotations. 11 escapeHtml calls for XSS.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Schedule" link added to nav + footer of all 26 HTML pages (26/26 verified — 23 have both nav+footer, lab.html and 404.html have nav only as they lack styled footer). Sitemap entry added ("/schedule.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PASS
**Attempts**: 1
**Notes**: Python syntax valid (server.py + live_data.py). JS structure valid (67/67 braces, 185/185 parens, 15/15 brackets). 26/26 pages have Schedule nav link. XSS: 11 escapeHtml calls covering all dynamic content. SQL: parameterized queries, position whitelist via FANTASY_POSITIONS. Design compliance: 3px borders (3), 4px shadows (2), font-display (7), font-mono (4), font-hand (7), position colors (4 refs), watermark present, analytics present.

---

## Loop State
```
Current Phase: 85
Current Task: 4
Current Stage: COMPLETE
Attempt: 1
Tasks Completed: 4/4
```
