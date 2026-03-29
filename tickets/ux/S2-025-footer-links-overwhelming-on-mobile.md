---
id: S2-025
severity: S2
category: ux
title: Landing page footer has dozens of links — overwhelming on mobile
source: deep-audit
status: open
---

## Problem

The index.html footer contains dozens of links organized into categories (Dynasty Analytics, Weekly Stats, Analytics Features, etc.). This is SEO-friendly but visually dense, especially on mobile where users must scroll through a long list.

## Root Cause

`frontend/index.html` — footer section contains all tool/page links for SEO crawl purposes.

## Fix

1. On mobile (480px), collapse footer categories into expandable accordions
2. Or limit mobile footer to top 10-15 most important links with "View all tools" expansion
3. Desktop layout can remain as-is (SEO value)

## Accept When

- Footer is not overwhelming on 390px mobile viewport
- SEO link value is preserved (all links still in DOM)
