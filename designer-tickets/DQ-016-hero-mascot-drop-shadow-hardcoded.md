# DQ-016: Hero mascot drop-shadow hardcoded rgba, no dark mode flip

**Priority**: P3 — home page only, subtle visual
**Category**: Dark mode / CSS variable

## Problem

`frontend/index.html` line 77 uses a hardcoded drop-shadow filter on the hero mascot image:

```css
filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
```

This uses espresso brown (45,31,20) at 15% opacity. In dark mode, the background flips to espresso — a brown shadow on brown background is invisible.

## Fix

Use a CSS variable or dark mode override:
```css
.hero-mascot {
  filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
}
[data-theme="dark"] .hero-mascot {
  filter: drop-shadow(3px 3px 0 rgba(237,224,207,0.15));
}
```

## Verification

Toggle dark mode on the home page. The mascot should have a visible drop shadow in both themes.
