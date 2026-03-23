---
id: DQ-054
priority: P2
category: conversion
page: index.html
status: open
---

# Home page "Connect Your League" section has no visual or preview

## What's wrong

The "Now connect your league. See what your rivals can't." section (line 752-755) has only a heading, subtitle text, and a single CTA button. No illustration, no mockup, no preview of what league intel looks like.

Every other section on the home page has a visual component:
- Hero: mascot + mini screener preview with live data
- What You Get: 4 feature cards
- Discovery Filters: interactive filter buttons
- Built for r/DynastyFF: social proof cards
- AI Agents: dark demo briefing cards
- Pricing: 3 pricing cards

The "Connect Your League" section breaks this visual rhythm and undersells a key conversion funnel step (Sleeper connection -> Bureau -> Situation Room upsell).

## Evidence

- index.html lines 752-755: only `<h2>`, `<p>`, and `<a>` — zero visual elements
- Screenshot: section appears as a bare text block between two visually rich sections

## Fix

Add a visual preview showing what league intel looks like after connecting:
1. A static mockup card showing "Manager Profile" preview (traits, badges, panic score)
2. Or a simplified league overview (standings snippet, rival badges)
3. Keep it simple — one card or image that shows the payoff of connecting

## Files
- `frontend/index.html` (lines 752-755)
