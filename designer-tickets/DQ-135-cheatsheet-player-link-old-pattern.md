---
id: DQ-135
priority: P3
area: navigation
section: cheatsheet
type: inconsistency
status: open
---

# Cheatsheet player link uses old /player.html?id= pattern

## What's wrong

`cheatsheet.html` (line 461) navigates to player profiles using:
```js
window.location.href = '/player.html?id=' + encodeURIComponent(el.dataset.pid);
```

Every other page in the codebase (40+ references) uses the client-side route pattern:
```js
window.location.href = '/player/' + encodeURIComponent(el.dataset.pid);
```

## Where

- `frontend/cheatsheet.html` line 461

## Fix

Change to:
```js
window.location.href = '/player/' + encodeURIComponent(el.dataset.pid);
```

## Why this matters

Inconsistent URL patterns confuse browser history, break shared URLs, and make the codebase harder to maintain. A user sharing a cheatsheet player link gets a different URL format than from any other page.
