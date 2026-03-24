---
id: DQ-355
title: Invalid sort/filter URL params silently dropped without user feedback
priority: P2
category: UX / state corruption
page: lab.html
cycle: 46
---

## Problem

In lab.js `loadStateFromURL()` (lines 3943-3962), URL parameters like `sort`, `sort2`, `filters`, and `teams` are validated against known columns/values. When validation fails, the param is silently ignored — no console warning, no toast, no visual indicator.

```js
if (params.has("sort")) {
  var _sk = params.get("sort");
  if (COLUMNS[_sk] || COLLEGE_COLUMNS[_sk] || PROSPECT_COLUMNS[_sk])
    state.sortKey = _sk;
  // If validation fails: nothing happens. state.sortKey keeps default.
}
```

A user sharing `?sort=invalid_col&filters=...` sees data sorted by the default column (fantasy_points_ppr), not their intended sort. No indication that the URL state was partially rejected.

## How users hit this

- Shared URL with a typo in column name
- Bookmarked URL from before a column was renamed
- Copy-paste error when sharing URLs on Reddit/Discord
- Browser extension or URL shortener corrupts params

## Not a duplicate of

- DQ-332: covers invalid PANEL URL param causing blank screen (different param, different failure mode)
- DQ-329: covers screener filter float extreme values (filter values, not sort keys)

## Fix

Add a subtle toast when URL params are rejected:
```js
if (params.has("sort")) {
  var _sk = params.get("sort");
  if (COLUMNS[_sk] || COLLEGE_COLUMNS[_sk] || PROSPECT_COLUMNS[_sk]) {
    state.sortKey = _sk;
  } else {
    console.warn("Unknown sort column in URL:", _sk);
    _showToast("shared URL had an unknown sort column — using default");
  }
}
```

Same pattern for `teams` param — validate against known team abbreviations.

## Files
- `frontend/lab.js` (lines 3943-3975, `loadStateFromURL`)
