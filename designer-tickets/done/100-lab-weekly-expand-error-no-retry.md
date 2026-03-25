<!-- PM: ready -->
---
id: DES-448
priority: P3
area: error recovery
section: Lab screener
type: ux-gap
status: open
---

# Lab weekly row expand error has no retry or re-expand affordance

## What's wrong

When a user clicks a rank number to expand a player's weekly breakdown and the API call fails, the expand row shows `razzleError()` text but no retry button. The user has no way to re-attempt the expansion without reloading the entire page.

Worse: the row may remain in `expandedRows` state, so clicking the rank number again might toggle it closed rather than retrying the fetch.

## Where

`frontend/lab.js:2431`:
```javascript
console.error("Weekly expand error:", err);
expandTr.querySelector(".expand-content").textContent = razzleError();
```

## Fix

Add a retry button inside the expand row:
```javascript
expandTr.querySelector(".expand-content").innerHTML =
  razzleError() + ' <button class="btn-chunky" onclick="retryExpand(\'' + playerId + '\')">retry</button>';
```

And add a `retryExpand()` function that removes the player from `expandedRows` and re-triggers the expand.

## Why it matters

Row expansion is a power-user feature. Power users notice when error states are dead-ends. A retry button shows the product handles failure gracefully.
