# DES-163: Home page Elite/Pro CTA buttons use inline style overrides

**Priority**: P3 (Design system compliance)
**Page**: index.html (Home page)
**Category**: Code quality

## The Problem

The Elite CTA button on the home page pricing section uses an inline `style` attribute to override background color and font size instead of using a CSS class:

```html
style="font-size:13px; width:100%; background:var(--purple); border-color:var(--ink);"
```

This bypasses the design system. pricing.html uses a `.btn-elite` CSS class for the same button — the pattern exists but wasn't used on the home page.

## Evidence

- **index.html** Elite CTA: inline `style="...background:var(--purple)..."`
- **pricing.html** Elite CTA: uses `.btn-elite` CSS class (correct)
- The Pro CTA on the home page may also have inline overrides — verify both

## The Fix

1. Ensure `.btn-elite` class in styles.css has the purple background, ink border, and sizing
2. Replace the inline style on the home page Elite CTA with `class="btn-primary btn-elite"`
3. Remove all inline style properties from the button

## Why This Matters

Inline styles are harder to maintain, can't be overridden by dark mode CSS without `!important`, and create inconsistency between pages. The pricing page and home page Elite buttons should look identical — using the same CSS class guarantees this. Low severity, but pattern discipline matters at scale.
