# DES-175: Pricing page FAQ has no FAQPage structured data (JSON-LD)

**Priority**: P3
**Category**: SEO
**Affects**: pricing.html — the #1 conversion page
**Cycle**: 16

## Problem

The pricing page has 9 well-structured Q&A pairs (lines 396-445) but no `FAQPage` JSON-LD schema. Google shows FAQ rich results for pages with this markup — expandable Q&A snippets directly in search results. This is free SERP real estate on the most important conversion page.

The index.html already has JSON-LD structured data (WebApplication with offers), so the pattern exists in the codebase.

## Evidence

`pricing.html:395-445` — 9 Q&A pairs with clear question/answer structure:
```html
<!-- FAQ -->
<div class="matrix-section" style="margin-top:56px;">
  <h2>Questions we keep getting</h2>
  <div>
    <div>What's the difference between Pro and Elite?</div>
    <div>Same features. The only difference is who provides the AI...</div>
  </div>
  <!-- ... 8 more Q&A pairs ... -->
</div>
```

Zero JSON-LD on the pricing page:
```
grep "application/ld+json" pricing.html → 0 results
```

## Fix

Add FAQPage JSON-LD to pricing.html `<head>`:
```html
<script type="application/ld+json">
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
    // ... 8 more
  ]
}
</script>
```

## Why it matters

FAQ rich results give the pricing page more visual real estate in Google search. Users searching "razzle pricing" or "razzle fantasy football cost" see the Q&A directly in the SERP — answering objections before they even click. This is the #1 conversion page.
