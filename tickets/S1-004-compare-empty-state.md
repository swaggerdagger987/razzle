---
id: S1-004
severity: S1
category: ui-bug
title: "Compare page empty state when no URL params"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: RESOLVED (compare.js:22-33 shows proper empty state)
---

# S1-004: Compare page perpetual loading state

## Finding

The deep audit reports the compare page shows "pulling film..." loading text with no clear instruction when visited without URL params.

## Root Cause Investigation

**Status: Already handled in current code.**

**File: `frontend/compare.js:22-33`**

When no URL params are provided (`!ids || ids.length < 2`), the page displays:
- "Pick two players first, boss."
- "Select two players in the Lab and click Compare, or paste a compare URL."
- A "Back to Lab" button

This is a proper empty state, not a perpetual loading state. The initial "pulling film..." HTML in `compare.html:346-348` is immediately replaced by JavaScript on page init.

## Conclusion

This issue appears resolved. The compare page properly handles the no-params case with a user-friendly empty state.

**Verify**: Visit razzle.lol/compare without params and confirm the empty state message appears.

## Acceptance Criteria

- [x] Compare page without URL params shows "Pick two players first" message
- [x] No perpetual "pulling film..." loading state
- [ ] Verify on live deploy
