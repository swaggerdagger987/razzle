---
id: DQ-337
title: Lab <style> block is 3099 lines of uncacheable inline CSS
priority: P3
category: performance
page: lab.html
cycle: 44
---

## Problem

Lab.html has a single `<style>` block from line 29 to line 3128 — **3099 lines of CSS**. This is the largest inline CSS block on the site. Because it's inline HTML, it:

1. **Cannot be browser-cached** — re-downloaded and re-parsed on every Lab page load
2. **Increases HTML payload** — ~90KB of CSS embedded in every Lab page response
3. **Blocks rendering** — browser must parse all 3099 lines before first paint
4. **Cannot use HTTP/2 push** or preload hints

By contrast, `styles.css` (1666 lines) and `lab-panels.css` (4946 lines) are external files that get browser-cached after first load.

## Evidence

```
lab.html line 29:   <style>
lab.html line 3128: </style>
= 3099 lines of inline CSS
```

For comparison:
- `styles.css` = 1666 lines (external, cached)
- `lab-panels.css` = 4946 lines (external, cached)
- `lab.html <style>` = 3099 lines (inline, NOT cached)

## Expected

Lab CSS should be in an external `lab.css` file, cacheable by the browser.

## Fix

1. Extract lines 29-3128 from lab.html into `frontend/lab.css`
2. Replace the `<style>...</style>` block with `<link rel="stylesheet" href="lab.css">`
3. Verify no CSS references `var(--*)` tokens that depend on inline context (they shouldn't — all tokens are in styles.css `:root`)

One file extraction, one `<link>` addition. All CSS variables are global.

## Not a duplicate of

- DQ-115 (standalone pages duplicate embedded CSS) — about 60+ standalone pages with 250-370 lines each. This is about lab.html specifically, which has 3099 lines — 10x the standalone page average and the core page of the product.

## Files
- `frontend/lab.html` (lines 29-3128)
- NEW: `frontend/lab.css`
