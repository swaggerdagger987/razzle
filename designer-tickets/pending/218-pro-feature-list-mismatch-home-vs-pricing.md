# DES-218: Pro feature list differs between home page and pricing page

**Priority**: P1 (Conversion consistency — comparison shoppers see different features)
**Pages**: index.html, pricing.html
**Category**: Copy accuracy / Conversion

## The Problem

The Pro tier feature list on the home page and pricing page list DIFFERENT features:

**Home page Pro card (index.html lines 812-821):**
- Everything free, plus:
- 6 AI agents, 20 queries/day — free API key (~$1-3/mo)
- Full Bureau deep-dive
- Manager profiles + trade finder
- Championship probability
- Unlimited formulas + cloud sync
- CSV export + compare up to 4
- 7-day free trial

**Pricing page Pro card (pricing.html lines 280-289):**
- Everything free, plus:
- 20 AI queries/day — you provide a free API key (~$1-3/mo)
- League-contextualized agents
- Unlimited custom formulas
- Cloud sync (formulas, watchlist, views)
- CSV export
- Compare up to 4 players
- Roster grading
- 7-day free trial

**Features on home but NOT pricing page:**
- "Full Bureau deep-dive"
- "Manager profiles + trade finder"
- "Championship probability"

**Features on pricing but NOT home page:**
- "League-contextualized agents"
- "Roster grading"

## Evidence

The pricing page feature comparison matrix (lines 340-390) includes ALL features correctly. The inconsistency is between the two card-level summaries that users compare.

## The Fix

Align both cards to the same feature list. The pricing page should be the canonical list; the home page should be a subset with "and more →" linking to pricing.html. At minimum:

1. Both cards should mention "League-contextualized agents" (the #1 differentiator)
2. Both cards should mention "Bureau deep-dive" (the conversion driver)
3. "Roster grading" should appear on both or neither

## Why This Matters

Users who visit both pages and see different feature lists lose trust. "Wait, does Pro include Bureau deep-dive or not?" The home page lists conversion-critical features (Bureau, championship probability) that the pricing page omits. The pricing page lists "Roster grading" that the home page omits. Neither page gives a complete picture. This creates friction at the exact moment users are deciding whether to pay.
