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

## Root Cause

**URL parameter check** — `frontend/team.html:407-410`:
```js
// Checks for team in URL path /team/{abbr}
```

**Dropdown population** — `frontend/team.html:454-515`:
- Dropdown starts with "pulling film..." placeholder text (line 308, 311)
- Relies on API response to populate team list
- No default team selected, no team grid shown

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
