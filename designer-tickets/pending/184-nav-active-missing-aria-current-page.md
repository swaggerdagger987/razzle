# DES-184: Nav active links use `.active` class without `aria-current="page"`

**Priority**: P2 — Accessibility
**Scope**: app.js (nav link activation logic), all pages
**Category**: Accessibility

## Problem

The topnav uses `.active` CSS class to visually indicate the current page:

```css
.nav-links a.active {
  border-color: var(--ink);
  background: var(--bg-card);
  box-shadow: 2px 2px 0 var(--ink);
}
```

But zero instances of `aria-current` exist in the entire codebase. Screen readers announce all nav links identically — a blind user has no way to know which page they're currently on. The WCAG 1.3.1 (Info and Relationships) guideline requires that information conveyed through visual presentation is also programmatically available.

## Evidence

- `grep -r "aria-current" frontend/` → 0 results
- `.nav-links a.active` is styled in styles.css:227 (visual indicator exists)
- `<nav class="topnav" aria-label="Main navigation">` has proper landmark labeling
- The visual active state is clear (background, border, shadow) — the accessibility equivalent is missing

## Fix

Wherever the `.active` class is added to nav links (likely in app.js or inline in each HTML file), also add `aria-current="page"`:

```javascript
// When setting active nav link
link.classList.add('active');
link.setAttribute('aria-current', 'page');
```

Or in HTML if nav links are statically determined:
```html
<a href="/lab.html" class="active" aria-current="page">The Lab</a>
```

## Why this matters

Keyboard accessibility is a first-class feature in Razzle — J/K navigation, H for heat, ? for shortcuts. The audience uses keyboards heavily. `aria-current="page"` completes the navigation accessibility story that started with proper `<nav>` landmarks and `aria-label`.
