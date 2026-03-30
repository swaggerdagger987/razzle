# DES-329: Pricing mobile — trial banner fills entire above-fold viewport at 375px

**Priority**: P1
**Category**: Mobile UX — Content Hierarchy
**Affects**: frontend/pricing.html at 375px width
**Cycle**: 4 (visual QA)

## Problem

On mobile (375px), the trial promotion banner ("7 DAYS OF PRO. ON THE HOUSE.") is so large that it fills the entire above-fold viewport. Users see nothing but the trial banner and must scroll to discover any pricing information. The actual pricing content — plan cards, feature comparisons, "forever free" messaging — is all pushed below the fold.

## Evidence

Screenshot at 375x812 viewport shows: trial banner with 20px heading + 13px body + "Create Free Account" button + generous padding fills the entire visible area. The "THE SCREENER IS FOREVER FREE" heading is completely invisible without scrolling.

## Fix

Add mobile overrides to reduce the trial banner's visual dominance:

```css
@media (max-width: 480px) {
  #trialBanner {
    padding: 12px 16px !important;
  }
  #trialBanner > div:first-child {
    font-size: 16px !important;
  }
}
```

Or better: restructure so the "forever free" hero appears first on mobile, with the trial banner as a secondary element below it.

## Why it matters

A user landing on /pricing.html on their phone sees a giant sign-up prompt before they even know what the product costs. The pricing page's job is to explain value — not gate it behind a promotion banner.
