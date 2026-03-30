---
id: DQ-485
title: "Weekly Razzle briefings" promised on home + pricing pages — feature may not exist
severity: P1
category: content-accuracy
files: frontend/index.html, frontend/pricing.html
lines: index.html:836, pricing.html:308
---

## Problem

Both the home page and pricing page promise "Weekly Razzle briefings" as an Elite tier feature. There is no backend endpoint, no scheduled job, and no frontend implementation for generating or delivering weekly briefings. This is a marketing claim for an unbuilt feature.

If users upgrade to Elite expecting weekly briefings and receive nothing, this is a broken promise that damages trust and could trigger refund requests.

## Expected

Either:
1. **Remove the claim** from both pages until the feature is built, OR
2. **Reword** to something deliverable (e.g., "Weekly data refreshes" or "Priority support")

## Acceptance Criteria

- "Weekly Razzle briefings" either has a working implementation or is removed from marketing copy
- Home page and pricing page are consistent
