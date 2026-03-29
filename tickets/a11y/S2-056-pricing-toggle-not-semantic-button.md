# S2-056: Pricing interval toggle is div, not semantic button

**Severity**: S2 (Medium)
**Category**: a11y
**Source**: designer-tickets/DQ-175
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/pricing.html:237` — The monthly/yearly pricing toggle is a `<div>` with `tabindex="0"` and `onclick`/`onkeydown` handlers. While technically keyboard-accessible, it's not a semantic `<button>` element.

```html
<!-- pricing.html:237 -->
<div class="toggle-track yearly" id="intervalToggle"
  onclick="toggleInterval()"
  role="switch" aria-checked="true"
  aria-label="Toggle monthly or yearly pricing"
  tabindex="0"
  onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();toggleInterval();}">
  <div class="toggle-knob"></div>
</div>
```

Issues:
1. Not a native interactive element — screen readers may not announce it consistently
2. The Monthly/Yearly `<label>` elements (lines 236, 240) aren't associated with any input
3. Focus ring may not render properly on non-interactive elements

## Fix

Replace with a `<button>` element that toggles state, or use a proper `<input type="checkbox">` with `role="switch"`. Keep the visual styling the same.

## Files to Change

- `frontend/pricing.html:236-240` — replace div toggle with semantic element

## Accept When

1. Toggle is keyboard focusable and operable
2. Screen reader announces it as a switch control
3. Visual appearance unchanged
