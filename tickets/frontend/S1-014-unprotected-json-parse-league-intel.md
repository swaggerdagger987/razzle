---
id: S1-014
severity: S1
category: ui-bug
finding_ref: EDGE-23
confidence: HIGH
---

# S1-014: 3 unprotected JSON.parse(localStorage) calls in league-intel.html

## Root Cause

`frontend/league-intel.html:3356,3622,3770` — Three `JSON.parse(localStorage.getItem(...))`
calls have no try/catch. If `razzle_league_context` contains corrupt/tampered JSON,
these throw and kill the page — the entire Bureau of Intelligence becomes unusable.

Line 3356:
```javascript
const existing = JSON.parse(localStorage.getItem("razzle_league_context") || "{}");
```

Line 3622:
```javascript
const existing = JSON.parse(localStorage.getItem("razzle_league_context") || "{}");
```

Line 3770:
```javascript
var existing = JSON.parse(localStorage.getItem("razzle_league_context") || "{}");
```

The `|| "{}"` fallback only handles the null case (key missing). It does NOT protect
against corrupt JSON (e.g., `"{invalid"`), which still throws `SyntaxError`.

Other files (formula-store.js, warroom.js) already have try/catch — these 3 were missed.

## What to Fix

Wrap each in try/catch:

```javascript
let existing = {};
try { existing = JSON.parse(localStorage.getItem("razzle_league_context") || "{}"); }
catch (e) { existing = {}; }
```

## Files to Change

- `frontend/league-intel.html` — Lines 3356, 3622, 3770

## Acceptance Criteria

- [ ] All 3 JSON.parse calls wrapped in try/catch
- [ ] On parse failure, variable defaults to `{}`
- [ ] Bureau of Intelligence loads even with corrupt localStorage
- [ ] No other unprotected JSON.parse(localStorage) calls exist in any frontend file

## Do NOT

- Do not refactor into a helper function (follow existing pattern)
- Do not clear the corrupt localStorage key — user may want to retry
