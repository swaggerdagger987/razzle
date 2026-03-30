# DES-092: Toast notifications missing role="alert" + aria-live

**Priority**: P1
**Area**: frontend/app.js line 449 (_showToast function)
**Cycle**: 9

## Problem

The `_showToast()` function in `app.js` creates notification divs with no ARIA live region attributes:

```javascript
function _showToast(msg, type, duration, link) {
  var toast = document.createElement('div');
  toast.className = 'razzle-toast';
  // No role="alert" or aria-live set
  toast.textContent = msg;
  // ...
}
```

Toast notifications confirm critical user actions:
- "column hidden: Points Per Game"
- "added to watchlist"
- "filter added"
- "copied to clipboard"
- "exported as PNG"
- "saved view created"
- Error and warning messages

Used across 7 JS files: lab.js, app.js, charts.js, lab-panels.js, player.js, formulas.js, compare.js.

Screen readers never announce these. A keyboard user who hides a column or adds a filter gets zero confirmation that the action succeeded.

## Fix

Add `role="alert"` to the toast element:

```javascript
function _showToast(msg, type, duration, link) {
  var toast = document.createElement('div');
  toast.className = 'razzle-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  // ...
}
```

`role="alert"` implies `aria-live="assertive"` — the notification will be announced immediately by screen readers regardless of what the user is doing.

## Design Rule

WCAG 2.1 SC 4.1.3: Status Messages. Status messages must be programmatically determinable through role or properties so assistive technology can present them without receiving focus.
