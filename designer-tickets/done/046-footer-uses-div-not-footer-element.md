# DES-046: Footer uses `<div>` instead of `<footer>` on 67+ pages

**Priority**: P2
**Area**: sitewide (67+ standalone pages)
**Impact**: Only 5 pages use the semantic `<footer>` element (index.html, agents.html, pricing.html, league-intel.html, prompts.html). The remaining 67+ pages use `<div class="site-footer">`. Screen readers and assistive tech don't identify it as a page footer landmark.

## The Problem

Grep for `<footer` across all HTML files:
- **5 pages** use `<footer>`: index, agents, pricing, league-intel, prompts
- **67+ pages** use `<div class="site-footer">`: about, lab, all standalone panels

The `<footer>` HTML5 element provides:
- Automatic `contentinfo` ARIA landmark for screen readers
- Browser "jump to footer" navigation shortcuts
- SEO signals for page structure

Using `<div>` provides none of these.

## The Fix

In all 67+ files, change:
```html
<div class="site-footer">
```
to:
```html
<footer class="site-footer">
```

And close with `</footer>` instead of `</div>`.

No visual change. No CSS change needed — class selectors work the same on `<div>` and `<footer>`.

## Why This Matters

Accessibility isn't just the right thing to do — it's a quality signal. Dynasty power users include tech-savvy developers who inspect source. A `<div>` footer when `<footer>` exists is the kind of thing that signals "built in a rush." And screen reader users deserve a proper footer landmark on every page.
