---
id: DES-209
title: btn-hero hover shadow stays 4px — DESIGN.md says 6px
priority: P3
category: design-system
page: index.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

`.btn-hero:hover` shadow stays at `4px 4px 0` — identical to the base state. DESIGN.md specifies hover lift should increase to `6px 6px 0` + `translate(-2px, -2px)`.

The translate is correct. Only the shadow increase is missing.

## Evidence

index.html `<style>` block:
- Line ~118: `.btn-hero { box-shadow: 4px 4px 0 var(--ink); }` (base)
- Line ~122: `.btn-hero:hover { box-shadow: 4px 4px 0 var(--ink); transform: translate(-2px, -2px); }` (hover — shadow SAME as base)

Compare with pricing.html `.plan-card`:
- Base: `box-shadow: 4px 4px 0 var(--ink);`
- Hover: `box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px);` (CORRECT)

## Why it matters

The hero CTAs ("Open the Screener" / "See what's inside") are the first interactive elements visitors encounter. The translate gives some lift, but without the shadow deepening, the physical "lifting off the page" illusion is incomplete.

## Fix

```css
.btn-hero:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Scope

index.html line ~122. 1 property change.
