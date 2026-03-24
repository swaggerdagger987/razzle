---
id: DQ-358
title: Pro vs Elite comparison table uses identical checkmarks — difference is not clear
priority: P2
category: conversion / pricing clarity
page: pricing.html
cycle: 46
---

## Problem

The pricing comparison table (pricing.html lines 340-390) shows checkmarks for both Pro and Elite in nearly every row. The visual pattern is: column of checks, column of checks, column of checks. Users scan quickly and conclude "they're the same — why would I pay 3x more?"

The ONLY row that differentiates Pro from Elite is "AI setup" (line 373):
- Pro: "Free API key (~$1-3/mo)"
- Elite: "Nothing — we handle it"

But this is one row among 15+, and the text is small. Users who don't understand API keys (most fantasy football players) will miss the distinction entirely.

## Not a duplicate of

- DES-217: covers confusing "free API key (~$1-3/mo)" language (specific copy issue)
- DES-218: covers Pro feature list mismatch between home and pricing pages (different issue)

## Fix

Add a clear summary row or callout above the comparison table:

```html
<div style="font-family:var(--font-mono); font-size:13px; color:var(--ink-medium); text-align:center; margin-bottom:16px; padding:12px; background:var(--bg-warm); border-radius:var(--radius-sm);">
  <strong>Pro:</strong> same features, you bring your own AI key (DIY).
  <strong>Elite:</strong> same features, we handle everything (done-for-you).
</div>
```

Also consider highlighting the "AI setup" row with a different background color to draw attention to the one row that actually differs.

## Files
- `frontend/pricing.html` (lines 326-390, comparison table)
