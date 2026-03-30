---
id: DQ-320
title: JSON-LD schema description omits "100+ stat columns" present in all other meta tags
priority: P3
category: seo-consistency
page: index.html
---

## Problem
The JSON-LD structured data (index.html line 34) description says:
> "Free fantasy football research lab. NFL + college data screener, custom formulas, radar charts, dynasty value scores, AI agents with league context."

But the og:description, twitter:description, and meta description ALL say:
> "Free fantasy football research lab. 100+ stat columns, custom formulas, AI agents with full league context."

The JSON-LD is missing "100+ stat columns" — the most concrete, impressive data point. Google's rich results use JSON-LD preferentially. The strongest selling point is absent from the most important meta source.

## Expected
JSON-LD description should match the other meta descriptions and include "100+ stat columns".

## Fix
- `frontend/index.html` line 34: update JSON-LD description to include "100+ stat columns"

One string replacement.

## Files
- `frontend/index.html` — JSON-LD script block
