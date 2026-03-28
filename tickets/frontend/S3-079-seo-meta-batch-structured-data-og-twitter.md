---
id: S3-079
severity: S3
confidence: MEDIUM
category: seo
source: DQ-172+175+206+251+252+257+258+263
status: OPEN
---

# SEO and meta tags batch — structured data, OG images, Twitter cards, PWA

## Root Cause

Multiple SEO and meta tag gaps:

1. **No web manifest / apple-touch-icon** — sitewide: no PWA manifest, no apple-touch-icon for home screen bookmark (DQ-172)
2. **Pricing FAQ no structured data** — `frontend/pricing.html`: FAQ content not marked up with FAQPage JSON-LD schema (DQ-175)
3. **No format-detection meta** — sitewide: Safari auto-links phone numbers and stat values like "123.4" (DQ-206)
4. **No viewport-fit=cover** — sitewide: iPhone notch area not utilized; `viewport-fit=cover` missing (DQ-251)
5. **No SearchAction JSON-LD** — sitewide: Google sitelinks search box requires WebSite + SearchAction structured data (DQ-252)
6. **twitter:site meta missing** — 75 pages: no `twitter:site` meta tag for @razzle_lol attribution (DQ-257)
7. **Pricing zero structured data** — `frontend/pricing.html`: no JSON-LD for pricing plans (DQ-258)
8. **Only lab has unique OG image** — `frontend/`: only lab.html has a distinct og:image; all other pages share the same default (DQ-263)

## Fix

- Add `manifest.json` and apple-touch-icon
- Add FAQPage JSON-LD to pricing FAQ
- Add `<meta name="format-detection" content="telephone=no">`
- Add `viewport-fit=cover` to viewport meta
- Add twitter:site meta sitewide
- Create unique OG images for key pages

## Files

- `frontend/` — all 75 pages (meta tags)
- `frontend/pricing.html` — structured data
- Root — manifest.json (new file)

## Acceptance Criteria

- FAQ displays as rich result in Google
- Twitter cards attribute @razzle_lol
- Apple device home screen shows custom icon
- Stats not auto-linked as phone numbers on Safari
