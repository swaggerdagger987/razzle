---
id: DQ-266
title: Pricing hero says "No trial that expires" while the same page offers a "7-day free trial"
priority: P2
category: copy
status: open
cycle: 36
---

## Problem

The pricing page hero subtext says:

> "No account. No catch. **No trial that expires.** Pro and Elite add the intelligence layer."

But on the same page, the Pro card includes:

> "7-day free trial" (feature list highlight)
> "7-day Pro trial on sign-up. No credit card required." (CTA note)

"No trial that expires" directly contradicts "7-day free trial" — which is, by definition, a trial that expires after 7 days. A visitor reading top-to-bottom hits both messages and loses trust.

## Evidence

`frontend/pricing.html`:
- Line ~231: hero paragraph contains "No trial that expires"
- Line ~277 area: Pro card feature list includes "7-day free trial"
- CTA area: trial signup note

Same contradiction exists on `frontend/index.html` line ~787.

## Fix

Change "No trial that expires" to match reality. Options:

**Option A:** "No catch. No credit card required to start." (removes trial contradiction)
**Option B:** "No catch. Try Pro free for 7 days." (leans INTO the trial)
**Option C:** "No catch. The Screener never expires." (clarifies what's permanent)

Option C is most aligned with the brand: the Screener is forever free, Pro has a trial. Make that distinction explicit.

## Files
- `frontend/pricing.html` line ~231
- `frontend/index.html` line ~787 (same copy appears here)

## Impact
Trust-damaging copy contradiction on the two highest-traffic pages. Users notice.

## Not a dupe of
- DQ-356 — that's about the CTA button text not reinforcing "no account", not the trial contradiction
- DQ-060 — that's about Caveat font on pricing copy
