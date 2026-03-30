# DQ-102: Zero touch-action rules — iOS double-tap zoom and tap flash on buttons

**Priority**: P3
**Category**: Mobile UX
**Severity**: Low — affects touch interaction feel on iOS/Android
**Evidence**: Code search — zero instances of `touch-action` or `-webkit-tap-highlight-color` in any frontend file

## What's wrong

1. **Double-tap zoom**: iOS Safari enables double-tap-to-zoom on buttons and links. When users tap a filter chip or nav button, there's a 300ms delay while iOS waits to see if it's a double-tap. This makes the UI feel sluggish on mobile.
2. **Tap highlight flash**: iOS shows a default gray/blue flash overlay on tapped elements. This clashes with the warm sand/espresso palette.

## Where

- `frontend/styles.css` — zero touch-action rules
- Affects all 75+ pages on iOS Safari and Android Chrome

## Fix

Add to `frontend/styles.css` base reset:

```css
a, button, [role="button"], select, input, .chip, .badge, .nav-link {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

`touch-action: manipulation` disables double-tap zoom (keeps pinch-zoom), eliminating the 300ms delay. `-webkit-tap-highlight-color: transparent` removes the blue flash.

2 lines of CSS. Zero risk — standard mobile best practice.

## Verification

Tap any button on iOS Safari. No delay, no blue flash.
