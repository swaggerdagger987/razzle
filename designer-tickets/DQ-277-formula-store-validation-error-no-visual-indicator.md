# DQ-277: Formula store form validation sets aria-invalid but no visual border indicator

**Priority**: P2 — Users get no visual feedback on invalid fields
**Category**: UX / Forms
**Severity**: MEDIUM — Accessibility attribute set but visual feedback missing

## Problem

formula-store.js line 363: When clearing validation state, the code removes `aria-invalid` and clears `borderColor`. But when SETTING invalid state, it marks `aria-invalid="true"` without applying a red border or error class.

```javascript
// Clearing (line 363):
el.removeAttribute("aria-invalid"); el.style.borderColor = "";

// Setting invalid — just aria-invalid, no visual change
el.setAttribute("aria-invalid", "true");
```

The user submits an invalid review → the field looks unchanged. Screen readers announce "invalid" but sighted users see nothing.

## Fix

When setting invalid state, also apply red border:
```javascript
el.setAttribute("aria-invalid", "true");
el.style.borderColor = "var(--red)";
```

Or better, use a CSS class:
```css
.input-chunky[aria-invalid="true"] { border-color: var(--red); }
```

This way the visual indicator automatically follows the aria state.

## Files
- `frontend/formula-store.js` line 363 (and wherever aria-invalid is set)
- `frontend/styles.css` (add the CSS rule)
