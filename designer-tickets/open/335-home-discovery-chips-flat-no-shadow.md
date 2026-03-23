---
id: DES-335
priority: P2
area: home page
section: one-click discovery filters
type: design system compliance
status: open
---

# Home discovery filter chips are flat pills with no shadow or sticker aesthetic

## What's wrong

The five discovery filter chips on the home page (Breakout Candidates, Buy Low Targets, Workhorses, Sleepers, Rookies) appear as flat outlined pills with no box-shadow, no hover-lift effect, and no sticker energy.

DESIGN.md says: "Chips/Badges: sticker-shaped, 2px borders, pill-rounded, hover adds shadow + lift." These chips are in the center of the home page's discovery section — they should look like physical stickers you want to peel off and click.

## Where

`frontend/index.html` — the discovery filter section between "What you get" and "Built for the managers."

## Evidence

Home page screenshot: the 5 discovery chips appear as flat outlined pills with thin borders. No offset shadow at rest, no visual depth. They blend into the page instead of popping off it.

## Suggested fix

1. Add `box-shadow: 3px 3px 0 var(--ink)` at rest for the offset sticker look
2. Ensure `border: 2px solid var(--ink)` (not thinner)
3. Add hover-lift: `transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--ink)` on hover
4. Consider a very slight rotation on alternating chips (1-2deg) for the "slapped on" sticker feel
5. Make backgrounds use light position tints or `var(--bg-card)` instead of transparent

## Why this matters

These chips are the home page's mid-funnel CTA — they bridge "looking" and "doing." If they look flat, users scroll past. If they look like interactive stickers, users click. The design system already defines what chips should look like — these just need to match.
