---
id: DQ-487
title: Watchlist, saved views, formulas, and agent memory sync have empty .catch() — silent data loss
severity: P1
category: runtime-error-handling
files: frontend/lab.js, frontend/formulas.js, frontend/warroom.js
lines: lab.js:352-358, lab.js:4491-4503, formulas.js:294-317, warroom.js:2744-2751, warroom.js:3482-3494
---

## Problem

Five server sync operations use `.catch(function() {})` or `.catch(() => {})` with empty bodies:

1. **Watchlist sync** (lab.js:352) — watchlist additions fail silently, lost on device switch
2. **Saved views sync** (lab.js:4491, 4503) — saved views fail silently, lost on cache clear
3. **Formula sync** (formulas.js:294-317) — formula save/delete fails silently
4. **Agent quota sync** (warroom.js:2744) — quota becomes stale, user may exceed limits
5. **Agent memory sync** (warroom.js:3482) — memory context lost for Elite users

All share the same pattern: POST to server, catch swallows error, user thinks data is saved but it only persists in localStorage.

## Expected

Each catch block should:
1. Log the error to console
2. Show a subtle toast: "Sync failed — changes saved locally only"
3. NOT block the UI (the local save should still succeed)

## Acceptance Criteria

- `grep -rn "catch(function() {}" frontend/lab.js frontend/formulas.js frontend/warroom.js` returns zero empty catch blocks on sync operations
- Sync failures show a user-visible warning
- Local data persistence still works when server is unreachable
