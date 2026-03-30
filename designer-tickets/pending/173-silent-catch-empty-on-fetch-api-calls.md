# DES-173: 10+ fetch calls silently swallow errors with `.catch(function(){})`

**Priority**: P3
**Category**: Resilience / UX
**Affects**: app.js, formulas.js, lab.js, lab-panels.js, player.js, warroom.js
**Cycle**: 16

## Problem

10+ API fetch calls use `.catch(function(){})` — silently discarding errors with no user feedback. When these calls fail (server down, network issue, timeout), the user's action appears to succeed but nothing actually happened.

These are different from the localStorage `try/catch(e){}` blocks (which are a defensive pattern for quota/private-browsing). These are network calls where the user expects something to happen.

## Evidence

Affected fetch calls:
```
app.js:1409     — formula cloud sync
formulas.js:298 — formula sync on load
formulas.js:314 — formula delete
formulas.js:316 — formula sync fallback
lab-panels.js:332 — panel data fetch (60 instances of .then pattern)
lab.js:358      — watchlist cloud sync
lab.js:4503     — saved views cloud sync
player.js:757   — player page analytics
warroom.js:2751 — agent memory persist
warroom.js:3654 — agent memory clear
```

## Fix

Replace silent catches with user-visible feedback. At minimum, log to console for debugging:
```javascript
.catch(function(err) { console.warn("Formula sync failed:", err.message); });
```

For user-initiated actions (formula save, watchlist sync), show a toast:
```javascript
.catch(function() { _showToast("couldn't save — try again"); });
```

## Why it matters

Silent failures erode trust. A dynasty manager saves a custom view, closes the browser, reopens — and the view is gone. They didn't see an error. They just lost work. This is the kind of experience that produces "this tool is buggy" Reddit posts.
