---
id: DQ-298
title: 404 page tiger-walk animation translateX(120vw) causes horizontal scrollbar
priority: P2
category: UX / layout
page: 404.html
status: open
cycle: 39
---

## What's wrong

The 404 page has a charming Easter egg where the tiger mascot walks across the screen. But the animation at line 105 uses `translateX(120vw)`, which extends the element 120% beyond the viewport width.

The 404 page has NO `overflow: hidden` on body, the container, or any ancestor. styles.css also has no global `overflow-x: hidden` on body. So when the tiger walks, a horizontal scrollbar appears and the page becomes horizontally scrollable.

On mobile (375px), this is especially jarring — the page jumps sideways and the user can accidentally scroll horizontally.

## Evidence

- 404.html:105: `25% { transform: rotate(0deg) translateX(120vw); }`
- 404.html:106: `26% { transform: rotate(0deg) scaleX(-1) translateX(120vw); }`
- No `overflow: hidden` anywhere in 404.html
- No `overflow-x: hidden` on body in styles.css
- Animation starts after 3s delay (`animation: tigerWalk 10s ease-in-out 3s infinite`)

## Fix

Add `overflow-x: hidden` to the page container:

```css
.four-oh-four {
  overflow-x: hidden;  /* prevent tiger walk from causing scroll */
}
```

Or better, add it to body on this page only (in the `<style>` block):

```css
body { overflow-x: hidden; }
```

## Files
- `frontend/404.html` lines 98-110 (animation), lines 29-95 (style block — add overflow fix)
