# DES-217: "free API key (~$1-3/mo)" copy is self-contradictory on conversion pages

**Priority**: P0 (Conversion blocker — confuses pricing on the two highest-traffic pages)
**Pages**: index.html, pricing.html
**Category**: Copy accuracy / Conversion

## The Problem

The Pro tier feature list says "free API key (~$1-3/mo)" in three places:

1. **index.html line 814**: `6 AI agents, 20 queries/day — free API key (~$1-3/mo)`
2. **pricing.html line 282**: `20 AI queries/day — you provide a free API key (~$1-3/mo)`
3. **pricing.html line 327**: `Pro: you bring a free API key (~$1-3/mo)`

"Free" followed by a cost in parentheses is contradictory. Users will read this as:
- "Wait, is it free or $1-3/mo?"
- "Is this an extra hidden cost on top of the $9.99/mo subscription?"
- "This feels like bait-and-switch"

The FAQ at pricing.html line 402 explains it correctly: "you create a free API key from OpenRouter (60 seconds, costs $1-3/month in usage)." The key is free to CREATE; the AI usage costs $1-3/mo. But the card copy (what users see FIRST) doesn't make this distinction.

## Evidence

- NORTH_STAR.md: "Pro = BYOK (bring your own API key — OpenRouter, Anthropic, OpenAI)"
- agents.html line 1925: correctly says "Bring your own API key (BYOK)"
- app.js line 783: correctly says "Situation Room (bring your own AI key)"

## The Fix

Replace "free API key (~$1-3/mo)" with clear BYOK language:

**index.html line 814**:
```
6 AI agents, 20 queries/day — bring your own API key
```

**pricing.html line 282**:
```
20 AI queries/day — bring your own API key (~$1-3/mo usage)
```

**pricing.html line 327**:
```
Pro: bring your own API key (~$1-3/mo usage). Elite: we handle everything.
```

The parenthetical cost is fine on the pricing page (users expect detail there). The home page should be simpler — just "bring your own API key" with no cost number.

## Why This Matters

Confusing pricing copy is the #1 conversion killer. A Reddit user lands on razzle.lol, scrolls to pricing, sees "free" next to a dollar amount, and their trust drops. They close the tab. The product is $9.99/mo — don't introduce ambiguity about whether there are additional costs.
