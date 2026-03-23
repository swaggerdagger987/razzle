---
id: DES-207
title: Home page feature-card, social-card, pricing-card have zero :hover lift
priority: P2
category: design-system
page: index.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

Three card types on the home page (`.feature-card`, `.social-card`, `.pricing-card`) have zero `:hover` state. No shadow increase, no transform, no lift. They sit dead flat on mouse hover.

DESIGN.md: "Hover lift: `6px 6px 0` + `translate(-2px, -2px)` — interaction should feel physical."

## Evidence

- `.feature-card` — defined at line ~328 in index.html `<style>`. No `:hover` rule exists.
- `.social-card` — defined at line ~425. No `:hover` rule exists.
- `.pricing-card` — defined at line ~487. No `:hover` rule exists.

On the SAME page, `.smart-chip:hover` (line 368) correctly adds background change + translate + shadow. The pricing page's `.plan-card:hover` (pricing.html line 89) correctly adds `6px 6px 0` shadow + `translate(-2px, -2px)`.

## Why it matters

The home page is the #1 conversion landing page. Cards that don't respond to hover feel static and unpolished — the opposite of the "chunky, physical" brand. Smart chips on the same page feel alive; cards feel dead.

## Fix

Add `:hover` rules for all three card types in the index.html `<style>` block:

```css
.feature-card:hover,
.social-card:hover,
.pricing-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Scope

index.html only. ~6 lines of CSS.
