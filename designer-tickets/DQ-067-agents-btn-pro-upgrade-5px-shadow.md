# DQ-067: agents.html `.btn-pro-upgrade:hover` uses off-spec `5px 5px 0` shadow

**Priority**: P3 — Subtle but inconsistent with design system
**Category**: Box Shadow Token
**Severity**: LOW — off-token shadow value on CTA button

## Problem

DESIGN.md shadow tokens:
- At rest: `4px 4px 0` (cards, containers)
- On hover: `6px 6px 0` + translate(-2px, -2px)
- Small/badges: `2px 2px 0` (chips with 2px border)

There is NO `5px 5px 0` token. agents.html line ~727:

```css
.pro-teaser-card .btn-pro-upgrade:hover {
  box-shadow: 5px 5px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

This is a conversion-critical CTA button that should use the standard `6px 6px 0` hover pattern.

## Fix

```css
.pro-teaser-card .btn-pro-upgrade:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Verification

Hover over the Pro upgrade button on the agents page. Shadow should grow to 6px, matching all other hover lifts site-wide.
