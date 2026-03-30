---
id: DQ-285
priority: P2
category: CSS compatibility
status: open
---

# DQ-285: league-intel.html uses color-mix() with no fallback

## Problem

The pressure map's locked overlay uses `color-mix()` -- a CSS function with limited browser support (no Safari < 16.4, no older Chromium):

```css
.pressure-locked-overlay {
  background: color-mix(in srgb, var(--bg) 92%, transparent);
}
```

No fallback is provided. On unsupported browsers, this declaration is ignored entirely, leaving the locked overlay with NO background -- users would see the gated content completely ungated.

Additionally, `color-mix()` with CSS variables cannot be easily overridden for dark mode since it computes at a different level than var() resolution.

## Where

`frontend/league-intel.html:581`

## Fix

Replace with a standard RGBA approach that works everywhere:

```css
.pressure-locked-overlay {
  background: rgba(237, 224, 207, 0.92);  /* sand at 92% opacity */
}
[data-theme="dark"] .pressure-locked-overlay {
  background: rgba(45, 31, 20, 0.92);     /* espresso at 92% opacity */
}
```

Or use the existing overlay pattern from styles.css (rgba with warm espresso).

## Not a dupe of

No existing ticket covers color-mix() usage. This is a new CSS compatibility category.
