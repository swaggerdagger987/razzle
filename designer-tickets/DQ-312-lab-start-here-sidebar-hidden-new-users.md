---
id: DQ-312
title: Lab START HERE sidebar section hidden by default — new users never see it
priority: P1
category: feature-discoverability
page: lab.html
---

## Problem
The Lab sidebar has a "START HERE" section (lab.html line 3177) with 5 guided entry points: Screener, Dynasty Rankings, Trade Values, Breakouts, Compare. But it's set to `display:none` and no code in lab.js ever shows it for new users.

Meanwhile, the first-visit onboarding toast (lab.js line 1170) says "explore panels in the sidebar" — but the sidebar shows Favorites and Recent (both empty for a new user) instead of START HERE.

A new visitor sees 70+ panels with zero guidance. The guided entry points exist but are invisible.

## Expected
On first visit (`!localStorage.getItem('razzle_shortcuts_shown')`), show the START HERE section. Hide it once the user has visited 3+ panels or manually collapses it.

## Fix
- `frontend/lab.js` init: when `!hasVisited`, set `document.getElementById('sidebarStartHere').style.display = ''`
- Optionally hide after N panel visits via localStorage counter

## Files
- `frontend/lab.html` line 3177 (START HERE section)
- `frontend/lab.js` ~line 1170 (first-visit detection)
