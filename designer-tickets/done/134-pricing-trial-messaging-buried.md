# DES-134: Pricing page 7-day trial messaging buried below the fold

**Priority:** P2 — Conversion
**Component:** pricing.html
**Affects:** Trial-to-paid conversion funnel

## Problem

The 7-day free trial (no credit card required) is the single most important conversion lever — it removes all friction from trying Pro. But on the pricing page, trial messaging appears:

1. As a bullet item in the Pro feature list (line 267): `7-day free trial`
2. In the FAQ section (line 378): question about what happens after trial

Neither location is prominent. The hero section (lines 210-212) says "The Screener is forever free" but does NOT mention the trial. A user scanning the page top-to-bottom sees:
- Hero: "The Screener is forever free"
- Free celebration box
- Two upgrade cards
...and might bounce before scrolling to the Pro card's feature list where the trial is mentioned.

NORTH_STAR.md (line 97) explicitly states: "7-day free trial grants Pro access, no credit card required." This is the key conversion tool and it's below the fold.

## Evidence

- `pricing.html:267` — Trial mentioned as list item: `<li><span class="check">✓</span> 7-day free trial</li>`
- `pricing.html:378` — FAQ: "What happens after the trial?"
- `pricing.html:210-212` — Hero section: NO trial mention
- `docs/NORTH_STAR.md:97` — "7-day free trial grants Pro access, no credit card required"

## Fix

Add trial messaging to the hero section or immediately above the upgrade cards:
```html
<div style="text-align:center; margin-bottom:20px; font-family:var(--font-hand); font-size:20px; color:var(--orange);">
  try Pro free for 7 days. no credit card.
</div>
```

Or add a trial badge next to the "Two ways to upgrade" header.

## Why it matters

"Free trial, no credit card" removes the #1 objection (risk). Burying it below the fold means hesitant users bounce before seeing it. Every SaaS conversion page leads with the trial.
