---
id: DQ-474
title: tools.html meta descriptions say "60+" instead of "70+"
priority: P2
category: content-accuracy
status: open
cycle: 60
---

## Problem

DES-013 identified the "60+ analytical panels" undersell on pricing.html and about.html. The fix updated those pages but missed tools.html, which still claims "60+ free fantasy football analytics tools" in its meta tags.

The tools hub JSON config has 67 tools. The North Star says "70+ analytical panels." about.html already says "70+."

## Evidence

`frontend/tools.html`:
- Line 10: `<meta property="og:description" content="60+ free fantasy football analytics tools...">`
- Line 18: `<meta name="twitter:description" content="60+ free fantasy football analytics tools...">`

Compare to `frontend/about.html` line 9 which already says "70+ analytics tools" (fixed by DES-013).

## Fix

```
FIND:    60+ free fantasy football analytics tools
REPLACE: 70+ free fantasy football analytics tools
```

2 instances in tools.html.

## Files
- `frontend/tools.html` lines 10, 18
