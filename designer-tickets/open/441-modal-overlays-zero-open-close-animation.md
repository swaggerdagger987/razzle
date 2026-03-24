---
id: DES-441
priority: P2
area: UX polish
section: Lab modals
type: animation-gap
status: open
---

# Modal overlays (filter, column-picker) have zero open/close animation

## What's wrong

The filter-modal-overlay and column-picker-overlay toggle between `display:none` and `display:flex` instantly. No fade, no scale, no slide. They pop in and out with zero transition.

Compare to the well-animated toast (slide-in/out via CSS class toggle) and hover card (opacity transition via `.visible` class). Modals feel cheap by comparison.

## Where

- `frontend/lab.html:896-907` — `.filter-modal-overlay { display: none; }` toggles to `display: flex`
- `frontend/lab.html:945-956` — `.column-picker-overlay` same pattern
- `frontend/lab.js` — JS toggles display property directly, no animation class

## Fix

Add opacity + scale transition:
```css
.filter-modal-overlay {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s;
}
.filter-modal-overlay.open {
  opacity: 1;
  visibility: visible;
}
.filter-modal-overlay .filter-modal {
  transform: scale(0.95);
  transition: transform 0.15s ease;
}
.filter-modal-overlay.open .filter-modal {
  transform: scale(1);
}
```

Replace `display:none/flex` toggle with `classList.toggle('open')`.

## Why it matters

Every user interacts with filter and column modals. Instant pop-in/out feels like a broken web page, not a polished product. 150ms fade is the difference between "this feels cheap" and "this feels intentional."
