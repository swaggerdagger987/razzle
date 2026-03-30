---
id: DQ-296
title: Elite "Priority data refresh" listed in card but missing from comparison matrix
priority: P2
category: conversion / copy
page: pricing.html
status: open
cycle: 39
---

## What's wrong

The Elite pricing card (line 310) lists "Priority data refresh" as a feature. But the comparison matrix (lines 350-389) does NOT include this feature in any row. Users who scroll down to compare tiers won't see this feature at all.

The home page Elite card (index.html line 837) also lists "Priority data refresh."

Two locations promise a feature that the detailed comparison table doesn't show. This creates a trust gap — users wonder if the feature is real or just marketing copy.

## Evidence

- pricing.html line 310: `<li><span class="check">&#10003;</span> Priority data refresh</li>`
- index.html line 837: `<li>Priority data refresh</li>`
- pricing.html comparison matrix (lines 350-389): NO row for "Priority data refresh"

## Fix

Add a row to the comparison matrix under "Data & Export" group:

```html
<tr><td>Priority data refresh</td><td class="no">&mdash;</td><td class="no">&mdash;</td><td class="yes">&#10003;</td></tr>
```

Or, if this feature isn't actually implemented yet, remove it from both card lists until it ships.

## Not a dupe of

- pending-218 covers Pro feature list mismatch home vs pricing — this is about an Elite feature missing from the matrix
- DQ-292 covers the "same features" contradiction — different issue

## Files
- `frontend/pricing.html` line 310 (card) and lines 377-381 (matrix Data group)
- `frontend/index.html` line 837
