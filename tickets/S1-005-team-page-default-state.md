---
id: S1-005
severity: S1
category: ux-flow
title: "Team page default state when no team specified"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S1-005: Team page needs a default state when no team is specified

## Finding

The deep audit says the team page loads with an empty state requiring manual team selection from a dropdown, with no visual roster grid.

## Root Cause Investigation

**Status: Already handled in current code.**

**File: `frontend/team.html:754-758`**

```javascript
if (!state.team) {
  showTeamPicker();
} else {
  loadTeam();
}
```

When no team parameter is in the URL, `showTeamPicker()` immediately displays an interactive 32-team grid organized by division (team.html:461-494). Users click any team to navigate to that team's roster page.

This is not an empty dropdown — it's a full team picker interface.

## Conclusion

This issue appears resolved. The team page shows an interactive team picker when no team is specified.

**Verify**: Visit razzle.lol/team without params and confirm the team picker grid appears.

## Acceptance Criteria

- [x] Team page without URL params shows 32-team picker grid
- [x] Clicking a team loads that team's roster
- [ ] Verify on live deploy
