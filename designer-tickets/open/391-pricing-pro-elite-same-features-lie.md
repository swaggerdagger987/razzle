---
id: DQ-391
priority: P1
area: pricing.html
section: feature comparison
type: copy / trust
status: open
---

# Pricing page claims Pro and Elite have "same features" — they don't

## What's wrong

pricing.html line 327 says:

> "Pro and Elite have the same features. The only difference is who provides the AI."

This is factually wrong. The feature comparison matrix on the same page shows Elite has features Pro does NOT:

- Agent memory (line 374)
- Weekly briefings (line 375)
- Priority data refresh (line 310-311)
- Full historical data (line 311)
- Unlimited queries vs 20/day (line 309)

A user reading this sentence will feel lied to when they compare the two columns. This is a trust-destroying copy error on the CONVERSION page.

## Where

- `frontend/pricing.html` line 327: the misleading sentence
- `frontend/pricing.html` lines 354-390: feature matrix that contradicts the sentence

## Suggested fix

Replace the sentence with something accurate:

> "Pro gives you the full film room. Elite removes all limits and runs the AI for you — no API key needed."

This is honest and still makes the value split clear.

## Why this matters

The pricing page is the single highest-stakes page for trust. One verifiably false claim poisons the entire brand. r/DynastyFF users WILL read both columns and notice the lie.
