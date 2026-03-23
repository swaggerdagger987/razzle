# DES-240: Home page "social proof" section contains zero actual social proof

**Priority:** P1 — conversion gap
**Page:** index.html lines 728–747
**Cycle:** 23

## Problem

The section at line 728 is labeled `<!-- Social proof -->` in the HTML and uses class `social-card`. The h2 reads "Built for the managers who live on r/DynastyFF." But the three cards are feature benefit statements:

1. "The Screener" — describes filtering capability
2. "Share to Win" — describes PNG export
3. "Powered by nflverse" — describes data source

This is feature marketing, not social proof. Social proof is: testimonials, user quotes, Twitter embeds, community mentions, usage stats ("10,000 managers use Razzle"), or Reddit screenshots.

A CSS class `.social-card-user` (line 448) exists with Caveat font styling — suggesting user attribution was planned but never implemented. The class is defined but used by zero HTML elements.

## Fix

Phase-appropriate options:

**Pre-launch (now):** Replace with credibility signals that don't require users:
- Data stats: "1,200+ NFL players. 9,800+ college players. 100+ stat columns. Updated weekly."
- Open source data credibility: "Powered by nflverse — the same open data used by PFF analysts and NFL front offices."
- Technical credibility: "10 seasons of data. Zero guesswork."

**Post-launch (after Twitter/Reddit traction):** Replace with real user quotes, tweet embeds, or Reddit screenshot with community response.

## Why this matters

The home page conversion path is: hero → features → social proof → Bureau → Situation Room → pricing. The "social proof" step currently repeats feature benefits already shown. It's a wasted section on the #1 conversion page. r/DynastyFF users verify everything — fake social proof would be caught. Real credibility signals (data volume, source quality) are verifiable and trustworthy.
