---
id: S1-030
severity: S1
confidence: HIGH
category: data-bug
source: DQ-323
status: OPEN
---

# Prospects/College items not deep-cloned — cache corruption on sort

## Root Cause

NFL fetch path deep-clones API response items to prevent cache corruption:

```js
// lab.js:~1334 (NFL — correct)
state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });
```

But Prospects and College paths assign raw references:

```js
// lab.js:1416 (Prospects — broken)
state.items = data.items || [];

// lab.js:1463 (College — broken)
state.items = data.items || [];
```

The query cache (`_queryCache`) stores `data` by reference. When `applySecondarySort()` (called at lines 1420 and 1467) sorts `state.items` in-place, it mutates the cached data. Next cache hit returns items in the wrong sort order.

## Impact

1. User loads Prospects, sorts by column A
2. User sorts by column B (secondary sort mutates cached items)
3. User switches to another panel and back — cache serves column B order as "original" data
4. Filters/sorts produce wrong results until cache expires (5 min)

## Fix

```js
// lab.js:1416 — add deep clone
state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });

// lab.js:1463 — add deep clone
state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });
```

Two line changes, matching the NFL path pattern.

## Files

- `frontend/lab.js:1416` — Prospects fetch result assignment
- `frontend/lab.js:1463` — College fetch result assignment

## Acceptance Criteria

- Prospects and College items are cloned before assignment to state.items
- Sorting Prospects/College data does not mutate the query cache
- Switching panels and returning serves the original cached order
