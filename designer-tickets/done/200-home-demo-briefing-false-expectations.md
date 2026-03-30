<!-- PM: ready -->
# DQ-405: Home Page Demo Briefing Creates False Paywall Expectations

**Priority**: P2 (trust / expectation management)
**Category**: Copy Accuracy / Conversion
**Page**: index.html (Home)

## Problem

The demo briefing card on the home page (~line 767) shows a realistic league-specific scenario:

> "Team 'Dynasty or Bust' just dropped Keenan Allen to waivers. Based on 'Taco Tuesday's FAAB patterns (they bid 40%+ on WR2s three times this season), they'll bid $47. You should bid $52 to guarantee the pickup."

This reads like actual league-specific intelligence. A visitor expects this level of personalization immediately after signup. It doesn't come — it requires:
1. Sleeper connection (must authenticate)
2. Pro or Elite subscription
3. Entering a real league
4. Having an API key set up (Pro) or Elite subscription

The demo copy implies "this is what you get" but a free user gets nothing like this. The gap between expectation and reality causes bounces.

## Fix

Add a subtle label above or below the demo briefing: "Example with Sleeper league connected (Pro)" or style it as a clearly-labeled demo with a muted banner: "DEMO — connect your league to get personalized intel like this."

## Evidence

- Line ~767 in index.html: demo briefing with specific league names and FAAB amounts
- No visual indicator that this requires paid tier + Sleeper connection
- Pricing page (pricing.html) is clearer about requirements, but home page creates expectations first
