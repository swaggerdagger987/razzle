# CEO-032: Landing Page Hero — Replace ChatGPT Comparison

**ID**: 20260321-160002-032
**Page**: Landing
**Type**: structural
**Severity**: P0
**Created**: 2026-03-21 (CEO Review #3)
**Supersedes**: CEO-001 (same problem, more specific AFTER)

## Problem

The hero headline "ChatGPT doesn't know your league. Razzle does." positions Razzle as an AI competitor. Razzle is a free research lab that also has AI. The headline should sell the free tool, not the paid intelligence.

This has been flagged in three consecutive CEO reviews. This ticket provides exact replacement copy.

## BEFORE

```html
<h1>ChatGPT doesn't know your league. <span>Razzle does.</span></h1>
<div class="hero-sub">The Screener is forever free. The intelligence is what you pay for.</div>
```

## AFTER

```html
<h1>The free fantasy football <span>research lab.</span></h1>
<div class="hero-sub">100+ stats. 10 seasons. Custom formulas. No account required.</div>
```

Alternative (if "research lab" feels too clinical):
```html
<h1>The fantasy football tool <span>your leaguemates don't know about.</span></h1>
<div class="hero-sub">Free screener. 100+ stats. AI agents that know your league.</div>
```

## Why

- "Free" must be in the first 3 words a stranger reads
- "Research lab" matches the product's north star positioning
- The subheadline should list concrete capabilities, not a business model statement
- "No account required" reduces friction — they can click "Open the Screener" and go

## Acceptance Criteria

- [ ] Hero h1 no longer mentions ChatGPT
- [ ] Hero h1 communicates "free" and "fantasy football" within 8 words
- [ ] Hero subheadline lists at least 2 concrete capabilities
- [ ] Both CTAs remain: "Open the Screener" (primary) + "Connect your league" (secondary)
