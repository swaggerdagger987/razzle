---
id: S3-078
severity: S3
confidence: HIGH
category: code-quality
source: DQ-161+162+168+171+191+202+244+282+283
status: OPEN
---

# Code quality batch — buttons, images, onclick handlers, window.open

## Root Cause

Multiple code quality patterns that should be modernized:

1. **Buttons missing type="button"** — `frontend/lab.html`: form-adjacent buttons without `type="button"` can trigger form submission (DQ-161)
2. **Images missing loading="lazy"** — sitewide: `<img>` elements below fold lack `loading="lazy"` attribute (DQ-162)
3. **Headshot alt empty on 29 pages** — `frontend/`: player headshot images have `alt=""` instead of descriptive alt text (DQ-168)
4. **Sign In `<a href="#">` not `<button>`** — 75 pages: Sign In link is an anchor with `href="#"` instead of a `<button>` element (DQ-171)
5. **CTA buttons massive inline onclick** — `frontend/index.html`: CTA buttons use inline `onclick="handleCheckout(...)"` with complex expressions (DQ-191+244)
6. **Formula builder span onclick** — `frontend/formulas.js`: interactive elements use `<span onclick>` instead of `<button>` (DQ-202)

Note: DQ-282 (window.open noopener) and DQ-283 (encodeURIComponent) already ticketed as S2-088 and S2-089.

## Fix

- Add `type="button"` to non-submit buttons
- Add `loading="lazy"` to below-fold images
- Add descriptive alt text to headshot images or `alt="Player headshot"`
- Replace `<a href="#">` with `<button>` for non-navigation actions
- Move inline onclick to addEventListener
- Replace `<span onclick>` with `<button>`

## Files

- `frontend/lab.html` — button types
- `frontend/` 29 pages — headshot alt text
- `frontend/app.js` — Sign In button injection
- `frontend/index.html` — CTA onclick handlers
- `frontend/formulas.js` — span onclick

## Acceptance Criteria

- No `<button>` without explicit `type` attribute near forms
- Below-fold images use lazy loading
- No `<a href="#">` for non-navigation actions
- No `<span onclick>` for interactive elements
