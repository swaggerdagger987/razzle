---
id: DQ-313
title: No refund policy or money-back guarantee anywhere on pricing or about page
priority: P1
category: conversion-blocker
page: pricing.html
---

## Problem
The pricing FAQ (line 412) mentions cancellation: "You keep access through the end of your billing period. No cancellation fees, no hassle." But there is zero mention of refunds or money-back guarantees anywhere on the site.

For a $80-240/yr subscription from an unknown brand, this is a conversion blocker. Reddit power users will notice. A "30-day money-back guarantee" is standard SaaS table stakes.

## Expected
Add refund policy to pricing FAQ. Something like: "Not satisfied? Email us within 30 days for a full refund. No questions asked."

## Fix
- `frontend/pricing.html` FAQ section (~line 413): add new FAQ item about refund policy
- Optionally add to `frontend/about.html` privacy/legal section

## Files
- `frontend/pricing.html` (FAQ section)
