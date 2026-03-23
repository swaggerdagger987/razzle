---
id: DQ-244
priority: P2
category: conversion
page: pricing.html
---

# Pricing page has zero social proof

## What's wrong
Fake testimonials were correctly removed (ticket 008). But they were never replaced with real trust signals. The pricing page currently has:
- Plan cards
- Feature comparison table
- FAQ
- Footer

Missing:
- No user/league count ("Join X fantasy managers")
- No usage stats ("X trades analyzed this week")
- No screenshot/preview of what Pro unlocks
- "Secured by Stripe" is buried in the FAQ/footer, not next to the CTA

## Why it matters
Trust signals are the #1 conversion lever on pricing pages. A visitor who arrived from the free Lab needs social proof that others have paid and found it valuable. Without it, the pricing page is just a price list.

## Fix
Add a lightweight trust bar between the plan cards and comparison table:
- "X leagues connected" (query from DB or hardcode "500+" initially)
- "Secured by Stripe" with shield icon next to the Pro CTA button
- If real testimonials exist, add 1-2 with name/league context

## Files
- `frontend/pricing.html` — add trust section between plans and comparison table
- `backend/server.py` — optionally add `/api/stats/usage` endpoint for live counts
