---
id: DQ-255
title: Favicon uses absolute path on 4 pages, relative on 71 — breaks on nested routes
priority: P2
category: meta / infrastructure
status: open
cycle: 35
---

## Problem

4 pages use `href="/favicon.svg"` (absolute path):
- `404.html` (line 23)
- `compare.html` (line 24)
- `player.html` (line 24)
- `team.html` (line 24)

71 other pages use `href="favicon.svg"` (relative path).

The absolute-path pages are the ones with dynamic routing (`/player/{id}`, `/team/{abbr}`, `/compare/{id1}/{id2}`). On these pages, the relative path would break because the browser resolves it relative to the URL path. So the absolute path is actually CORRECT for these pages.

But the inconsistency means if Render serves from a subdirectory, the absolute paths could break. Standardize to one approach.

## Fix

Use absolute paths everywhere (`/favicon.svg`) for consistency:
```bash
# In 71 files, change:
href="favicon.svg"
# To:
href="/favicon.svg"
```

## Files
- 71 HTML files in `frontend/` — change `favicon.svg` to `/favicon.svg`

## Impact
Prevents favicon from breaking if serving context changes. Mechanical find-replace.
