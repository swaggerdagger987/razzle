# DES-257: Zero twitter:site meta tag on all 75 pages

**Priority:** P1
**Category:** Distribution / Twitter Cards
**Affects:** All 75 pages
**Cycle:** 25

## Problem

Zero pages have `<meta name="twitter:site">` or `<meta name="twitter:creator">` tags. When anyone shares a razzle.lol link on Twitter, the card doesn't link back to the @razzle_lol account.

Every page has `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` — but the two tags that attribute the card to the Razzle Twitter account are completely missing.

## Why This Matters

Phase 1 is Twitter launch. Every shared link is a billboard. Without `twitter:site`, shared cards don't show "@razzle_lol" attribution. Users who see a compelling Screener screenshot can't click through to the account. Free attribution on every share — missing from every page.

## Fix

Add to ALL 75 pages, after the existing `twitter:image:alt` tag:

```html
<meta name="twitter:site" content="@razzle_lol">
<meta name="twitter:creator" content="@razzle_lol">
```

## Scope

75 HTML files. Mechanical find-and-insert after `twitter:image:alt` line.

## Evidence

```bash
grep -r "twitter:site" frontend/  # 0 results
grep -r "twitter:creator" frontend/  # 0 results
grep -r "twitter:card" frontend/  # 75 results (all pages have card type but not account attribution)
```
