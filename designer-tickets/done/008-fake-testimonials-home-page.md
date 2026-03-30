---
id: DES-008
priority: P1
area: index.html (home page)
status: open
created: 2026-03-22
---

# DES-008: Fake testimonials on home page — credibility risk before Reddit seeding

## What's Wrong

The home page social proof section (lines 718-738 of `frontend/index.html`) has three fabricated testimonial cards:

1. `u/dynasty_degenerate` — "Just found this free screener..." — fake Reddit user
2. `"a concerned league member"` — "I sent my leaguemate a Razzle screenshot..." — generic
3. `@fantasychaos` — "This free tool has better data visualizations..." — fake Twitter user

These are fictional quotes attributed to non-existent users.

## Why It Matters

Phase 3 of the roadmap is Reddit seeding on r/DynastyFF. Dynasty Reddit users are skeptical and will Google these usernames. When they discover `u/dynasty_degenerate` doesn't exist and `@fantasychaos` is a fake account, the credibility damage will be severe and permanent.

r/DynastyFF has caught other tools faking social proof before. It's a death sentence for trust.

## Fix

**Option A (recommended):** Remove the entire social proof section. Replace with a "Built for r/DynastyFF" section that shows real product features instead of fake quotes — e.g., mini screenshots of the screener, a Caveat annotation like "the tool your leaguemates don't know about yet."

**Option B:** Replace with clearly aspirational copy that doesn't attribute to fake users — e.g., "Built for managers who..." statements about target user behaviors (no fake usernames).

**Never:** Use fabricated usernames or fake quotes. Period.

## Files

- `frontend/index.html` — lines 718-738 (social proof section)
