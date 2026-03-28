---
id: S1-029
severity: S1
confidence: HIGH
category: a11y
source: DQ-331
status: OPEN
---

# Lab sidebar 73 panel links have no href — keyboard navigation dead

## Root Cause

All 73+ sidebar panel links in `frontend/lab.html:3185-3291` are `<a>` elements with `onclick="switchPanel('...')"` handlers but **no `href` attribute**. Without `href`, these links:

- Are not keyboard-focusable (Tab skips them)
- Cannot be middle-clicked to open in new tab
- Are not announced as links by screen readers
- Violate WCAG 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value)

## Evidence

```html
<!-- lab.html:3200 -->
<a class="lab-sidebar-item active" data-panel="screener" data-icon="◉" onclick="switchPanel('screener')">The Screener</a>
```

Every sidebar `<a>` follows this pattern — `onclick` handler, no `href`, no `role="button"`, no `tabindex="0"`.

## Fix

Add `href="#"` to all sidebar `<a>` elements, and prevent default in the click handler. Or use `tabindex="0"` + `role="button"` + `onkeydown` for Enter/Space.

Better approach: add `href="#panel=screener"` (matching URL state) so middle-click works and the sidebar items are proper links.

## Files

- `frontend/lab.html:3185-3291` — all 73 sidebar `<a>` elements

## Acceptance Criteria

- All sidebar panel links are keyboard-focusable (Tab reaches them)
- Pressing Enter on a focused sidebar link activates the panel
- Screen reader announces them as links or buttons with accessible names
