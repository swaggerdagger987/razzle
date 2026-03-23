---
id: DQ-177
priority: P3
category: ux/developer-experience
status: open
cycle: 26
---

# Console.log ASCII tiger art fires on every page load

## What's wrong

app.js:1709-1715 outputs a large ASCII tiger art block and `window.razzle` helper object to the browser console on every single page load. While intended as an easter egg, this:
- Clutters DevTools for power users who debug their own code
- Logs 5 console statements per page load across all 75 pages
- Makes it harder to spot real errors in the console

## Where

- `frontend/app.js:1709-1715`

## Fix

Wrap the console easter egg in a check so it only fires once per session:

```javascript
if (!sessionStorage.getItem('razzle_console_shown')) {
  console.log(/* ASCII tiger art */);
  console.log('window.razzle object...');
  sessionStorage.setItem('razzle_console_shown', '1');
}
```

Or gate it behind a flag: `if (localStorage.getItem('razzle_debug'))`.

## Test

1. Open any page, check console. Tiger art should appear once.
2. Navigate to another page. Tiger art should NOT appear again in the same session.
