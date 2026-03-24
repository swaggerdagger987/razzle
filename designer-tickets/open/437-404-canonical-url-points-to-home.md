---
id: DQ-437
priority: P2
area: frontend/404.html
section: SEO
type: incorrect meta tag
status: open
cycle: 56
---

# 404.html canonical URL incorrectly points to homepage instead of itself

## What's wrong

`frontend/404.html:22` has:
```html
<link rel="canonical" href="https://razzle.lol/">
```

This tells search engines that the 404 page is canonical to the homepage. This is incorrect — a 404 page should either:
1. Have no canonical tag (let the HTTP 404 status code handle it), OR
2. Point to itself: `https://razzle.lol/404.html`

Current behavior confuses crawl budget allocation and can cause Google to associate 404 content with the homepage in edge cases.

## Where

- `frontend/404.html:22` — `<link rel="canonical" href="https://razzle.lol/">`

## Fix

Either remove the canonical tag entirely (preferred for 404 pages):
```html
<!-- no canonical tag on 404 -->
```

Or point to self:
```html
<link rel="canonical" href="https://razzle.lol/404.html">
```

## Not a duplicate of

- done/078: covered standalone pages MISSING canonical URLs. This is a WRONG canonical value, not a missing one.

## Why this matters

Google uses canonical signals for crawl budget. A 404 page claiming to be the homepage is a confusing signal that could dilute homepage ranking.
