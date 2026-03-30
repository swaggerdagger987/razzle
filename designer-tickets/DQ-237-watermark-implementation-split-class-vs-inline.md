---
id: DQ-237
priority: P2
category: consistency / brand
pages: 60+ standalone pages
status: open
cycle: 33
---

# Watermark uses two different implementations — CSS class vs inline styles

## What's wrong

The watermark appears on most standalone pages but uses two different implementations:

**Pattern A — CSS class** (correct):
```html
<div class="watermark">razzle.lol</div>
```
Used by: dashboard.html, tiers.html, a few others.

**Pattern B — inline styles** (inconsistent):
```html
<div style="position:fixed; bottom:10px; right:14px; font-family:var(--font-hand); font-size:13px; color:var(--ink-faint); opacity:0.7; z-index:999; pointer-events:none;">razzle.lol</div>
```
Used by: tradevalues.html, breakouts.html, weekly.html, and 50+ other standalone pages.

Problems with Pattern B:
1. Any future watermark style change requires editing 50+ files instead of 1 CSS class
2. The inline values may have drifted from the `.watermark` class definition
3. Inline styles can't be overridden by dark mode CSS variables

## Fix

Replace all Pattern B instances with Pattern A. The `.watermark` class already exists in styles.css. Mechanical find-replace:

Find: `<div style="position:fixed; bottom:10px; right:14px;` ... `>razzle.lol</div>`
Replace: `<div class="watermark">razzle.lol</div>`

## Verification

Grep for `position:fixed.*razzle.lol` — should return 0 results. Grep for `class="watermark"` — should match all pages.
