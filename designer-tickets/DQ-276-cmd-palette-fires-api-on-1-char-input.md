# DQ-276: Command palette fires API search on 1-character input — no minimum threshold

**Priority**: P2 — Wasteful API calls and noisy results
**Category**: UX / Performance
**Severity**: MEDIUM — Typing "a" triggers search returning 100+ players

## Problem

app.js lines 1449-1457: The command palette (Ctrl+K) debounces search by 300ms but has no minimum character count. Typing a single character immediately queues an API call to `/api/players/quick-search?q=a` which returns dozens of results — too many to be useful and wastes server resources.

```javascript
_cmdDebounce = setTimeout(function() { cmdSearch(q); }, 300);
```

No check for `q.length >= 2` before scheduling the search.

## Fix

Add minimum character threshold before firing:
```javascript
if (q.length < 2) { /* show "type 2+ characters" hint */ return; }
_cmdDebounce = setTimeout(function() { cmdSearch(q); }, 300);
```

## Files
- `frontend/app.js` lines 1449-1457
