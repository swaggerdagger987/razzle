# DES-201: Blurred Pro teaser content still keyboard-focusable behind blur + pointer-events:none

**Priority**: P1
**Category**: Accessibility / Conversion Gate
**Affects**: formula-store.js, league-intel.html, agents.html
**Cycle**: 19

## Problem

Pro-gated teaser content uses `filter:blur(3px); pointer-events:none;` to prevent mouse interaction with locked content. But `pointer-events:none` only blocks pointer (mouse/touch) — it does NOT block keyboard focus. Tab key can still focus links, buttons, and interactive elements behind the blur. This means:

1. Keyboard users can Tab into blurred content and interact with it (bypassing the gate)
2. Screen reader users hear blurred content read out as if it's accessible
3. The blur creates a confusing experience — users can focus elements they can't see clearly

## Evidence

`formula-store.js:293`:
```css
transition: opacity 0.3s; pointer-events: none;
```

`formula-store.js:534`:
```html
<span style="filter:blur(3px); user-select:none; pointer-events:none;" aria-hidden="true">
```
Note: This one has `aria-hidden="true"` which is correct for screen readers, but keyboard focus still lands on child elements.

`league-intel.html:3589, 6353, 6533, 7254, 7256` — multiple blurred card previews:
```css
filter: blur(3px); opacity: 0.4; pointer-events: none;
```

`agents.html:1747`:
```css
filter:blur(3px); pointer-events:none;
```

## Fix

Add `inert` attribute to blurred containers. The `inert` HTML attribute blocks BOTH pointer and keyboard interaction and removes elements from the accessibility tree:

```javascript
container.setAttribute('inert', '');
// or in HTML template:
// <div inert style="filter:blur(3px);">
```

`inert` is supported in all modern browsers (Chrome 102+, Firefox 112+, Safari 15.5+). It's the correct semantic for "this content exists but is not interactive."

If `inert` browser support is a concern, the fallback is:
```javascript
container.setAttribute('aria-hidden', 'true');
container.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(el => {
  el.setAttribute('tabindex', '-1');
});
```

## Why it matters

The upgrade gate IS the conversion mechanism. If keyboard/screen reader users can bypass it, that's both an accessibility bug and a conversion leak. More importantly, the confused state (focused on invisible content) makes the product feel broken. This directly affects the path to 1,000 paid users.
