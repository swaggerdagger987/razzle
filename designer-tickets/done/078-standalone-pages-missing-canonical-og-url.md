# DES-078: 67 standalone pages missing canonical URL and og:url

**Priority**: P2
**Area**: 67 standalone HTML panel pages (breakouts.html, buysell.html, efficiency.html, etc.)
**Cycle**: 8

## Problem

Only 8 of 75 HTML pages have `<link rel="canonical">` and `<meta property="og:url">`. The 8 main pages (index, lab, pricing, agents, league-intel, about, prompts, 404) have both. The remaining 67 standalone panel pages have neither.

Without canonical URLs:
- If pages are linked with query strings (e.g., `?season=2025`), Google may fragment page authority across URL variations
- Duplicate content signals between `regression.html` and `tdregression.html` (which share identical `<title>` and `og:title`)

Without og:url:
- Social shares of panel pages may show inconsistent URLs in previews

## Fix

Add to each of the 67 standalone pages at line 20 (after the existing meta block):

```html
<link rel="canonical" href="https://razzle.lol/FILENAME.html">
<meta property="og:url" content="https://razzle.lol/FILENAME.html">
```

Also fix the duplicate title pair:
- `regression.html` title: "TD Regression Finder — Razzle"
- `tdregression.html` title: "TD Regression Candidates — Razzle"
(Currently both say "TD Regression — Razzle")

## Scope

67 files, but it's a mechanical find-and-add. Each page already has the meta block pattern — just append two lines.

## Design Rule

SEO completeness: every public page needs a canonical URL.
