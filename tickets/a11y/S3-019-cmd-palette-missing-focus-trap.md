# S3-019: Command palette missing focus trap

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #17
**WCAG**: 2.4.3 (Focus Order)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

The command palette (`frontend/app.js:1494`) has `role="dialog"`, `aria-modal="true"`, and `aria-label="Quick Search"` — all correct. However, it has no focus trap. Pressing Tab moves focus to elements behind the backdrop.

The auth modal (app.js, around line 613-629) has a working focus trap implementation that should be used as reference.

## Fix

Add Tab/Shift+Tab trapping to the command palette's keydown handler (around line 1551-1565 in app.js). When the palette is open, Tab should cycle between the search input and result items only.

```javascript
// In the keydown handler where Escape is already handled:
if (e.key === "Tab" && _cmdPaletteEl.classList.contains("open")) {
  var focusable = _cmdPaletteEl.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
  var first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
```

## Files to Change

- `frontend/app.js` — keydown handler for command palette (around lines 1551-1565)

## Accept When

1. Tab within open command palette cycles between input and results only
2. Shift+Tab wraps from first to last focusable element
3. Focus cannot escape to elements behind the backdrop
