---
id: DQ-258
title: Disabled inputs and textareas have no visual styling — look identical to enabled
priority: P3
category: design-system / forms
status: open
cycle: 35
---

## Problem

Buttons have disabled styling (`.btn-chunky:disabled` and `.btn-primary:disabled` use `opacity: 0.5; cursor: not-allowed;`). But `input:disabled`, `textarea:disabled`, and `select:disabled` have NO styling — they look identical to enabled inputs.

When the UI disables a form field programmatically, users can't tell it's disabled.

## Evidence

`grep -rn ":disabled" frontend/styles.css` returns only `.btn-chunky:disabled` and `.btn-primary:disabled`. No input/textarea/select disabled rules.

## Fix

Add to `frontend/styles.css`:
```css
input:disabled,
textarea:disabled,
select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-warm);
}
```

## Files
- `frontend/styles.css` — add 1 rule (~5 lines)

## Impact
Form UX. Small fix, prevents confusion on any disabled input.
