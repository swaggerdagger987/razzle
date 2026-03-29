---
id: S2-020
severity: S2
category: ux-flow
finding_ref: EDGE-43
confidence: MEDIUM
---

# S2-020: Bureau empty state confusing for offseason users

## Root Cause

`frontend/league-intel.html:3275`:
```javascript
container.innerHTML = '<div class="loading-intel">looks like you\'re not in any leagues
this season. check your Sleeper username or explore the <a href="/lab.html"
style="color:var(--orange);">free Screener</a> while we figure this out.</div>';
```

"Not in any leagues this season" is misleading during the offseason (Feb-Aug) when
Sleeper leagues haven't been created yet. Users may think the feature is broken rather
than understanding it's a timing issue.

## What to Fix

Add season-awareness to the empty state message:

```javascript
const month = new Date().getMonth(); // 0-indexed
const isOffseason = month >= 1 && month <= 7; // Feb-Aug
const msg = isOffseason
  ? "leagues haven't opened for the new season yet — check back when your league drafts. explore the <a href='/lab.html' style='color:var(--orange);'>Screener</a> in the meantime."
  : "no leagues found for this username. double-check your Sleeper username or explore the <a href='/lab.html' style='color:var(--orange);'>Screener</a>.";
```

## Files to Change

- `frontend/league-intel.html` — Update empty state at line 3275

## Acceptance Criteria

- [ ] During offseason (Feb-Aug), message explains leagues haven't opened yet
- [ ] During season (Sep-Jan), message suggests checking username
- [ ] Both messages link to the Screener as fallback
- [ ] Message uses Razzle's casual voice (lowercase, no formal language)

## Do NOT

- Do not add complex date logic — simple month check is sufficient
- Do not hide the Bureau during offseason
