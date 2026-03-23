# DES-331: Pricing plan cards missing 6px colored top accent stripe

**Priority**: P2
**Category**: Design System Compliance
**Affects**: frontend/pricing.html plan cards, frontend/index.html pricing section
**Cycle**: 4 (visual QA)

## Problem

DESIGN.md specifies cards get a "position-colored top stripe (6px)" as a key visual element. The Pro and Elite plan cards on pricing.html use uniform 3px borders on all sides with no differentiated top stripe. The stripe is a signature element of the comic-strip card aesthetic — it adds visual hierarchy and color-codes each tier.

## Evidence

pricing.html line 84-87:
```css
.plan-card {
  border: 3px solid var(--ink);
  /* No border-top override */
}
```

The Free card has green accent, Elite has purple accent — but these are applied as full-border color changes, not as a thick top stripe. DESIGN.md cards spec: "position-colored top stripe (6px)".

## Fix

Add top stripe to each plan tier:

```css
.plan-card.free { border-top: 6px solid var(--green); }
.plan-card:not(.free):not(.elite) { border-top: 6px solid var(--orange); }
.plan-card.elite { border-top: 6px solid var(--purple); }
```

Keep the 3px side/bottom borders. The top stripe adds the visual punch that differentiates Razzle cards from generic pricing tables.

## Why it matters

The thick top stripe is a core visual signature of Razzle's card system. Without it, pricing cards look like every other SaaS pricing page. With it, they feel like part of the comic-strip aesthetic.
