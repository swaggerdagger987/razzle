# Ticket 029 — Custom SVG Tiger Mark

**ID**: 20260321-140011-029
**Page**: Global
**Type**: brand
**Severity**: P2
**Created**: 2026-03-21

## Problem

Every page uses the 🐯 emoji as the Razzle mascot. The emoji renders differently across platforms — Samsung's tiger looks different from Apple's, which looks different from Google's. The brand mark varies depending on which device you're using.

For a product charging $80-150/yr, a consistent, ownable brand mark matters. The emoji is fine for MVP but doesn't scale to marketing materials, OG images, favicons at multiple sizes, or print.

## BEFORE

🐯 emoji everywhere. Renders differently on every platform. Not ownable. Can't be used consistently in OG images, watermarks, or merch.

## AFTER

Custom SVG tiger mark that:
- Works at 16px (favicon), 32px (nav logo), 64px (hero), 200px+ (marketing)
- Has the "gigachad Garfield energy, toylike, unbothered, slightly smug" personality from DESIGN.md
- Uses terracotta (#d97757) as primary color
- Is a single SVG file (frontend/assets/razzle-mark.svg) referenced everywhere
- Replaces the emoji in: nav logo, hero sections, 404 page, OG images, watermark, favicon

Style: simple, bold, reads at small sizes. Think the Firefox logo's simplicity, not a detailed illustration. Tiger face — front-facing, slightly smug expression, thick outlines consistent with the chunky border aesthetic.

## Why This Matters

The watermark on every exported screenshot is currently "razzle.lol" text. A recognizable tiger mark next to the text makes the watermark a brand signal, not just a URL. Every screenshot becomes a brand impression.

## Accept When

SVG tiger mark exists. Replaces emoji in nav, hero, favicon. Looks consistent across all platforms and sizes.
