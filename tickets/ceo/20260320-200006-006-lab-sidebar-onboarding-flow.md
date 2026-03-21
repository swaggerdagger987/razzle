---
id: 20260320-200006-006
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Lab
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## The Lab sidebar shows 70+ panels with no guided path for new users

**PRIORITY: P1** | **Type: structural**
**Page**: lab.html
**Found by**: Razzle (CEO Review)

The Lab sidebar is a massive list of 70+ panels organized by category. For a power user who knows what they want, this is great. For a first-time visitor who just clicked "Open the Screener" from the landing page, it's overwhelming.

There's no "start here" moment. No guided path. No indication of which panels are most popular, which ones are the must-see, or what order to explore them in.

The Screener itself loads by default, which is correct. But once a user finishes their first screener session and looks at the sidebar, they need guidance -- not a phone book.

**BEFORE** (what it is now):
- Sidebar shows all 70+ panels in flat categories
- "FOREVER FREE" and "PRO" sections delineated
- No popularity indicators, no "start here" callout, no recommended path
- Recently viewed and Favorites sections (good but empty for new users)

**AFTER** (what it should be):
- Add a "Start Here" section at the top of the sidebar (above Recently Viewed) for first-time visitors (detect via localStorage flag)
- "Start Here" shows 5 recommended panels: The Screener, Dynasty Rankings, Trade Values, Breakout Finder, Compare
- Each recommendation has a one-line description in Caveat font: "find your next sleeper," "know what your roster is worth," etc.
- After the user has visited 5+ panels, the "Start Here" section auto-collapses and stays collapsed (localStorage)
- Add subtle popularity indicators: a small dot or badge next to the 10 most-visited panels (can be hardcoded initially, analytics-driven later)
- Keep the full panel list below exactly as-is -- power users shouldn't lose anything

**WHY**: The Lab's depth is its strength and its weakness. 70+ panels is impressive as a number on a pricing page. But in the sidebar, it's a wall. First-time users need a guided on-ramp that shows them the best 5 panels and then gets out of the way. This is the difference between "wow this has everything" and "I don't know where to start so I'll close the tab."

### Task 1: Add a "Start Here" section for first-time Lab visitors
**Accept when**: New visitors (no localStorage flag) see a 5-panel "Start Here" section at the top of the sidebar. After visiting 5+ panels, it auto-collapses. Power users see no change to the existing sidebar structure.
