# DES-183: No `color-scheme` property — dark mode scrollbars/select menus stay light

**Priority**: P2 — Dark mode completeness
**Scope**: styles.css (2 rules)
**Category**: Dark mode

## Problem

Zero instances of `color-scheme` in the entire CSS. Without this property, when dark mode is active (`[data-theme="dark"]`), browser-native UI elements remain light-themed:

- **Scrollbars**: light gray track + white thumb against dark espresso background
- **Select dropdown menus**: white background dropdown with dark text when clicking a `<select>`
- **Checkbox/radio native controls**: light-themed
- **Input autofill backgrounds**: bright white/yellow autofill overlay on dark inputs
- **Text selection**: browser-default blue highlight instead of theme-appropriate color

The styled elements (backgrounds, text, borders) correctly switch to dark mode via CSS variables. But the parts the browser draws natively don't know about the theme change.

## Evidence

- `grep -r "color-scheme" frontend/styles.css` → 0 results
- The `.select-chunky` has no `[data-theme="dark"]` override in styles.css
- Dark mode is a power user feature — dynasty managers who toggle dark mode are exactly the audience that notices light scrollbars on a dark page

## Fix

Add `color-scheme` to `:root` and `[data-theme="dark"]`:

```css
:root {
  color-scheme: light;
  /* ...existing vars... */
}

[data-theme="dark"] {
  color-scheme: dark;
}
```

This tells the browser to render native controls in the matching scheme. No visual change in light mode. In dark mode, scrollbars, select menus, and checkboxes automatically adapt.

## Why this matters

Dark mode is incomplete if the scrollbar is a bright white stripe on a dark page. Power users notice. This is a 2-line fix that completes the dark mode experience.
