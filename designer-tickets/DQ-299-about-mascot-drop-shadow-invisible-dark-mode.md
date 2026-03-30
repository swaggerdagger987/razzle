---
id: DQ-299
title: about.html mascot drop-shadow hardcoded rgba — invisible in dark mode
priority: P3
category: dark mode
page: about.html
status: open
cycle: 39
---

## What's wrong

about.html line 42 uses the same hardcoded drop-shadow as index.html:

```css
filter: drop-shadow(3px 3px 0 rgba(45, 31, 20, 0.15));
```

In dark mode, this espresso-toned shadow (rgb 45,31,20) is cast on an espresso background (#2d1f14 = rgb 45,31,20). The shadow is identical to the background. It disappears completely.

## Evidence

- about.html:42: `filter: drop-shadow(3px 3px 0 rgba(45, 31, 20, 0.15));`
- Dark mode --bg = #2d1f14 (identical hue to the shadow color)
- No dark mode override exists for `.about-hero-mascot`

## Fix

Add a dark mode override in the about.html `<style>` block:

```css
[data-theme="dark"] .about-hero-mascot {
  filter: drop-shadow(3px 3px 0 rgba(237, 224, 207, 0.15));
}
```

## Not a dupe of

- DQ-016 covers the SAME issue on index.html `.hero-mascot` — this is the about.html INSTANCE. Same pattern, different page, not yet ticketed.

## Files
- `frontend/about.html` line 42
