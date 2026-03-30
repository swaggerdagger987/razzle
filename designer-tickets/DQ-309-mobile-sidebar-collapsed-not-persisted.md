---
id: DQ-309
title: Mobile sidebar collapsed state not persisted to localStorage
priority: P3
category: mobile-ux
page: lab.html
---

## Problem
When a user closes the Lab sidebar on mobile (width <= 768px), the sidebar collapses via `sidebar.classList.add('collapsed')` (~line 5037). But this state is NOT saved to localStorage. On page refresh, the sidebar reopens, forcing the user to close it again every time.

Desktop sidebar state may have the same issue.

## Expected
Sidebar collapsed/expanded state persisted in `localStorage` as `razzle_sidebar_collapsed`. Restored on page load.

## Fix
In the sidebar toggle handler, save state: `localStorage.setItem('razzle_sidebar_collapsed', 'true')`. On init, read and apply: `if (localStorage.getItem('razzle_sidebar_collapsed') === 'true') sidebar.classList.add('collapsed')`.

## Files
- `frontend/lab.js` — sidebar toggle handler (~line 5037)
- `frontend/lab.js` — init/DOMContentLoaded handler
