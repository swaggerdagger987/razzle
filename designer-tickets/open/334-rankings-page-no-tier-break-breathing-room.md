---
id: DES-334
priority: P2
area: rankings page
section: tier rows
type: visual hierarchy
status: open
---

# Rankings page has no visual tier breaks between player groups

## What's wrong

On rankings.html, player chips flow from tier to tier with only a subtle background color change as the visual separator. There are no explicit tier break labels, no dividers, no sticker-style tier indicators. The page reads as one continuous wall of player chips — you have to squint at background tint to know where Tier 1 ends and Tier 2 begins.

The tiers.html page at least has colored tier labels. The rankings page has nothing — just a faint tint change.

## Where

`frontend/rankings.html` — the tier group containers that hold player chips.

## Evidence

Rankings page screenshot: hundreds of player chips in colored-background rows with minimal vertical spacing. No tier labels, no dividers, no visual hierarchy cues. A user scrolling through sees a dense wall of names without clear grouping.

## Suggested fix

1. Add a tier label sticker (matching DES-333 style) at the start of each tier group: "TIER 1", "TIER 2", etc.
2. Add 16-24px vertical gap between tier groups
3. Add a dashed divider line (`2px dashed var(--ink-faint)`) between tiers — DESIGN.md approves this for internal card dividers
4. Consider alternating card background tints more aggressively between tiers

## Why this matters

The rankings page is one of the most-visited dynasty tools. Players share rankings on Reddit and Discord. If the tier structure isn't immediately visible, the page loses its organizational value — it just looks like a list sorted by number, not a curated tier board.
