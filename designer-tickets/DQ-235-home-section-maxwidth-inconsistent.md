---
id: DQ-235
priority: P2
category: layout / home page
pages: index.html
status: open
cycle: 33
---

# Home page sections have inconsistent max-width — 860px vs 760px

## What's wrong

The home page `.lp-section` class defaults to `max-width: 760px`, but some sections override inline to `max-width: 860px`:

- Lines 689, 716, 729: Feature cards, discovery filters, and social proof use `max-width: 860px` (inline)
- Lines 752, 761: Bureau CTA and Situation Room sections use default 760px

This creates a visible content-width jump as the user scrolls — wider sections suddenly narrow by 100px, then widen again. The effect is subtle but makes the page feel unpolished.

Additionally, the grid gaps within sections differ: feature cards use `gap: 16px; margin-top: 24px` while social proof uses `gap: 14px; margin-top: 20px`.

## Fix

Standardize all `.lp-section` instances to one width. 860px is the better choice (gives feature cards breathing room):

```css
.lp-section { max-width: 860px; }
```

Remove all inline `max-width: 860px` overrides. Standardize grid gaps to `gap: 16px; margin-top: 24px`.

## Verification

Scroll the full home page. All content sections should have the same width. No horizontal "breathing" as you scroll.
