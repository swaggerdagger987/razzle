<!-- PM: ready -->
# DQ-411: Lab panels fetch requests not aborted on panel switch

**Priority**: P1
**Category**: Interaction Lifecycle
**Files**: `frontend/lab-panels.js`

## Problem

lab-panels.js has 30+ `fetch()` calls across all panel render functions. None of them use `AbortController`. When a user clicks a panel in the sidebar, the fetch starts. If the user clicks a different panel before the fetch completes:

1. The old fetch completes silently in the background
2. Its `.then()` callback runs `contentEl.innerHTML = ...` on the now-hidden panel
3. State mutations (e.g., `state.data = data`) update the wrong panel's state
4. Memory accumulates from orphaned promises

## What the user sees

- Click Rankings panel, it starts loading
- Click Trade Values before Rankings finishes
- Trade Values loads and displays
- Rankings fetch completes silently, mutates Rankings state in background
- Go back to Rankings: may see stale data, or the panel has already rendered with the wrong data

## Fix

Wrap all panel fetches with AbortController. On `switchPanel()`, abort any pending controller:

```javascript
var controller = new AbortController();
fetch(url, { signal: controller.signal }).then(...)
// Before panel hide:
controller.abort();
```

## Scope

30+ fetch calls in lab-panels.js need AbortController signals. Store one controller per panel in the registry object.
