---
id: DQ-250
priority: P3
category: ux
page: pricing.html
---

# Pricing feature descriptions are terse — no tooltips or context

## What's wrong
Feature list items on plan cards are extremely short:
- "20 AI queries/day"
- "Bureau of Intelligence"
- "Custom formulas"

A new visitor from Reddit who just discovered Razzle has no idea what "Bureau of Intelligence" means, what an "AI query" does, or why custom formulas matter. These features need 1-line explanations on hover or inline.

## Why it matters
Feature names are internal jargon. The pricing page is where new users decide whether to pay. Every unexplained feature is friction — it forces the user to scroll to the FAQ or leave the page to figure out what they're buying.

## Fix
Add `title` attributes or lightweight tooltip hovers to each feature item:
```html
<li title="Connect your Sleeper league for personalized trade targets, manager scouting, and pressure analysis">
  Bureau of Intelligence
</li>
```

Or use the existing `.tooltip` pattern from the Lab with a small `?` icon next to ambiguous features.

## Files
- `frontend/pricing.html` — feature list items in each plan card
