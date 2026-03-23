---
id: DQ-139
priority: P2
area: accessibility
section: 404-page
type: motion-safety
status: open
---

# 404 page tigerWalk CSS animation has no prefers-reduced-motion guard

## What's wrong

The 404 page has a tiger emoji that walks across the screen via CSS animation (line 102):
```css
.four-oh-four-mascot {
  animation: tigerWalk 10s ease-in-out 3s infinite;
}
```

There is no `@media (prefers-reduced-motion: reduce)` guard. Users who have reduced motion enabled will see a tiger emoji pacing back and forth forever. The companion annotation text also animates (line 119).

## Where

- `frontend/404.html` lines 98-110 (tigerWalk), 119-126 (annotationFade)

## Fix

Add at the end of the `<style>` block:
```css
@media (prefers-reduced-motion: reduce) {
  .four-oh-four-mascot,
  .tiger-annotation {
    animation: none;
  }
}
```

## Why this matters

WCAG 2.1 SC 2.3.3 requires respecting user motion preferences. An infinite looping animation is exactly what reduced-motion users are trying to avoid. The 404 page is a dead end — don't make it a nauseating one.
