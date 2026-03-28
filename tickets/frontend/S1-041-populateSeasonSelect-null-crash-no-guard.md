---
id: S1-041
severity: S1
confidence: HIGH
category: frontend
source: FUNC-001
status: OPEN
---

# populateSeasonSelect() crashes on null element when filter-options fails

## Root Cause

`frontend/lab.js:3039` — `document.getElementById("seasonSelect")` returns `null` when the DOM element doesn't exist (e.g., during init race or if the element hasn't rendered yet). There is no null guard before accessing `sel.innerHTML` on lines 3045, 3055, and 3069.

```javascript
function populateSeasonSelect() {
  const sel = document.getElementById("seasonSelect");  // line 3039: can be null
  // ...
  sel.innerHTML = ...;  // lines 3045, 3055, 3069: crash if null
}
```

## Crash Chain

1. `/api/filter-options` fails (network error, server cold start, double gzip)
2. Catch handler at `lab.js:1140-1150` returns `{ seasons: [], teams: [], positions: [] }`
3. `populateSeasonSelect()` is called at line 1165
4. `document.getElementById("seasonSelect")` returns `null`
5. `sel.innerHTML = ...` throws `TypeError: Cannot read properties of null (reading 'innerHTML')`
6. Lab screener init halts — entire page non-functional

## Why This Is S1

The Lab is the core product. If filter-options fails on first load (plausible on Render cold starts or flaky connections), the entire Lab page crashes with no recovery path. The user sees a blank/broken page with no error message.

## Fix

Add a null guard at the top of `populateSeasonSelect()`:

```javascript
function populateSeasonSelect() {
  const sel = document.getElementById("seasonSelect");
  if (!sel) return;  // <-- add this
  // ... rest of function unchanged
}
```

Also consider: the existing error handler at line 1140-1150 replaces `labContent` innerHTML with an error message, but `populateSeasonSelect()` is still called afterward. Move the `populateSeasonSelect()` call inside the `.then()` success path so it doesn't run after failure.

## Files

| File | Lines | Issue |
|------|-------|-------|
| `frontend/lab.js` | 3039, 3045, 3055, 3069 | No null guard on `sel` |
| `frontend/lab.js` | 1140-1165 | `populateSeasonSelect()` called after error fallback |

## Acceptance Criteria

- `populateSeasonSelect()` does not crash when `seasonSelect` element is missing
- When filter-options fails, Lab shows the error message and does not attempt to populate the season dropdown
- No console errors on filter-options failure
