---
id: S2-068
severity: S2
confidence: HIGH
category: mobile
source: DQ-298
status: OPEN
---

# 404 tiger walk animation 120vw causes horizontal scrollbar

## Root Cause

`frontend/404.html:104-105`:

```css
25%  { transform: rotate(0deg) translateX(120vw); }
26%  { transform: rotate(0deg) scaleX(-1) translateX(120vw); }
```

`translateX(120vw)` moves the element 120% of viewport width, triggering a horizontal scrollbar on desktop and mobile. The animation should be contained within the viewport.

## Fix

Add `overflow-x: hidden` to the body or animation container:
```css
body { overflow-x: hidden; }
```

Or cap the animation to 100vw:
```css
25%  { transform: rotate(0deg) translateX(100vw); }
```

Also add `prefers-reduced-motion` guard (DQ-139):
```css
@media (prefers-reduced-motion: reduce) {
  .tiger-walk { animation: none; }
}
```

## Files

- `frontend/404.html:104-105` — animation keyframes

## Acceptance Criteria

- No horizontal scrollbar on 404 page at any viewport width
- Tiger walk animation contained within viewport
