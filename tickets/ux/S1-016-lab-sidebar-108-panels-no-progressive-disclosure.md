---
id: S1-016
severity: S1
category: ux
title: Lab sidebar has 108 panels across 10 categories — new users drown in options
source: deep-audit
status: open
---

## Problem

The Lab sidebar lists 108 panel items across 10 categories. A new user sees a massive wall of panel names. While a "Start Here" card exists (auto-shown for users with <5 panel visits), it's hidden by default and only partially addresses the discoverability problem.

The North Star says "the Screener must be genuinely best-in-class as a free tool" — but free panels are buried in a list of 108.

## Root Cause

**Panel definitions** — `frontend/lab.html:3199-3288`: 10 category sections with 108 total `lab-sidebar-item` elements.

**Start Here card** — `frontend/lab.html:4602-4613`: Exists but hidden by default, auto-shows only for new users with fewer than 5 panel visits, auto-dismisses after 5 visits.

## Fix Options

1. **"Staff Picks" badges** on the 5-7 most useful free panels (sticker-chip style)
2. **Collapse all categories by default**, expand "Forever Free" on first visit
3. **"Most Popular" sort option** in sidebar based on analytics pageview counts
4. **Progressive panel reveal** — show only free panels to new users, expand full list after 5+ sessions

## Accept When

- A first-time user can find the most valuable free panels within 10 seconds
- The sidebar does not overwhelm with 108 items on first load
- Existing power users can still access all panels without friction
