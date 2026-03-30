# DES-263: Only lab.html has a unique OG image — 74 pages share one generic image

**Priority:** P2
**Category:** Social Sharing / Distribution
**Affects:** 74 of 75 pages
**Cycle:** 25

## Problem

Only 2 OG images exist:
- `og-image.png` — used by 74 pages (generic Razzle branding)
- `og-image-lab.png` — used by lab.html only

When someone shares `/rankings.html`, `/tradefinder.html`, `/pricing.html`, or ANY of the 70+ panel pages on Twitter/Reddit/Discord, they all show the identical generic preview image. There's no visual differentiation.

## Why This Matters

Each page is a potential social share. The growth flywheel says "every screenshot is a billboard." But shared links to different tools all look identical in preview cards. A user sharing the Trade Finder gets the same preview as someone sharing Aging Curves. This reduces click-through rates — people scroll past identical-looking links.

The pricing page especially needs its own OG image — it's the highest-intent share target ("check out this pricing, only $80/yr").

## Fix

Phase this:

1. **Immediate (P2):** Create OG images for the 5 highest-traffic/share pages:
   - pricing.html — "The Screener is forever free. Pro $79.99/yr."
   - league-intel.html — "Connect your league. See what your rivals can't."
   - agents.html — "Six AI agents that already know your league."
   - compare.html — "Player Comparison Tool"
   - tradefinder.html — "Trade Finder"

2. **Later:** Generate page-specific OG images programmatically (SVG template → PNG).

Each image should be 1200x630, follow DESIGN.md aesthetic (sand bg, chunky border, display font, tiger emoji).

## Scope

5 new PNG files in `/assets/`. Update `og:image` and `twitter:image` meta tags on 5 pages.
