---
id: S2-005
severity: S2
category: ux-flow
title: "Lab toolbar visual complexity"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S2-005: Lab toolbar is visually complex at desktop width

## Finding

The Lab toolbar has many controls, making it visually dense for new users.

## Root Cause

**File: `frontend/lab.html:3335-3430`**

The toolbar contains 14 main buttons/controls:
- Search box, Columns, Formulas, + Filter (primary row)
- Undo/Redo (history controls)
- Tools dropdown (containing 4 subsections):
  - View section (7 controls): Charts, Compare, Watchlist, My Roster, Save View, etc.
  - Export section (3 controls): CSV, Share, Export Rankings
  - Display section (11 controls): Fantasy Relevant, Heat, Pctl, Bars, Top 3, etc.
  - Analysis section (6 controls): Trade, Formula Store, Tags, etc.

Export actions are already grouped in the Tools dropdown (lab.html:3396-3398), which is the right approach.

## Assessment

This is a UX observation rather than a bug. The toolbar is complex because the Lab IS complex (100+ columns, 70+ panels). Power users expect dense toolbars. The Tools dropdown already groups secondary actions.

**Optional enhancement**: Consider a "simple mode" toggle that hides everything except Search, Columns, + Filter, and Export.

## Acceptance Criteria

- [ ] No action required (or optionally add simple mode toggle)
