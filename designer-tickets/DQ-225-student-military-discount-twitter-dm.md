---
id: DQ-225
title: Student/Military discount requires manual Twitter DM — not a real conversion flow
priority: P2
category: conversion
status: open
cycle: 32
---

## Problem

The pricing page's student/military discount section says: "Student/Military: 50% off any plan — DM @razzle_lol on Twitter"

This is not a real conversion flow:
1. No link to the Twitter account (just plain text)
2. User has to leave the site, open Twitter, find the account, compose a DM
3. No verification mechanism
4. No response SLA
5. A potential paying customer hits a dead end at the moment they want to buy

If you offer a discount, make it easy to claim. If you can't verify eligibility, either use an honor-system promo code or remove the offer.

## Evidence

- `frontend/pricing.html:456` (approximate — student/military section)

## Fix

**Option A** (minimum): Add a promo code like `STUDENT50` that applies 50% off, and link to the Twitter for verification questions only.

**Option B** (better): Use a `.edu` email check or military email domain check at registration time, auto-apply discount.

**Option C** (simplest): Remove the section entirely until a proper flow exists. A broken conversion path is worse than no path.

## Files
- `frontend/pricing.html` (student/military section)
