---
id: S1-018
severity: S1
category: ux
title: Team page shows blank state when no team parameter provided — needs team picker grid
source: deep-audit
status: open
---

## Problem

When visiting `/team.html` without a team parameter in the URL, the page shows "pulling film..." loading text and a dropdown that says "pulling film..." until the API responds. There is no team picker grid, no popular team suggestions, and no engaging default state.

Users clicking "Team Rosters" from the tools hub see a blank page with a dropdown instead of a browsable team experience.

## Root Cause (UPDATED 2026-03-29 — code investigation)

**URL parameter check** — `frontend/team.html:520-523`:
```js
var pathMatch = window.location.pathname.match(/\/team\/([A-Za-z]+)/);
if (pathMatch) { state.team = pathMatch[1].toUpperCase(); }
```

**Initial load decision** — `frontend/team.html:754-758`:
```js
if (!state.team) { showTeamPicker(); } else { loadTeam(); }
```
When no team param, `showTeamPicker()` IS called — so a team picker exists.

**Dropdown population** — `frontend/team.html:359-364`:
- Dropdown starts with "pulling film..." placeholder text (line 359)
- Populated from API response at lines 598-609

**Empty state** — `frontend/team.html:635-637`:
```js
if (!totalPlayers) { content.innerHTML = '<div class="team-empty">no fantasy-relevant players found</div>'; }
```

**Backend default** — `backend/live_data/players.py:860-862`:
```python
if not team or team.upper() not in available_teams:
    team = available_teams[0] if available_teams else "KC"
```
Backend silently defaults to first alphabetically available team if none specified.

**The actual gap**: `showTeamPicker()` exists but is a basic dropdown, not an engaging 32-team grid. The UX issue is that the team picker is a single `<select>` element rather than a visual browsable experience.

## Fix

When no team parameter is provided, show a 32-team picker grid:
- 4x8 grid of team cards with team colors and abbreviations
- Click a team card to navigate to `/team/{abbr}`
- Group by division (AFC East, AFC North, etc.)
- Each card shows team name and maybe record

## Accept When

- `/team.html` (no parameter) shows a browsable 32-team grid
- Clicking a team card navigates to that team's roster page
- The dropdown still works as an alternative navigation method
