# DQ-121: 95 frontend fetch calls have no .catch() — API failures are silent

**Priority**: P1 — HIGH
**Category**: Robustness / UX
**Scope**: 7 frontend JS files

## Problem

95 fetch() calls across frontend JS have no .catch() error handler. When an API endpoint fails (500, network error, timeout), the user sees nothing — no error message, no recovery option. The page just stops responding.

## Counts by file

| File | Unhandled fetches | Total fetches |
|------|------------------|---------------|
| lab-panels.js | 71 | 72 |
| app.js | 11 | 11 |
| lab.js | 7 | 7 |
| warroom.js | 7 | 14 |
| formulas.js | 5 | 5 |
| compare.js | 2 | 2 |
| player.js | 1 | 2 |
| formula-store.js | 0 | 5 |

formula-store.js is the only file where ALL fetches have .catch(). Use it as the model.

## Fix

Add .catch() to every fetch chain. Pattern:

```js
fetch(url)
  .then(function(r) { ... })
  .catch(function(err) {
    console.error('Panel load failed:', err);
    container.innerHTML = '<div class="error-state">could not load data. try refreshing.</div>';
  });
```

## Priority order

1. lab-panels.js (71) — most user-facing, every Lab panel
2. app.js (11) — auth flows, analytics, health check
3. lab.js (7) — screener core
4. warroom.js (7) — agent queries
5. formulas.js (5) — formula CRUD
6. compare.js (2) — player comparison
7. player.js (1) — player profile
