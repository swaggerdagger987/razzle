# DES-299: agents.html "Current Plan" buttons still clickable after visual disable

**Priority**: P1
**Category**: Conversion UX
**Page**: agents.html
**Lines**: 2195-2208

## Problem

When a paid user visits the Situation Room, the Pro/Elite CTA buttons are "disabled" by setting `opacity: 0.6` and `cursor: default` via inline JS. But:

1. No `disabled` attribute is set on the button
2. No `pointer-events: none` is applied
3. The `onclick` handler is set to `null` but the button is still focusable and clickable
4. No `aria-disabled="true"` for screen readers

Users can still Tab to and click these buttons. A paid Elite user clicking "Current Plan" gets... nothing. No feedback. Feels broken.

## Current (line 2195-2207)

```javascript
proCta.style.opacity = "0.6";
proCta.style.cursor = "default";
```

## Expected

```javascript
proCta.disabled = true;
proCta.setAttribute('aria-disabled', 'true');
proCta.style.opacity = "0.6";
proCta.style.cursor = "default";
```

## Fix

Add `proCta.disabled = true` (and same for `eliteCta`) in all 3 branches (lines 2193-2197, 2199-2203, 2204-2207). The `disabled` attribute prevents click/focus natively. 4 lines added.
