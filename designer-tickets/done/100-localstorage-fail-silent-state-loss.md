<!-- PM: ready -->
# DQ-407: localStorage Failure Silently Loses All State (Privacy Mode)

**Priority**: P1 (data loss for privacy users)
**Category**: State Persistence
**Page**: lab.html (Screener)

## Problem

Line ~1169 in lab.js:
```javascript
var hasVisited = (function() {
  try { return localStorage.getItem("razzle_lab_visited"); }
  catch(e) { return "1"; }
})();
```

When localStorage is blocked (private browsing, disabled), the catch returns `"1"` (truthy string). This means `if (!hasVisited)` evaluates to FALSE, so the first-visit onboarding toast never shows. More critically, ALL localStorage-backed features silently fail:

- Auto-restore last screener state (`razzle_last_state`)
- Saved views
- Player notes and tags
- Column width preferences
- Dark mode preference

Users in private browsing lose all state on every refresh with zero feedback about why.

## Fix

1. Detect localStorage unavailability once at init
2. Show a subtle banner: "private browsing detected — your filters and notes won't be saved between sessions"
3. Continue working without localStorage (current behavior is fine, just needs the notification)

## Evidence

- Line ~1169: catch returns "1" (string, truthy) — masks the failure
- `saveStateToURL()` at line ~1354 provides URL-based fallback for filters/sort
- But notes, tags, saved views, and column widths have NO fallback
