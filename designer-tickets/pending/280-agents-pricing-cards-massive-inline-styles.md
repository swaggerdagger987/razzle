# DES-280: agents.html pricing cards use massive inline styles

**Priority**: P2
**Page**: agents.html (Situation Room)
**Affects**: Mobile responsiveness, dark mode, maintainability

## Problem

The Situation Room pricing section (lines 1907-1960) has ~40+ inline style properties across 2 pricing cards, 1 "recommended" badge, and 1 feature comparison table. Zero CSS classes are used.

This means:
- Can't target with `@media` queries for mobile responsive adjustments
- Can't target with `[data-theme="dark"]` for dark mode overrides (see DES-278)
- Can't be maintained or updated consistently

Same anti-pattern as DES-276 (pricing free-celebration inline styles) and DES-196 (pricing trial sections) — but on the Situation Room page.

## Evidence

```html
<!-- agents.html line 1907 — Pro card -->
<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); padding:24px 24px; text-align:left; min-width:220px; max-width:300px; flex:1;">

<!-- agents.html line 1937 — Recommended badge -->
<div style="position:absolute; top:-11px; left:50%; transform:translateX(-50%) rotate(-2deg); background:var(--orange); color:var(--bg); font-family:var(--font-mono); font-size:10px; padding:2px 12px; border-radius:20px; border:2px solid var(--ink); box-shadow:2px 2px 0 var(--ink);">
```

## Fix

Extract inline styles into CSS classes (`.sr-plan-card`, `.sr-plan-badge`, `.sr-plan-table`). This enables dark mode rules (DES-278) and mobile responsiveness in one refactor.

## Why This Matters

The agents page pricing section is unreachable by CSS media queries. On 375px mobile screens, the 220px min-width cards side by side may overflow or require horizontal scroll. CSS classes enable responsive adjustments.
