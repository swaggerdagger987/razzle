<!-- PM: ready -->
---
id: DES-330
priority: P2
area: home page
section: pricing section
type: visual hierarchy
status: open
---

# Home page Free pricing card visually subordinate to paid cards

## What's wrong

In the home page pricing section, the Free card is a plain light-sand card, while the Pro card has an orange highlight border and the Elite card has a purple highlight border with a "full war machine" badge. The Free card has no badge, no highlight, and a simple text link CTA ("Open the Screener") instead of a styled button.

The brand hierarchy from DESIGN.md says: "The Screener (Forever Free) — The front door. When someone says 'have you used Razzle?' they mean the Screener." The Free tier is supposed to be the HERO — but visually it's the least prominent card.

## Where

`frontend/index.html` — the `.pricing-section` near the bottom of the page. The `.pricing-card` (Free) vs `.pricing-card--highlight` (Pro) vs `.pricing-card--elite` (Elite).

## Evidence

Home page screenshot: Free card is visually plain (no badge, no colored border, link-style CTA), while Pro and Elite cards have colored borders, badges ("the film room upgrade" / "full war machine"), and styled button CTAs.

## Suggested fix

1. Add a badge to the Free card: "forever free" (matching the brand line) with a slight rotation like the other badges
2. Give the Free card a green or orange top stripe to make it feel like a proper card
3. Replace the text link CTA with a styled `btn-chunky` button ("Open the Screener — Free")
4. Consider making the Free card slightly larger or adding a "most popular" or "start here" indicator

The Free card should feel like "this is the main thing" — Pro and Elite are upgrades FROM it.

## Why this matters

First-time visitors scan the pricing section to understand the product. If Free looks like an afterthought, users may think the real product is behind a paywall. The brand promise is "forever free" — the card should visually deliver on that promise.
