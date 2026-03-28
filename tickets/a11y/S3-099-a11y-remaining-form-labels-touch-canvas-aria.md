---
id: S3-099
severity: S3
confidence: MEDIUM
category: a11y
source: DQ-096+097+106+126+154+176+178+390+455+460
status: OPEN
---

# A11y remaining gaps — form labels, touch targets, canvas ARIA, webkit prefix

## Problems

1. **`backdrop-filter` missing `-webkit-` prefix** (DQ-096) — Safari users see no blur on command palette and modal overlays. Needs `-webkit-backdrop-filter` fallback.
2. **Dynamic `<img>` tags missing width/height** (DQ-097) — 38 dynamically generated images have no intrinsic size, causing cumulative layout shift (CLS) as images load.
3. **`aspect-ratio` missing on image containers** (DQ-106) — CLS risk on load as containers resize when images arrive.
4. **56 form elements without aria-label or `<label>`** (DQ-126) — WCAG Level A gap. Includes season selectors, team filters, and search inputs across standalone pages.
5. **Small interactive elements below 44px on mobile** (DQ-154) — Chips, pills, and filter tabs shrink below minimum touch target at 375px.
6. **Promo code input missing visible label** (DQ-176) — Pricing page promo input relies on placeholder only.
7. **auction.html search input missing ARIA** (DQ-178) — No `aria-label` on search field.
8. **Hero mascot emoji divs lack `aria-label`** (DQ-390) — Screen readers announce raw Unicode for the tiger emoji.
9. **19 dynamically created canvas elements lack `role="img"` + `aria-label`** (DQ-455) — Previous fix (DES-090) was incomplete.
10. **75 pages use `<a href="#" onclick>` for sign-in** (DQ-460) — Should be `<button>` for semantic correctness and keyboard accessibility.

## Fix

Each item is an independent fix. Prioritize DQ-126 (56 form elements) and DQ-460 (75 pages `<a>` → `<button>`) as they have the widest impact.

## Files

- Sitewide — form labels, sign-in button elements
- `frontend/styles.css` — `-webkit-backdrop-filter`
- `frontend/app.js` — canvas ARIA attributes
- `frontend/pricing.html` — promo input label
- `frontend/index.html` — mascot emoji ARIA

## Acceptance Criteria

1. All form controls have `aria-label` or `<label>`
2. Command palette blur works on Safari
3. Canvas elements have `role="img"` and descriptive `aria-label`
4. Sign-in links are `<button>` elements
5. No interactive element below 44px on mobile
