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

## Root Cause (UPDATED 2026-03-29 — code investigation)

**Panel definitions** — `frontend/lab.html:3212-3304`: 12 category sections with **68 total** `lab-sidebar-item` elements (not 108 as originally reported).

**Categories** (12 total):
- Forever Free header: `lab.html:3212`
- Free panels (10 items): `lab.html:3216`
- Pro header: `lab.html:3228`
- Rankings & Values (9): `lab.html:3230`
- Performance (10): `lab.html:3241`
- Game Analysis (8): `lab.html:3253`
- Trends & Projections (5): `lab.html:3263`
- College (3): `lab.html:3272`
- Player Tools (9): `lab.html:3277`
- League Tools (5): `lab.html:3288`
- Records & History (4): `lab.html:3295`
- Teams (3): `lab.html:3301`

**Progressive disclosure ALREADY EXISTS** (partial):
- **Start Here card**: `lab.html:3195-3204` — 5 recommended panels with hints, auto-shows for first 5 visits
- **Start Here logic**: `lab.html:4625-4647` — `_trackStartHere()` tracks visits, auto-dismisses
- **Category collapse**: `lab.html:4876-4947` — Pro categories auto-collapse on first visit (`lab.html:4904-4910`), Free stays expanded
- **Chevron toggles**: `lab.html:4895-4900` — dynamic `▾` chevrons, saved to localStorage
- **First visit detection**: `lab.html:4888` — checks `Object.keys(saved).length === 0 && !localStorage.getItem('razzle_lab_visited')`

**What's still missing**:
- No "Staff Picks" or "Most Popular" badges
- No role-based view (all users see same layout after onboarding)
- No analytics-driven reordering
- Start Here only surfaces 5 panels; no guidance beyond initial discovery

## Fix Options

1. **"Staff Picks" badges** on the 5-7 most useful free panels (sticker-chip style)
2. **Collapse all categories by default**, expand "Forever Free" on first visit
3. **"Most Popular" sort option** in sidebar based on analytics pageview counts
4. **Progressive panel reveal** — show only free panels to new users, expand full list after 5+ sessions

## Accept When

- A first-time user can find the most valuable free panels within 10 seconds
- The sidebar does not overwhelm with 108 items on first load
- Existing power users can still access all panels without friction
