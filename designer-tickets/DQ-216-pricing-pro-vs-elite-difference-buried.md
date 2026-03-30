# DQ-216: Pro vs Elite pricing difference buried at bottom of page

**Priority**: P1
**Category**: Conversion / UX
**Page**: pricing.html

## What's wrong

The critical difference between Pro ($79.99/yr) and Elite ($239.99/yr) is explained in a tiny text note at `pricing.html:327-328`:

> "Pro and Elite have the same features. The only difference is who provides the AI. Pro: you bring a free API key (~$1-3/mo). Elite: we handle everything."

This note appears BELOW both pricing cards, after the user has already read through two full feature lists trying to figure out the difference. A user comparing cards sees Elite with "unlimited AI queries" and "persistent memory" and thinks Pro lacks these — but they're actually available in both, just with different API key setups.

## Fix

Move this distinction to the TOP of the pricing section, before the cards. Use a clear visual callout:

```html
<div class="pricing-explainer" style="...">
  <strong>Same features, different setup:</strong> Pro = you bring a free API key. Elite = we handle the AI for you.
</div>
```

Or better: add a row at the TOP of each pricing card that says "BYOK (Bring Your Own Key)" for Pro and "We handle the AI" for Elite, in a visually distinct badge.

## Why it matters

Confused pricing = lost conversions. If users can't tell the difference between $80/yr and $240/yr in 5 seconds, they'll leave. The BYOK model is actually a SELLING POINT for Pro (cheaper, more control) — it should be positioned prominently, not hidden.

## Not a dupe of

- DQ-202 (pricing CTA both btn-primary) — that's about button styling hierarchy
- DQ-210 (missing most popular badge) — that's about visual card distinction
