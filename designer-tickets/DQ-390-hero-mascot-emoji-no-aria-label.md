---
id: DQ-390
title: Hero mascot emoji divs lack aria-label — screen readers get raw Unicode
priority: P3
category: accessibility
page: index.html, about.html
status: open
cycle: 50
---

## Problem

The hero mascot emoji on the home page and about page is a plain `<div>` containing a tiger emoji (U+1F42F). Screen readers either announce "tiger face" (if emoji support is good) or nothing useful. The div has no `aria-label` or `role` to provide context that this is the Razzle mascot.

This is distinct from DQ-055 (which proposes replacing the emoji with a custom SVG). Even with the current emoji implementation, it should be accessible.

## Evidence

- `index.html:643` — `<div class="hero-mascot">&#x1F42F;</div>` (no aria-label)
- `about.html:203` — `<div class="about-hero-mascot">&#x1F42F;</div>` (no aria-label)

## Fix

Add `role="img"` and `aria-label`:

```html
<!-- Before -->
<div class="hero-mascot">&#x1F42F;</div>

<!-- After -->
<div class="hero-mascot" role="img" aria-label="Razzle the Bengal tiger mascot">&#x1F42F;</div>
```

Apply the same pattern to `about.html:203`.

## Verification

1. Open index.html with VoiceOver/NVDA
2. Navigate to the hero section
3. Screen reader should announce "Razzle the Bengal tiger mascot, image"
