---
id: S1-038
severity: S1
confidence: HIGH
category: frontend
source: DQ-361
status: OPEN
---

# JWT expiry clears all state mid-action without warning unsaved work

## Root Cause

`frontend/app.js` `apiFetch()` intercepts 401 responses and calls `signOut()` which clears localStorage. If a user has been on the Lab for 7+ days without refreshing (JWT lifetime), the next API call (filter change, sort, page) triggers a 401 that:

1. Removes their auth token
2. Clears formula store data
3. Reloads the page

Any unsaved work (pinned players, custom filters, in-progress comparisons) is lost without warning.

## Fix

1. On 401, show a modal: "Your session has expired. Sign in to continue." with a sign-in button
2. Do NOT clear localStorage or reload — let the user sign in and resume
3. Only clear state and reload if the user explicitly dismisses (clicks "Continue as free")

## Files to Change

- `frontend/app.js` — 401 handler in `apiFetch()` (search for `status === 401`)

## Acceptance Criteria

1. 401 response shows a sign-in modal, not an immediate logout+reload
2. User can sign in from the modal and resume their session
3. Unsaved Lab state (pins, filters, highlights) survives re-authentication
4. "Continue as free" option available for users who don't want to sign in
