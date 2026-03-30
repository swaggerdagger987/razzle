# DQ-273: Formula store rating stars — zero keyboard/screen reader access

**Priority**: P2 — Interactive elements invisible to assistive technology
**Category**: Accessibility
**Severity**: HIGH — Star rating is completely inaccessible via keyboard

## Problem

formula-store.js lines 106-120: Interactive rating stars are `<span>` elements with `onclick` handlers but zero accessibility attributes:
- No `role="button"` or `role="radio"`
- No `tabindex="0"` for keyboard focus
- No `aria-label` (e.g., "Rate 4 out of 5 stars")
- No `aria-pressed` or selection state
- No keyboard event handler (Enter/Space to activate)

```javascript
html += `<span
  style="color:${filled ? "var(--yellow)" : "var(--ink-faint)"}; font-size:${size}px; cursor:pointer;"
  onclick="rateFormula(${safeId}, ${i})"
  onmouseenter="previewStars(this, ${i})"
  onmouseleave="resetStars(this, ${safeRating})"
>&#9733;</span>`;
```

## Fix

Add accessibility attributes to each star:
```javascript
html += `<span
  role="radio" tabindex="0"
  aria-label="Rate ${i} out of 5 stars"
  aria-checked="${filled}"
  style="..."
  onclick="rateFormula(${safeId}, ${i})"
  onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();rateFormula(${safeId}, ${i});}"
  ...
>&#9733;</span>`;
```

Wrap the star group in `role="radiogroup" aria-label="Rating"`.

## Files
- `frontend/formula-store.js` lines 106-120
