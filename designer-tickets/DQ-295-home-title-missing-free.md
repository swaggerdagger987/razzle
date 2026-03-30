---
id: DQ-295
title: Home page <title> missing "Free" while og:title includes it
priority: P2
category: SEO / brand
page: index.html
status: open
cycle: 39
---

## What's wrong

The home page `<title>` and `og:title` say different things:

- Line 7: `<title>Razzle — Fantasy Football Research Lab</title>`
- Line 8: `<meta property="og:title" content="Razzle — Free Fantasy Football Research Lab | NFL + College Data">`

The `<title>` is what shows in Google search results and browser tabs. It omits "Free" — the single most important brand differentiator. The og:title correctly includes it for social shares.

"Forever free" is a core brand signal per DESIGN.md. The most visible SEO element should reinforce it.

## Fix

```html
<title>Razzle — Free Fantasy Football Research Lab</title>
```

Keep it shorter than the og:title (no "| NFL + College Data") to stay under Google's ~60 character title display limit.

## Files
- `frontend/index.html` line 7
