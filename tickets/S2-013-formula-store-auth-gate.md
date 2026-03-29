---
id: S2-013
severity: S2
category: ux-flow
title: "Formula store browseable without auth, interactions require login"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S2-013: Formula builder store requires account but no clear prompt

## Finding

The deep audit says the formula store requires authentication to browse and there's no clear transition from local to cloud formulas.

## Root Cause Investigation

**Status: Already partially open.**

**File: `frontend/formula-store.js:23-53`** — `fetchStoreFormulas()`:
The store fetches `/api/formulas/store` at line 34 **without auth headers**. Unauthenticated users can browse the formula store.

Auth gates exist on interactions only:
- **Rating**: line 138 checks `_isStorePaidUser()`
- **Installing**: line 205 checks `_isStorePaidUser()`
- **Publishing**: line 314 checks `_isStorePaidUser()`

## Conclusion

Users CAN browse the formula store without an account. Only rating, installing, and publishing require auth. This is reasonable.

The "Sign in to save and share" prompt on interactive elements is already the correct UX pattern.
