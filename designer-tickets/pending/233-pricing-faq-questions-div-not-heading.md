# DES-233: Pricing FAQ questions use div instead of heading elements

**Priority:** P2 — SEO / accessibility
**Page:** pricing.html
**Cycle:** 22

## Problem

pricing.html:401-443: All 9 FAQ questions are styled as `<div style="font-family:var(--font-mono); font-size:14px; color:var(--ink);">`. They look like headings but are semantically plain divs.

Issues:
1. Screen readers don't announce them as headings — users can't navigate by heading to find specific questions.
2. Search engines can't identify the Q&A structure for rich snippets.
3. The heading hierarchy jumps from `<h2>Questions we keep getting` to... nothing. The questions should be `<h3>`.

## Evidence

- pricing.html:401: `<div style="...">What's the difference between Pro and Elite?</div>` — styled div, not heading.
- All 9 FAQ items follow the same pattern: question div + answer div inside a border-bottom wrapper.
- The page has proper h1 + h2 structure. FAQ questions should be h3.

## Fix

Replace the question divs with `<h3>` elements:

```html
<h3 style="font-family:var(--font-mono); font-size:14px; color:var(--ink); margin:0 0 6px; font-weight:400;">
  What's the difference between Pro and Elite?
</h3>
```

Note: `font-weight:400` keeps the visual appearance unchanged while gaining semantic value.

## Why this matters

DES-175 covers adding FAQPage structured data. But structured data without proper heading semantics is incomplete. Heading hierarchy is the foundation — rich snippets build on top.
