---
id: DES-270
title: Footer "made for Reddit" is plain text — not a link to r/DynastyFF
priority: P2
page: sitewide (73 pages)
category: distribution
cycle: 26
---

## Problem

Every page footer says "made for Reddit | attribution & privacy" (e.g., index.html:913, pricing.html:532). "made for Reddit" is plain text, not a clickable link. The phrase invokes Reddit but provides no path to get there.

The about page Contact section (about.html:253) links to r/DynastyFF and r/fantasyfootball — but that requires navigating to About first. The footer is on every page and is the natural place for a Reddit link.

DES-242 covers the missing Twitter link in the footer. This is the parallel issue for Reddit — the platform the product is explicitly "made for."

## Evidence

- index.html:913 — `made for Reddit | <a href="/about.html"...>attribution & privacy</a>`
- pricing.html:532 — identical pattern
- 73 pages have `site-footer-grid` class with this footer text
- about.html:253 — `<a href="https://reddit.com/r/DynastyFF"...>r/DynastyFF</a>` (correct link, wrong location)

## Fix

Change footer text from plain "made for Reddit" to a link:
```html
made for <a href="https://reddit.com/r/DynastyFF" target="_blank" rel="noopener" style="color:var(--ink-light);">Reddit</a>
```

Apply across all 73 pages with the footer.

## Why This Matters

Phase 2 distribution is Reddit. Every page footer is a free link to the community where Razzle needs to build credibility. Plain text creates brand association but zero traffic.
