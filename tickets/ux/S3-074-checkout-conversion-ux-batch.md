---
id: S3-074
severity: S3
confidence: MEDIUM
category: conversion-ux
source: DQ-217+228+229+241+262+267+268+299+272
status: OPEN
---

# Checkout and conversion UX — 9 copy/interaction issues that hurt conversion

## Root Cause

Multiple pricing/checkout UX issues that may reduce conversion:

1. **Pro card "free API key" confusing** — `frontend/pricing.html`: BYOK messaging unclear to non-technical users (DQ-217)
2. **Auth register no trial incentive** — `frontend/app.js`: registration form doesn't mention 7-day trial benefit (DQ-228)
3. **Sleeper prompt creates anxiety** — `frontend/league-intel.html`: permanent connection prompt without explaining why/data safety (DQ-229)
4. **Pricing preview copy misleads** — `frontend/pricing.html`: "preview" label on free features unclear whether it's limited (DQ-241)
5. **Home CTAs hardcode yearly only** — `frontend/index.html`: pricing CTAs link to yearly only, no monthly option visible (DQ-262)
6. **Save badge 33% ignores Elite 37%** — `frontend/pricing.html`: save percentage badge shows 33% but Elite actually saves 37% (DQ-267)
7. **Home elite card omits trial** — `frontend/index.html`: Elite feature card doesn't mention 7-day trial (DQ-268)
8. **Current plan buttons still clickable** — `frontend/agents.html`: buttons for user's current plan are still interactive instead of showing "Current Plan" (DQ-299)
9. **Checkout button no loading state** — Note: app.js:1241-1243 DOES show loading state per verification, but the DQ-272 finding references additional checkout buttons on pricing.html that may not use startCheckout()

## Fix

Copy and interaction improvements at each location. Each is an independent fix.

## Files

- `frontend/pricing.html` — multiple copy improvements
- `frontend/app.js` — registration modal copy
- `frontend/league-intel.html` — connection prompt
- `frontend/index.html` — CTA buttons and feature cards
- `frontend/agents.html` — current plan button state

## Acceptance Criteria

- Trial mentioned in registration and Elite card
- Save percentages are accurate
- Current plan button is disabled/styled differently
- Sleeper connection has data safety note
