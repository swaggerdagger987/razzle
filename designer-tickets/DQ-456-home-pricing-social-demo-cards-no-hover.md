---
id: DQ-456
priority: P2
category: interaction
status: open
cycle: 58
---

# DQ-456: Home page pricing-card, social-card, and demo-card have no hover lift

## Problem

DQ-081 (open) covers `.feature-card` missing hover lift. Three OTHER card types on the same home page also lack hover states:

1. **`.pricing-card`** (~line 487-497) — The 3 pricing tier cards (Free/Pro/Elite). These are high-value conversion targets. No `:hover` rule.
2. **`.social-card`** (~line 425-431) — The 3 social proof cards. No `:hover` rule.
3. **`.demo-card`** (~line 284-293) — Briefing demo cards. No `:hover` rule.

All have `box-shadow: 4px 4px 0 var(--ink)` at rest but are completely static on hover. Meanwhile `.btn-hero` and `.smart-chip` on the same page DO lift.

## Fix

Add hover lift to each:
```css
.pricing-card,
.social-card,
.demo-card {
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}
.pricing-card:hover,
.social-card:hover,
.demo-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Why It Matters

DESIGN.md: "Hover lift: 6px 6px 0 + translate(-2px, -2px)." Cards that don't respond to interaction feel dead. Pricing cards especially — the conversion funnel should feel alive.

## Verification

Hover over each pricing card, social card, and demo card on the home page. All should lift with shadow growth.
