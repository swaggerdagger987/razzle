# DQ-124: 42 localStorage calls without try-catch — incognito mode breaks features

**Priority**: P2 — MEDIUM
**Category**: Robustness
**Scope**: 5 frontend JS files

## Problem

42 localStorage.getItem()/setItem() calls are not wrapped in try-catch. In private/incognito mode, some browsers throw exceptions on localStorage access. Safari in private mode throws QuotaExceededError on any setItem(). This silently breaks:

- Theme persistence (app.js)
- Auth token storage (app.js, formulas.js)
- Screener state restore (lab.js)
- Agent memory and BYOK config (warroom.js — 9 calls)
- Column width persistence (lab.js)

## Counts by file

| File | Unprotected calls |
|------|------------------|
| app.js | 12 |
| warroom.js | 9 |
| lab.js | 8 |
| lab-panels.js | 8 |
| formulas.js | 5 |

## Impact

The Situation Room (warroom.js) is worst-hit: 9 unprotected calls means the entire agent memory, API key config, and Bureau bridge prefill break in incognito. This is the $240/yr product.

## Fix

Create a safe wrapper in app.js:

```js
function safeGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) { /* silent */ }
}
```

Replace all 42 raw calls with safeGet/safeSet. Or wrap each in try-catch individually.
