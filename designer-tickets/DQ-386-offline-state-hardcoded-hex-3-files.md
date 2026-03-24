---
id: DQ-386
title: Server-offline fallback messages use hardcoded #6b5a4e/#a89585 — dark mode invisible
priority: P2
category: dark mode / design system
page: agents.html, lab.html, league-intel.html
status: open
cycle: 50
---

## Problem

Three pages have a "server offline" fallback state with fully inline-styled divs using hardcoded hex colors (`#6b5a4e` and `#a89585`). These are warm browns that work on the light sand background but become invisible on the dark espresso background in dark mode.

## Evidence

- `agents.html:1604` — `color:#6b5a4e;` (heading)
- `agents.html:1607` — `color:#a89585;` (subtitle "the agents are napping without power...")
- `lab.html:3155` — `color:#6b5a4e;` (heading)
- `lab.html:3158` — `color:#a89585;` (subtitle "pulling film requires electricity...")
- `league-intel.html:1960` — `color:#6b5a4e;` (heading)
- `league-intel.html:1963` — `color:#a89585;` (subtitle "intel doesn't gather itself...")

All 6 instances use fully inline styles including font-family, padding, text-align — no CSS class.

## Fix

Replace inline color hex with CSS variables:

```html
<!-- Before -->
<div style="color:#6b5a4e;">
<!-- After -->
<div style="color:var(--ink-medium);">

<!-- Before -->
<p style="color:#a89585;">
<!-- After -->
<p style="color:var(--ink-light);">
```

Better: extract a `.server-offline` CSS class in styles.css to replace all inline styles.

## Verification

1. Stop the backend server
2. Load each page in dark mode
3. Offline message text should be readable against dark background
