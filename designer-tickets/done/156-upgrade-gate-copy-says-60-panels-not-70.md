# DES-156: Upgrade gate says "60+ advanced panels" — should be "70+"

**Priority**: P1
**Category**: Copy / Trust
**Affects**: lab.html `_showUpgradeGate()` — every upgrade gate view
**Cycle**: 14

## Problem

The upgrade gate modal tells free users to "unlock 60+ advanced panels" but the NORTH_STAR.md, pricing page, and all marketing copy say "70+ analytical panels." This inconsistency is a trust issue — dynasty Reddit users verify claims. If one part of the product says 60+ and another says 70+, that's a credibility gap.

## Evidence

`lab.html:4389`:
```javascript
'<div style="...">unlock 60+ advanced panels, full historical data, CSV export, and custom formulas with Pro</div>'
```

Compared with:
- NORTH_STAR.md: "70+ analytical panels behind the Screener"
- pricing.html hero: "70+ analytical panels"
- DESIGN.md brand hierarchy: "70+ analytical panels behind the Screener"

## Fix

Change "60+" to "70+" in the upgrade gate copy:
```javascript
'unlock 70+ advanced panels, full historical data, CSV export, and custom formulas with Pro'
```

## Why it matters

This is a conversion-path element — it's the exact moment a free user decides whether to check pricing. The copy must match what they'll see on the pricing page. Any mismatch creates doubt. Dynasty Reddit users catch these discrepancies.
