---
id: DQ-482
title: prevPage/nextPage pagination has no .catch() — silent failure on network error
severity: P0
category: runtime-error-handling
file: frontend/lab.js
lines: 3125-3132
---

## Problem

`prevPage()` and `nextPage()` call `fetchAndRender().then(...)` with NO `.catch()` handler. If the network request fails, the promise rejection is unhandled. The user sees stale data with no error message. Loading state may get stuck.

## Expected

Add `.catch()` handlers that show an error toast and reset loading state:

```javascript
fetchAndRender()
  .then(function() { requestAnimationFrame(_scrollTableTop); })
  .catch(function(err) { showToast('Failed to load page — try again', 'error'); });
```

## Acceptance Criteria

- Both `prevPage()` and `nextPage()` have `.catch()` handlers
- Network failure during pagination shows a user-visible error
- Loading spinner does not hang indefinitely
