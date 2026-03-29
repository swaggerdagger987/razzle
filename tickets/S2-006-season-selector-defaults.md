---
id: S2-006
severity: S2
category: football-accuracy
title: "Season selector defaults correctly"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: RESOLVED (lab-panels.js:9 _latestSeason logic correct)
---

# S2-006: Season selector defaults to correct season

## Finding

The deep audit notes this is correctly handled. Logging for awareness.

## Root Cause Investigation

**File: `frontend/lab-panels.js:9`**:
```javascript
var _latestSeason = (function() {
  var n = new Date();
  return n.getMonth() >= 8 ? n.getFullYear() : n.getFullYear() - 1;
})();
```

Logic: If month >= August (NFL preseason starts), use current year. Otherwise use previous year. As of March 2026, this correctly returns 2025 (the completed season).

## Conclusion

No action needed. Correctly implemented.
