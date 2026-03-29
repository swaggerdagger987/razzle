---
id: S1-002
severity: S1
category: ux-flow
title: "Lab sidebar overwhelms new users with 70+ panels and no guided onboarding"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S1-002: Lab sidebar overwhelms new users with 70+ panels

## Finding

The Lab sidebar lists 70+ panels across 10 categories. New users see a wall of panel names with no guided onboarding, no "Start Here" tutorial, and no progressive disclosure beyond category collapse.

## Root Cause

**File: `frontend/lab.html:4087-4091`** — `FREE_PANELS` defines only 11 free panels out of 70+:

```javascript
var FREE_PANELS = {
  screener: true, rankings: true, tiers: true, tradevalues: true,
  cheatsheet: true, breakouts: true, weekly: true, prospects: true,
  dashboard: true, leaders: true, 'career-compare': true
};
```

The sidebar HTML (lab.html, search for `lab-sidebar`) renders all panels in categories. Categories are collapsible but all open by default.

## Suggested Fix

1. Add a "New to Razzle?" onboarding card at the top of the sidebar with 3-5 recommended starter panels
2. Collapse all sidebar categories by default, auto-open "Forever Free" category
3. Add "Popular" badges to high-value panels (Trade Values, Weekly Heatmap, Breakouts)
4. Consider a "Quick Start" panel that walks through the screener basics

## Impact

New visitors landing on the Lab may feel paralyzed by choice. The North Star says the Screener must be genuinely best-in-class as a free tool, but discoverability is poor when free panels are buried in a list of 70.

## Acceptance Criteria

- [ ] First-time Lab visitors see clear guidance on where to start
- [ ] Sidebar categories collapsed by default (except "Forever Free")
- [ ] At least 3 panels have "Popular" or "Start Here" visual indicators
