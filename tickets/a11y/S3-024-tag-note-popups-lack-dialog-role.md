# S3-024: Tag picker and note editor popups lack dialog semantics

**Severity**: S3 (Low)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #23
**WCAG**: 4.1.2 (Name, Role, Value)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

The tag picker (styles.css:1206-1261) and note editor (styles.css:1299-1361) are positioned fixed popups with no `role`, `aria-label`, or focus management. They are created in `frontend/lab.js` as plain divs.

Screen readers announce them as generic regions. Tab can escape to background content. Focus is not restored on close.

## Fix

When creating tag picker and note editor popups in lab.js:
```javascript
popup.setAttribute("role", "dialog");
popup.setAttribute("aria-modal", "true");
popup.setAttribute("aria-label", "Player tags"); // or "Player notes"
// Focus first interactive element on open
// Trap Tab/Shift+Tab within popup
// Restore focus to trigger element on close
```

## Files to Change

- `frontend/lab.js` — tag picker creation function
- `frontend/lab.js` — note editor creation function

## Accept When

1. Both popups have `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label`
2. Focus is trapped within popup while open
3. Focus returns to the trigger element on close
