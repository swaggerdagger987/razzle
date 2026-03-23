# DES-107: Lab sidebar panel links not keyboard focusable

**Priority**: P1 — affects every panel in the Lab (the paid product)
**Category**: Keyboard accessibility
**WCAG**: 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)

## Problem

60+ Lab sidebar panel links (`<a class="lab-sidebar-item" ... onclick="switchPanel(...)">`) have no `href` attribute and no `tabindex`. In most browsers, `<a>` without `href` is NOT keyboard focusable. Keyboard users cannot tab to any panel link in the sidebar — they can't navigate between the 70+ panels that are the core paid product.

## Location

`frontend/lab.html` lines 3168-3280 — every `<a class="lab-sidebar-item">` element.

## Evidence

```html
<a class="lab-sidebar-item pro-locked" data-panel="vorp" data-icon="↑" onclick="switchPanel('vorp')">VORP</a>
```

No `href`, no `tabindex`, no `role`. The element is invisible to keyboard navigation.

## Fix

Add `href="#"` or `tabindex="0"` to every `.lab-sidebar-item` element. If using `href="#"`, add `event.preventDefault()` to the onclick handler. Also add `role="button"` since these act as buttons (switch panels) rather than navigate to URLs.

Recommended approach: add `tabindex="0"` + `role="button"` + `onkeydown` handler for Enter/Space.

## Why This Matters

The Lab is the core product. 70+ panels behind Pro paywall. If keyboard users can't navigate panels, they can't use what they're paying for. Dynasty power users are keyboard-heavy (J/K row nav, H for heat, T for tiers) — they expect keyboard navigation to work everywhere.
