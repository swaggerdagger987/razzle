# DES-192: Home hero mascot drop-shadow 3px instead of DESIGN.md's 4px

**Priority**: P3
**Category**: Design System Compliance
**Affects**: index.html line 77 — hero mascot, first visual impression
**Cycle**: 18

## Problem

The hero mascot image uses `filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15))` but DESIGN.md specifies `4px 4px 0` as the standard box-shadow offset. The hero mascot is the very first visual element visitors see.

Additionally, the shadow uses hardcoded `rgba(45,31,20,0.15)` instead of deriving from `var(--ink)`. In dark mode, this dark-on-dark shadow is invisible.

## Evidence

`index.html:77`:
```css
filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
```

DESIGN.md specifies:
```
Box shadows: 4px 4px 0 var(--ink) on cards, containers
```

## Fix

```css
filter: drop-shadow(4px 4px 0 rgba(45,31,20,0.15));
```

For dark mode, add:
```css
[data-theme="dark"] .hero-mascot {
  filter: drop-shadow(4px 4px 0 rgba(237,224,207,0.15));
}
```

## Why it matters

First visual impression. The mascot is the brand. 3px vs 4px is subtle, but the design system exists for consistency — every shadow should use the same offset.
