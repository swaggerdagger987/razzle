---
id: DQ-361
title: JWT expiry clears all state mid-action without warning unsaved work
priority: P2
category: UX / state management
page: app.js (sitewide)
cycle: 47
---

## Problem

When a JWT expires during an active session, the 401 handler in `apiFetch()` (app.js line 602-605) immediately clears localStorage and opens the auth modal — without warning the user about unsaved work.

```js
if (resp.status === 401) {
  try { localStorage.removeItem("razzle_token"); localStorage.removeItem("razzle_user"); } catch (e) {}
  if (typeof openAuthModal === "function") openAuthModal();
  throw new Error("session expired. sign in again.");
}
```

A user mid-action (building a screener query, comparing players, editing formulas) loses their entire session context. The auth modal opens with zero explanation of what happened or what was lost.

## How users hit this

- Leave a Lab tab open for hours, return to interact
- Long session during draft day without refreshing
- Slow API response during JWT expiry window

## Not a duplicate of

- DES-101 (done): global error handler — that's about unhandled exceptions, not JWT-specific UX
- DQ-345: situation room placeholder timeout — different page, different failure

## Fix

Before clearing state, show a toast with context: "Session expired — your filters and view are saved. Sign in to continue." Save current URL (with state params) to sessionStorage so it can be restored after re-auth. Don't clear localStorage until after re-auth succeeds.

## Files
- `frontend/app.js` (lines 602-605, `apiFetch`)
