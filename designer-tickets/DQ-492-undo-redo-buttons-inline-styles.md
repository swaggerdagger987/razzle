---
id: DQ-492
title: Undo/redo buttons use inline styles that bypass theming
severity: P2
status: open
component: Lab Screener
phase: Phase 121
---

## Problem

The undo/redo buttons added in Phase 121 use inline `style` attributes for font-size and padding instead of a CSS class. Inline styles bypass the theming cascade and can't be overridden by dark mode or media queries without `!important`.

## Location

- `frontend/lab.html:3351-3352`

```html
<button ... style="font-size:14px; padding:5px 8px;">&#8630;</button>
<button ... style="font-size:14px; padding:5px 8px;">&#8631;</button>
```

## Fix

Move inline styles to the `.undo-redo-btn` CSS class in the `<style>` block:

```css
.undo-redo-btn {
  font-size: 14px;
  padding: 5px 8px;
}
```

Remove the `style=` attributes from both buttons.

## Acceptance Criteria

- [ ] No `style=` attribute on undo/redo buttons
- [ ] `.undo-redo-btn` class in CSS with font-size and padding
- [ ] Buttons render identically
