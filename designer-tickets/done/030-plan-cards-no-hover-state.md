# DES-030: Plan cards missing hover state on conversion page

**Priority**: P1
**Area**: pricing.html
**Impact**: The pricing plan cards — the conversion page's most important elements — have zero `:hover` CSS. DESIGN.md explicitly says "hover-lift — interaction should feel physical." Every other card on the site lifts on hover. The pricing cards are static and flat.

## The Problem

`frontend/pricing.html` line 82:
```css
.plan-card {
  background: var(--bg-card, #f7efe5);
  border: 3px solid var(--ink);
  border-radius: var(--radius);
  padding: 28px 24px;
  position: relative;
  box-shadow: 4px 4px 0 var(--ink);
}
/* No .plan-card:hover rule exists anywhere */
```

Confirmed: grep for `plan-card.*hover` and `pricing-card.*hover` returns zero results across the entire codebase.

## The Fix

```css
.plan-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
  transition: all 0.15s ease;
}
.plan-card {
  transition: all 0.15s ease;  /* add to base rule */
}
```

For the colored variants:
```css
.plan-card.free:hover { box-shadow: 6px 6px 0 var(--green); }
.plan-card.elite:hover { box-shadow: 6px 6px 0 var(--purple); }
```

## Why This Matters

Pricing is the conversion page. When a user hovers over a plan card, they should FEEL the interaction — the card should lift, inviting them to click. Static cards feel dead. The design guide mandates hover-lift on all interactive elements. This is the single most important page to get right.
