<!-- PM: ready -->
---
id: DES-445
priority: P0
area: error recovery
section: Lab panels
type: bug
status: open
---

# 10+ lab-panels.js catch handlers are empty — loading state hangs forever

## What's wrong

Multiple panel fetch `.catch()` handlers in lab-panels.js have empty bodies — `.catch(function() {})`. When an API call fails, the loading state ("studying the film...") stays visible indefinitely. The user thinks data is still loading when it's actually failed.

This is distinct from DQ-361 (error messages bypass razzleError) — those at least SHOW an error. These show NOTHING.

## Where

Empty catch handlers in `frontend/lab-panels.js`:
- Line 332: `.catch(function() {});`
- Line 749: `.catch(function() {});`
- Line 1027: `.catch(function() {});`
- Line 1099: `.catch(function() {});`
- Line 1239: `.catch(function() {});`
- Line 1371: `.catch(function() {});`

Compare to panels that DO handle errors (lines 1544, 1699, 1903, 2002, etc.):
```javascript
.catch(function() { body.innerHTML = '<div class="lp-error">' + razzleError() + '</div>'; });
```

## Fix

Replace all empty `.catch(function() {})` with:
```javascript
.catch(function() { body.innerHTML = '<div class="lp-error">' + razzleError() + '</div>'; });
```

Same pattern already used by 15+ other panels in the same file.

## Why it matters

P1 because this is a silent failure. Users see "studying the film..." forever and think the product is slow/broken. They'll leave before ever seeing content. The fix is copy-paste from the panels that already handle this correctly.
