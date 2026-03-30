# DES-169: signOut() doesn't clear user-generated localStorage keys

**Priority**: P2
**Category**: Privacy
**Affects**: app.js signOut() — all pages with auth
**Cycle**: 16

## Problem

The `signOut()` function clears 18 localStorage keys (token, user, formulas, etc.) but leaves 5+ user-generated data stores behind:

- `razzle_saved_views` — user's named screener configurations
- `razzle_custom_scoring` — user's scoring format configs
- `razzle_my_roster` — user's roster list
- `razzle_pinned_cache` — pinned player data
- `razzle_col_widths` — column width preferences

On a shared or public computer, signing out leaves personal data visible to the next user.

## Evidence

`app.js:1033-1052` — signOut() clears 18 keys but misses these:
```javascript
function signOut() {
  localStorage.removeItem("razzle_token");
  localStorage.removeItem("razzle_user");
  // ... 16 more keys cleared ...
  // MISSING: razzle_saved_views, razzle_custom_scoring,
  //          razzle_my_roster, razzle_pinned_cache, razzle_col_widths
}
```

Keys that ARE set in lab.js but NOT cleared by signOut:
- `razzle_saved_views` (lab.js:4417)
- `razzle_custom_scoring` (lab.js:5067)
- `razzle_my_roster` (lab.js:11493)
- `razzle_pinned_cache` (lab.js:4700)
- `razzle_col_widths` (lab.js:1656)

## Fix

Add the missing removeItem calls to signOut():
```javascript
localStorage.removeItem("razzle_saved_views");
localStorage.removeItem("razzle_custom_scoring");
localStorage.removeItem("razzle_my_roster");
localStorage.removeItem("razzle_pinned_cache");
localStorage.removeItem("razzle_col_widths");
```

## Why it matters

Privacy expectations. Dynasty managers on shared computers (work, library, family) expect Sign Out to actually sign out. User-created content persisting after logout is a trust issue.
