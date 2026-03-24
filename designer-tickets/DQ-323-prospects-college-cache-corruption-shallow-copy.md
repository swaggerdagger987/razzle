---
id: DQ-323
title: Prospects and College fetches don't deep-clone items — cache corruption
priority: P2
category: data-bug
page: lab.html
---

## Problem
The NFL fetch path deep-clones API response items to prevent cache corruption:

**lab.js line 1334 (NFL — correct):**
```js
state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });
```

But Prospects and College paths assign the raw reference:

**lab.js line 1392 (Prospects — broken):**
```js
state.items = data.items || [];
```

**lab.js line 1439 (College — broken):**
```js
state.items = data.items || [];
```

The query cache (`_queryCache`) stores `data` by reference (line 1325: `_queryCachePut(cacheKey, data)`). When subsequent code mutates `state.items` (e.g., `applySecondarySort()` sorts in-place at line 1396/1443), it also mutates the cached data. Next time the same query is served from cache, items are in the wrong sort order.

## Expected
Both paths should deep-clone like the NFL path:
```js
state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });
```

## Fix
- `frontend/lab.js` line 1392: add `.map(function(p) { return Object.assign({}, p); })`
- `frontend/lab.js` line 1439: add `.map(function(p) { return Object.assign({}, p); })`

Two line changes.

## Files
- `frontend/lab.js`
