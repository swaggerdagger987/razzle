---
id: DES-442
priority: P2
area: UX
section: standalone panels
type: error-state
status: epic-decomposed
sub_tickets: [102, 103, 104, 105]
absorbs: DES-444
---

<!-- EPIC: Decomposed into open/102-105. Also absorbs DES-444 (retry buttons). -->
<!-- Root cause cluster: 001 (P0 silent failure) + 102-105 (visual distinction) -->

# Error state and empty state visually indistinguishable in standalone panels

## What's wrong

When a standalone panel API fails vs when it returns zero results, the user sees the same visual treatment. There's no way to tell "the server is down, retry" from "no players match this filter, adjust it."

Lab screener differentiates: empty state shows hints like "try loosening those filters" and has a reset link. But standalone panels (breakouts, aging, matchups, etc.) use identical styling for both states.

## Where

- `frontend/breakouts.html:548` — API error: `<div class="breakouts-empty">` + `razzleError()`
- `frontend/breakouts.html:555` — empty results: `<div class="breakouts-empty">` + generic text
- `frontend/aging.html:745` — error and empty both use same `razzleError()` text
- `frontend/matchups.html:591` — same pattern
- `frontend/lab-panels.js` — `.lp-error` class used for both error and empty across 20+ panels

## Fix

Create two distinct visual states:

1. **Error state** (API failed): Red-tinted border, retry button, "fumbled the data" text
   ```html
   <div class="panel-error">
     <span class="panel-error-icon">fumbled the data fetch</span>
     <button class="btn-chunky" onclick="location.reload()">retry</button>
   </div>
   ```

2. **Empty state** (no results): Neutral, hint text, filter suggestion
   ```html
   <div class="panel-empty">
     <span>the film room's empty for this filter</span>
     <span class="hint">try a different position or season</span>
   </div>
   ```

## Why it matters

A first-time Reddit visitor hitting a Render cold-start timeout sees "error" and thinks the product is broken. If they knew it was a retry situation (not a "no data" situation), they'd hit retry instead of bouncing.
