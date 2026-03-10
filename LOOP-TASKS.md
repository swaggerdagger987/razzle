# Razzle Loop — Phase 89 Task List

> Player Report Card — Composite Fantasy GPA

**Current Phase**: 89 — Player Report Card Dashboard
**Exit Criterion**: /reportcard.html page shows player report cards aggregating all Razzle grading systems into a composite "Fantasy GPA." Two sections: "Honor Roll" (highest composite GPA, top performers across all metrics) and "Needs Improvement" (lowest composite GPA among fantasy-relevant starters). Each player row: position badge, headshot, name, team, Fantasy GPA badge (A+ to F, color-coded), Efficiency grade, Consistency grade, SOS grade, Stock Score (0-100), Opp Share %, Dominator Rating, PPG, Age, GP, Caveat annotation. Composite GPA = weighted average of efficiency percentile (20%), consistency percentile (20%), SOS percentile (20%), stock score (20%), opportunity share percentile (20%). Position filter tabs (All/QB/RB/WR/TE). Season selector. Sortable columns with sort state tracking per section. Click player row → player profile. PNG export with watermark. Responsive at 768px + 480px. /api/report-cards endpoint computes all sub-grades and composite GPA. Min 6 games + 2 PPG + 50 opps filter. Nav links on all 29 pages. Sitemap entry. Analytics tracking. Design matches DESIGN.md.

---

## Task 1: Backend /api/report-cards endpoint
**Status**: PASS
**Attempts**: 1
**Notes**: GET /api/report-cards returns `honor_roll` and `needs_improvement` arrays. Computes per-player: efficiency grade (PPO percentile), consistency grade (inverse CoV percentile), SOS grade (schedule difficulty percentile), stock score (0-100 composite), opportunity share percentile, dominator rating. Composite GPA = weighted avg of 5 percentiles (PPO 20%, inv CoV 20%, SOS 20%, PPG 20%, opp share 20%) → letter grade A+ to F with B+/C+ granularity. Min 6 games + 2 PPG + 50 opps. Parameterized SQL. Fantasy_relevant filter. Season parameter. Python syntax valid.

## Task 2: Report Card dashboard page (frontend)
**Status**: PASS
**Attempts**: 1
**Notes**: /reportcard.html with two-section layout. Honor Roll (green header) and Needs Improvement (red header). Each row: position badge, headshot, name, team, GPA badge (A+ to F, 5-tier color), Eff/Con/SOS grade mini-badges, Stock Score badge, Opp%, Dom Rating, PPG, Age, GP, annotation. Position tabs, season selector, sortable columns with per-section state, row click to profile, PNG export with watermark. 11 escapeHtml calls. Braces/parens/brackets all balanced. Responsive hide-mobile. Design compliant: 3px borders, 4px shadows, font-display headers, font-mono data, font-hand annotations.

## Task 3: Nav links + sitemap + analytics
**Status**: PASS
**Attempts**: 1
**Notes**: "Report Card" link added to nav + footer of all 29 HTML pages (29/29 verified). Sitemap entry added ("/reportcard.html", "0.8", "weekly"). Analytics pageview tracking via inline fetch to /api/analytics/pageview.

## Task 4: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Notes**: Python syntax check (server.py + live_data.py). JS brace/paren/bracket balance. Nav link count verification (29/29). XSS escapeHtml audit. Sitemap entry present. Design compliance check.

---

## Loop State
```
Current Phase: 89
Current Task: 4
Current Stage: TEST
Attempt: 1
Tasks Completed: 3/4
```
