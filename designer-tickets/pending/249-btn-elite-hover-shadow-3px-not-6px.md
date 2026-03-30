# DES-249: .btn-elite:hover shadow 3px — less than base 4px

**Priority**: P2
**Area**: pricing.html
**Cycle**: 24

## Problem

The Elite CTA button shrinks its shadow on hover instead of growing it:

```css
.btn-elite:hover { box-shadow: 3px 3px 0 var(--purple); }
```

DESIGN.md specifies:
- Base shadow: `4px 4px 0`
- Hover shadow: `6px 6px 0` with `translate(-2px, -2px)`

The `.plan-card:hover` on the SAME page correctly implements the 4px → 6px lift (line 90). The `.btn-elite:hover` goes backwards: 4px → 3px. No translate either.

This is the $149.99/yr Elite conversion button — the highest-value CTA on the conversion page.

## Evidence

- `pricing.html:166` — `.btn-elite:hover { box-shadow: 3px 3px 0 var(--purple); }`
- `pricing.html:90` — `.plan-card:hover { box-shadow: 6px 6px 0 var(--ink); ... }` (correct)
- DESIGN.md: "Hover lift: 6px 6px 0 + translate(-2px, -2px)"

## Fix

```css
.btn-elite:hover {
  box-shadow: 6px 6px 0 var(--purple);
  transform: translate(-2px, -2px);
}
```

## Why This Matters

The Elite plan is the highest-margin product ($149.99/yr). Its CTA button feels flat and broken on hover — the opposite of the "interaction should feel physical" design principle. The plan card lifts but the button inside it shrinks.
