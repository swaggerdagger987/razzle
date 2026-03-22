# DES-037: Footer grid minmax(140px) breaks 375px phones on 71 pages

**Priority**: P1
**Area**: sitewide (71 standalone pages)
**Impact**: Every page except index.html has a footer that overflows on 375px phones — the most common mobile width from Twitter/Reddit traffic. DES-025 only fixed index.html.

## The Problem

DES-025 changed the home page footer from `minmax(140px, 1fr)` to `minmax(110px, 1fr)` to fix 375px phone overflow. But the identical footer is copy-pasted across 71 other pages, ALL still using the old 140px value.

Found via grep: 72 files total contain `minmax(140px` — only `index.html` was updated to 110px.

Example (about.html line 265):
```html
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); ...">
```

Affected pages include: about.html, agents.html, pricing.html, league-intel.html, lab.html, and every standalone panel page (aging.html, breakouts.html, buysell.html, etc.).

## The Fix

In all 71 files, change `minmax(140px, 1fr)` to `minmax(110px, 1fr)`.

Better long-term: extract the footer into a shared CSS class in styles.css rather than inline styles, so future changes only require one edit.

## Why This Matters

Mobile users from Twitter and Reddit are the primary traffic source (62% of fantasy football is mobile). Every standalone page's footer breaks on iPhone SE / small Android — the exact phones dynasty degens use while scrolling Reddit. This is the highest-leverage fix in this cycle: one find-and-replace, 71 pages fixed.
