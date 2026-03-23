# DQ-084: Footer personality text ("made for Reddit") not using Caveat font

**Priority**: P3 — typography / brand voice
**Category**: Typography
**Files**: `frontend/index.html:912-913`

## Problem

The home page footer has two personality text lines:

```html
<p style="text-align:center;"><a href="/" style="...">razzle.lol</a></p>
<p style="text-align:center; margin-top:6px;">made for Reddit | <a href="/about.html" style="...">attribution &amp; privacy</a></p>
```

Neither `<p>` tag specifies `font-family`. They inherit from the parent container, which likely resolves to Space Mono (the data font).

Per DESIGN.md, "made for Reddit" is personality/voice text — exactly the kind of content that should use Caveat:
> "Caveat (Handwritten Annotations): Personality that leaks through the seams: section annotations, player card scribbles, agent editorial asides, loading states."

"made for Reddit" is an editorial aside — it's brand personality, not data.

## Fix

Add Caveat font to the footer personality text:

```html
<p style="text-align:center; font-family: var(--font-hand); font-size: 18px;">
  <a href="/" style="color:var(--orange); text-decoration:none;">razzle.lol</a>
</p>
<p style="text-align:center; margin-top:6px; font-family: var(--font-hand); font-size: 16px;">
  made for Reddit | <a href="/about.html" style="color:var(--ink-light);">attribution &amp; privacy</a>
</p>
```

Better yet: move these inline styles to a CSS class in styles.css under `.site-footer-grid`.

## Verification

Open home page. Footer text should render in Caveat handwriting font, matching the personality tone of "pulling film..." and other Caveat usages.
