---
id: S2-062
severity: S2
category: frontend
finding_ref: FUNC-027
confidence: HIGH
---

# S2-062: Smart filter chip URL key mismatch -- ?sf=breakouts silently fails

## Root Cause

`frontend/lab.js:3738` -- `SMART_FILTERS` object defines the key as `"breakout"`
(singular). But `frontend/agent-nudges.js:56` and other linking code generates
URLs with `?sf=breakouts` (plural).

The URL handler at `lab.js:4075-4079` does:
```js
var sf = params.get("sf");
if (sf && SMART_FILTERS[sf]) { ... }
```

`SMART_FILTERS["breakouts"]` is `undefined`, so the filter silently does nothing.
The user clicks a smart nudge link and nothing happens -- no error, no feedback.

## What to Fix

Either normalize the key in `SMART_FILTERS` to include both forms, or add
an alias mapping:

```js
// Option A: Add plural alias
SMART_FILTERS["breakouts"] = SMART_FILTERS["breakout"];

// Option B: Normalize in URL handler
var sf = params.get("sf");
if (sf && sf.endsWith('s') && !SMART_FILTERS[sf]) sf = sf.slice(0, -1);
```

Option A is simpler and safer.

## Files to Change

- `frontend/lab.js` -- add alias or normalize key lookup

## Acceptance Criteria

- [ ] `?sf=breakouts` applies the breakout smart filter
- [ ] `?sf=breakout` still works (no regression)
- [ ] All other smart filter keys (buylow, studs, rookies, workhorses, sleepers) still work

## Do NOT

- Do not change the URL format in agent-nudges.js -- the plural form is more natural
