---
id: S1-038
severity: S1
confidence: HIGH
category: frontend
source: DQ-361
status: OPEN
---

# JWT expiry clears all state mid-action without warning unsaved work

## Root Cause (file:line)

**401 handler** — `frontend/app.js:639-643`:
```javascript
if (resp.status === 401) {
  try { localStorage.removeItem("razzle_token"); localStorage.removeItem("razzle_user"); } catch (e) {}
  if (typeof openAuthModal === "function") openAuthModal();
  throw new Error("session expired. sign in again.");
}
```

On 401, this immediately:
1. Removes `razzle_token` (line 640)
2. Removes `razzle_user` (line 640)
3. Opens auth modal (line 641)
4. Throws, aborting the current operation (line 642)

The `signOut()` function at `frontend/app.js:1086-1089` is NOT called here (different from the original report), but the token/user removal has the same effect. The page's state (pins, filters, highlights) in `state` object survives in memory, but any subsequent API call fails because the token is gone. If the user signs in again, the page may work — but the thrown error already aborted the operation they were doing.

## Fix

1. On 401, show a modal: "Your session has expired. Sign in to continue." with a sign-in button
2. Do NOT remove localStorage items until the user explicitly chooses to continue as free
3. After re-auth, retry the failed request

## Files to Change

- `frontend/app.js:639-643` — 401 handler in `apiFetch()`

## Acceptance Criteria

1. 401 response shows a sign-in modal, not an immediate logout+reload
2. User can sign in from the modal and resume their session
3. Unsaved Lab state (pins, filters, highlights) survives re-authentication
4. "Continue as free" option available for users who don't want to sign in
