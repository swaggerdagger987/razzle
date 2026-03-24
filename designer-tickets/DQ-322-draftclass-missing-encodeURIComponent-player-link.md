---
id: DQ-322
title: draftclass.html missing encodeURIComponent on player ID in link
priority: P2
category: broken-navigation
page: draftclass.html
---

## Problem
draftclass.html navigates to player profiles without encoding the player ID:

**draftclass.html line 552:**
```js
if (pid) window.location.href = '/player/' + pid;
```

**Every other page using /player/ pattern:**
```js
window.location.href = '/player/' + encodeURIComponent(pid);
```

Player IDs with special characters (periods, slashes, spaces) will produce broken URLs. While most nflverse gsis_ids are alphanumeric, college/prospect IDs or edge cases could contain characters that break URL routing.

## Expected
```js
if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
```

## Fix
- `frontend/draftclass.html` line 552: wrap `pid` in `encodeURIComponent()`

One function call addition.

## Files
- `frontend/draftclass.html`
