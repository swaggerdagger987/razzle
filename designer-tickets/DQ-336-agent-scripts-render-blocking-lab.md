---
id: DQ-336
title: agent-config.js + agent-nudges.js render-blocking in Lab (no defer)
priority: P3
category: performance
page: lab.html
cycle: 44
---

## Problem

Lab.html loads 8 scripts. Three are render-blocking (no `defer` or `async`):

```html
<!-- lab.html lines 4038-4040 — render-blocking -->
<script src="app.js"></script>
<script src="agent-config.js"></script>      <!-- 8KB, non-critical -->
<script src="agent-nudges.js"></script>      <!-- 8KB, non-critical -->

<!-- lab.html lines 4041-4045 — properly deferred -->
<script defer src="lab.js"></script>
<script defer src="formulas.js"></script>
<script defer src="formula-store.js"></script>
<script defer src="charts.js"></script>
<script defer src="lab-panels.js"></script>
```

`agent-config.js` defines `AGENT_TERRITORY` (agent metadata for sidebar badges and panel attributions). `agent-nudges.js` defines upgrade nudge logic. Neither is needed for initial render — the sidebar, toolbar, and screener panel all render before any agent badge is applied.

16KB of JavaScript parsing and execution blocks the first paint of the Lab — the highest-traffic page.

## Expected

Both scripts should load with `defer` since they're not needed until after DOM is interactive.

## Fix

```html
<script src="app.js"></script>
<script defer src="agent-config.js"></script>
<script defer src="agent-nudges.js"></script>
```

Two attribute additions. 30 seconds. Saves ~50-100ms of blocking time on initial Lab load.

## Files
- `frontend/lab.html` (lines 4039-4040)
