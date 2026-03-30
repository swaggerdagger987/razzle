# DES-141: Column picker + modals height:100vh clips behind mobile address bar

**Priority:** P2 — Mobile UX
**Component:** lab.html
**Affects:** Column picker, store modal on mobile devices

## Problem

The column picker uses `height: 100vh` on both desktop and mobile breakpoints:

- Desktop (line 964): `height: 100vh;`
- Mobile 480px (line 2682): `height: 100vh;`

On mobile browsers, `100vh` includes the area behind the browser's address bar and bottom toolbar. This means:
- The bottom 56-80px of the column picker is unreachable
- Users can't see or tap the last few column checkboxes
- There's no way to scroll past the viewport boundary

This is a well-known mobile web bug. `100vh` on iOS Safari and Android Chrome doesn't equal the visible viewport — it equals the layout viewport (which extends behind browser chrome).

## Evidence

- `frontend/lab.html:964` — `.column-picker { height: 100vh; }`
- `frontend/lab.html:2682` — `@media (max-width: 480px) .column-picker { height: 100vh; }`
- The column picker has `overflow-y: auto` (line 965) which is correct, BUT the container itself extends behind the address bar, so the scrollable area's bottom is clipped

## Fix

Replace `100vh` with the modern `100dvh` (dynamic viewport height) which accounts for the address bar:

```css
.column-picker {
  height: 100dvh;
}
```

Or use the fallback-safe approach:

```css
.column-picker {
  height: 100vh;
  height: 100dvh; /* overrides for browsers that support it */
}
```

At the mobile breakpoint too:
```css
@media (max-width: 480px) {
  .column-picker {
    height: 100dvh;
  }
}
```

## Why it matters

The column picker is how users customize their Lab view — it's a core screener interaction. If the bottom of the picker is clipped on mobile, users can't access all columns. 62% of traffic is mobile.
