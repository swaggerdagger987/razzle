# DQ-415: "League Intel" vs "Bureau" terminology mismatch across pages

**Priority**: P1
**Category**: Conversion / Copy Accuracy
**Files**: `frontend/index.html`, `frontend/pricing.html`, `frontend/league-intel.html`

## Problem

The same feature is called three different things depending on where you look:

| Location | Name Used |
|----------|-----------|
| Nav link (all pages) | "League Intel" |
| Page `<title>` tag | "Bureau of Intelligence" |
| Home page copy | "Bureau" |
| Pricing feature matrix | "Bureau summary" / "Bureau deep-dive" |
| DESIGN.md brand hierarchy | "The Bureau" |

A first-time visitor who sees "League Intel" in the nav, then reads "Bureau deep-dive" on the pricing page, has no way to know these are the same feature.

## What the user sees

- Clicks "League Intel" in nav
- Sees page title "Bureau of Intelligence"
- Goes to pricing page → reads "Bureau summary (free)" / "Bureau deep-dive (Pro)"
- Confused: "Is Bureau the same as League Intel? Are there two products?"

## Why it hurts

Naming inconsistency erodes trust. If a product can't keep its own feature names straight, users question whether the team knows what they're building.

## Fix

Pick ONE name and use it everywhere. DESIGN.md says "The Bureau" so either:
1. Rename nav link to "Bureau" and page title to "Bureau — Razzle"
2. Or rename all pricing/copy references to "League Intel"

Whichever is chosen, search-and-replace across all pages.
