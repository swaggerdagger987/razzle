# Razzle Loop — Phase 65 Task List

> Team Roster Pages — Visual Roster Breakdown by Team

**Current Phase**: 65 — Team Roster Pages
**Exit Criterion**: /team/{abbr} pages show full fantasy-relevant roster organized by position (QB, RB, WR, TE). Each position group rendered as a comic-strip card with player rows showing headshot/initials, name, position badge (color-coded), age badge (green/yellow/red), key stats (PPG, games, yards, TDs) in mono font. Team header with team name in display font and Caveat annotation. Team selector dropdown to switch between all 32 NFL teams. Click player row → navigate to /player/{id}. Team links added to player profile pages and screener team column. Nav link "Teams" on all pages. Design matches DESIGN.md: sand bg, chunky 3px borders, 4px offset shadows, position colors, Space Mono for data, display font for headers, Caveat for annotations.

---

## Task 1: Backend — team roster endpoint
**Status**: PENDING
**Attempts**: 0
**Notes**: GET /api/team-roster?team={abbr}&season= in server.py. fetch_team_roster() in live_data.py — queries players table joined with season stats. Returns players grouped by position (QB/RB/WR/TE) with key stats (PPG, games, total yards, TDs, age). Available teams list for dropdown. Available seasons for selector.

## Task 2: Frontend — team.html page with position group cards
**Status**: PENDING
**Attempts**: 0
**Notes**: Full page with position group cards (QB, RB, WR, TE sections). Each card: position name in display font with position color top stripe, Caveat annotation, player rows with headshot/initials fallback, name, age badge (green ≤25, yellow 26-28, red ≥29), key stats in mono font. Cards have 3px ink borders, 4px offset shadows. Click player row → navigate to /player/{id}. Team selector dropdown + season selector. Team header with team name. Sand bg, card bg, all fonts correct per DESIGN.md.

## Task 3: Nav links + team links from profiles + sitemap
**Status**: PENDING
**Attempts**: 0
**Notes**: "Teams" nav link added to all HTML pages. Team column in Lab screener links to /team/{abbr}. Player profile pages show team name as clickable link to team page. Sitemap updated. URL routing handles /team/{abbr} pattern.

## Task 4: Smoke test + verification
**Status**: PENDING
**Attempts**: 0
**Notes**: Python syntax valid. JS syntax valid. All HTML pages have Teams nav link. Design matches DESIGN.md. XSS safe. Route order clean.

---

## Loop State
```
Current Phase: 65
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/4
```
