---
id: DQ-154
priority: P2
area: accessibility
section: touch-targets
type: bug
status: open
---

# Small interactive elements below 44px minimum touch target on mobile

## What's wrong

Several clickable/tappable elements have padding of 1-2px, making them far smaller than the WCAG 2.2 minimum 44x44px touch target. On mobile, users will fat-finger these constantly.

## Where

- `frontend/styles.css:991` — `.chip { padding: 2px 7px; }` — filter chips, position badges (clickable)
- `frontend/styles.css:1207` — `.cmd-palette-pos { padding: 1px 6px; }` — position badges in command palette
- `frontend/styles.css:1381` — unnamed rule `padding: 1px 5px;` — small interactive badge
- `frontend/styles.css:1474` — `padding: 2px 6px !important;` — forced small size
- `frontend/styles.css:1592` — `padding: 1px 8px;` — small pill element

Note: `.btn-sm` already has `min-height: 44px` on mobile (line 435) — good pattern to follow.

## Fix

Add a mobile-only override in styles.css inside the `@media (max-width: 768px)` block:

```css
.chip, .cmd-palette-pos { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; }
```

Or increase padding to at least `padding: 10px 12px;` on mobile for all interactive small elements.

## Why it matters

WCAG 2.2 Level AA requires 24px minimum, AAA requires 44px. Fantasy football is a mobile-first use case — users check lineups on their phone. Tiny tap targets = frustrated users.
