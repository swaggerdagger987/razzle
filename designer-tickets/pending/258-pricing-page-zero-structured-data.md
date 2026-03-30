# DES-258: Pricing page has zero JSON-LD structured data

**Priority:** P2
**Category:** SEO / Structured Data
**Affects:** pricing.html
**Cycle:** 25

## Problem

pricing.html — the dedicated conversion page — has ZERO `application/ld+json` structured data. index.html has WebApplication schema with offers. But the page Google indexes for "razzle fantasy football pricing" has nothing.

The pricing page has 9 FAQ items that could enable Google rich FAQ snippets. It has 3 pricing tiers that could enable Product/Offer rich results. Neither is marked up.

## Why This Matters

Rich FAQ snippets in Google occupy 2-3x the SERP space of regular results. Free real estate for a $0 investment. The pricing page is the highest-intent page — users searching "razzle pricing" are considering paying. Structured data makes the result more prominent and trustworthy.

## Fix

Add `<script type="application/ld+json">` to pricing.html `<head>` with:

1. **FAQPage schema** for the 9 FAQ items (questions at lines 401-443)
2. **Product schema** with 3 Offer entries (Free/$0, Pro/$79.99/yr, Elite/$149.99/yr)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the difference between Pro and Elite?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Same features. The only difference is who provides the AI..."
      }
    }
    // ... 8 more Q&A
  ]
}
```

## Scope

pricing.html only. One `<script>` block in `<head>`.

## Related

- DES-175 (pricing FAQ no structured data) — overlaps but DES-175 was FAQ-only. This ticket is holistic: FAQ + Product schema.
- DES-252 (JSON-LD missing WebSite SearchAction) — covers index.html only.
