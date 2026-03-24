---
id: DQ-314
title: Pricing CTA says "Sign Up Free" but actually starts a 7-day Pro trial
priority: P2
category: conversion-copy
page: pricing.html
---

## Problem
When a logged-out user visits pricing.html, the Pro card CTA says "Sign Up Free" (line 673). User clicks expecting permanent free access. They actually get:
1. Account creation
2. 7-day Pro trial (auto-starts)
3. After 7 days, Pro features lock

"Sign Up Free" hides the trial nature of the offer. The FAQ (line 407) correctly says "Every new account gets 7 days of full Pro access automatically" — but the button contradicts this.

## Expected
Button text should be "Start 7-Day Trial" or "Try Pro Free for 7 Days" — sets correct expectations and is actually MORE compelling (urgency + value).

## Fix
- `frontend/pricing.html` line 673: change `'Sign Up Free'` to `'Start 7-Day Trial'`

One string replacement.
