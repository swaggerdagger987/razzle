---
id: DQ-147
priority: P2
area: responsive
section: scroll-behavior
type: mobile-ux
status: open
---

# No overscroll-behavior: contain on scroll containers (modals, mobile nav, sidebars)

## What's wrong

When a user scrolls to the end of a scrollable container (modal, mobile nav panel, sidebar), the scroll "leaks" to the page behind. On mobile, this means scrolling through the mobile nav menu can accidentally scroll the underlying page. `overscroll-behavior: contain` prevents this scroll chaining.

## Where

- `styles.css:294` — `.mobile-nav-panel { overflow-y: auto; }` — no overscroll-behavior
- `styles.css` — `.auth-modal` (auth/login modal) — no overscroll-behavior
- `lab.html` — column picker, sidebar panels — no overscroll-behavior
- `lab-panels.css` — scrollable panel containers — no overscroll-behavior

## Fix

Add `overscroll-behavior: contain` to all scrollable overlay containers:

```css
.mobile-nav-panel {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Apply the same to:
- `.auth-modal` body
- Lab sidebar panel (`.lab-sidebar`)
- Column picker
- Any scrollable modal content area

## Why this matters

On mobile, scroll chaining through the mobile nav menu scrolls the page behind it. When users reach the bottom of the nav and keep swiping, the page underneath jumps. This feels broken and disorienting.
