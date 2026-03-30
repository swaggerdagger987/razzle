# DES-130: Home page hero CTAs missing :focus-visible

**Priority:** P2 — Accessibility
**Component:** index.html
**Affects:** Keyboard navigation on home page hero section

## Problem

The `.btn-hero` class (the primary CTAs: "Open the Screener", "Connect your league", "Meet the agents") has `:hover` styling but ZERO `:focus-visible` rules. Keyboard users tabbing through the page get no visual indication of which button is focused.

The nav links and theme toggle already have `:focus-visible` (fixed in DES-081/082). The hero CTAs — the most important buttons on the page — were missed.

## Evidence

- `frontend/index.html:106-122` — `.btn-hero` and `.btn-hero:hover` defined
- `grep -c 'focus-visible' frontend/index.html` → **0 results**
- Contrast: `styles.css` has `:focus-visible` on `.topnav a`, `.theme-toggle` (from DES-081/082)

## Fix

Add to index.html `<style>`:
```css
.btn-hero:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

## Why it matters

Dynasty power users already use keyboard shortcuts (J/K navigation, H for heat colors, ? for shortcuts). Missing focus-visible on the hero CTAs is inconsistent with the keyboard-first design philosophy. WCAG 2.1 AA requires visible focus indicators.
