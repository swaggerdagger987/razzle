<!-- PM: ready -->
---
id: DES-355
priority: P2
area: index.html
section: pricing section
type: conversion / visual hierarchy
status: open
---

# Home page pricing section lacks "Most Popular" badge on Pro card

## What's wrong

The home page pricing section (lines 789-841) has three cards: Free, Pro, Elite. The Pro card has a small badge "the film room upgrade" and the Elite card has "full war machine." Neither card has a "Most Popular" or "Recommended" conversion nudge.

DQ-210 identified this same gap on pricing.html. This ticket covers the HOME PAGE pricing section specifically, which is the primary conversion surface (users see it after scrolling through features, social proof, and Bureau/Agents sections).

The Pro card uses `pricing-card--highlight` class which adds a colored border, but the visual differentiation is subtle. A user scanning the pricing section can't immediately tell which tier is the recommended choice.

## Where

- `frontend/index.html` lines 807-823: Pro pricing card
- `frontend/index.html` line 808: badge reads "the film room upgrade" — descriptive but not action-guiding

## Suggested fix

Add a "Most Popular" sticker badge to the Pro card on the home page, matching whatever fix is applied for DQ-210 on pricing.html:

```html
<div class="pricing-card pricing-card--highlight">
  <div class="popular-badge" style="transform:rotate(-2deg);">most popular</div>
  <div class="pricing-badge">the film room upgrade</div>
  ...
```

## Not a dupe of

- DQ-210 (pricing.html missing Most Popular) — that's specifically about pricing.html
- DES-330 (Free card visually subordinate on home) — that's about Free card styling, not Pro badge
- DQ-202 (pricing CTA both btn-primary) — that's about button styling, not badge

## Why this matters

The home page pricing section is the #1 conversion surface. Without a "Most Popular" nudge, users default to the cheapest paid option or bounce entirely. Standard SaaS conversion pattern.
