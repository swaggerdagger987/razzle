<!-- PM: ready -->
---
id: DES-343
priority: P2
area: tradevalues.html
section: page header
type: UX / comprehension
status: open
---

# Trade Values page opens with dense bar chart and zero contextual explanation

## What's wrong

The Dynasty Trade Value Chart page (tradevalues.html) launches directly into a long list of horizontal position-colored bars ranked by trade value. There is no header explanation of:

- What the trade value number represents
- How it's calculated (production 50% + age 30% + scarcity 20%)
- What the 8 tiers mean (Elite, Blue Chip, Premium, etc.)
- How to use this for actual trades

A first-time visitor sees a wall of colored bars with numbers and has no idea what they mean or why they should care.

## Where

`frontend/tradevalues.html` — the page body starts with position filters and the bar chart immediately. No introductory section.

## Evidence

Screenshot: tradevalues-desktop.png — the page goes directly from the nav bar + title to the bar chart list. The bars are beautiful but context-free.

## Suggested fix

1. Add a brief methodology section below the title in Caveat font: "composite value: 50% production + 30% age curve + 20% positional scarcity"
2. Show the tier legend as color-coded chips at the top: "Elite (90+) | Blue Chip (75+) | Premium (60+)..."
3. Add a one-line Caveat annotation: "the number your leaguemates wish they had"

Keep it minimal — 2-3 lines max. Trust the user, but give them the key to read the chart.

## Why this matters

Trade value charts are among the most shared dynasty content on Reddit. If a user screenshots this and posts it, commenters will ask "what do the numbers mean?" A brief methodology note prevents that and adds credibility.
