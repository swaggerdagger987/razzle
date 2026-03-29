---
id: S3-067
severity: S3
confidence: MEDIUM
category: reliability
source: DQ-121
status: OPEN
---

# 95 fetch() calls with no .catch() — silent failures sitewide

## Root Cause

95 `fetch()` or `apiFetch()` calls across the codebase have no `.catch()` handler. When the network fails or API returns an error, these calls fail silently with no user feedback, no error logging, and no UI recovery.

This is distinct from DQ-324 (empty catch blocks) — these have NO catch at all.

## Fix

Add `.catch(function(err) { console.error(err); })` at minimum. For user-facing fetch calls, show an error toast or fallback UI.

## Files

- Sitewide — lab.js, lab-panels.js, standalone HTML, app.js, warroom.js

## Acceptance Criteria

- All fetch calls have catch handlers
- User-facing failures show error feedback
