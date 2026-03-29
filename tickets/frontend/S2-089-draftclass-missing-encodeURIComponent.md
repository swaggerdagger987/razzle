---
id: S2-089
severity: S2
confidence: HIGH
category: security
source: DQ-283
status: OPEN
---

# draftclass.html missing encodeURIComponent on player ID navigation

## Root Cause

`frontend/draftclass.html:551`:

```javascript
if (pid) window.location.href = '/player/' + pid;
```

Every other page that links to player profiles uses `encodeURIComponent(pid)`:
- `airyards.html:649` — `'/player/' + encodeURIComponent(pid)`
- `awards.html:592` — `'/player/' + encodeURIComponent(pid)`
- `lab-panels.js:282` — `'/player/' + encodeURIComponent(pid)`
- 30+ other instances

This one instance was missed.

## Fix

```javascript
if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
```

## Files

- `frontend/draftclass.html:551`

## Acceptance Criteria

- Player ID is encoded before URL construction
- Profile links from Draft Class page still navigate correctly
