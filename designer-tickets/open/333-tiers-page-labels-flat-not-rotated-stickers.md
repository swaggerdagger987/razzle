---
id: DES-333
priority: P2
area: tiers page
section: tier labels
type: design system compliance
status: open
---

# Tiers page tier labels are flat rectangles, not rotated stickers

## What's wrong

On tiers.html, the S/A/B/C/D/F tier labels appear as flat solid-color vertical bars on the left side of each tier row. They have no rotation, no border, no offset shadow, and no sticker aesthetic.

DESIGN.md explicitly says: "Tier Stickers: slightly rotated (rotate(3deg)) — slapped on, not placed." The tier labels should look like physical stickers that someone slapped onto the page at a slight angle — matching the comic-strip, handmade aesthetic.

## Where

`frontend/tiers.html` — the tier label elements in each tier section (S through F).

## Evidence

Tiers page screenshot: flat colored rectangles (red S, orange A, yellow B, green C, teal D, gray F) flush-left with no rotation, no border, no shadow. Compare to DESIGN.md spec: "slightly rotated (rotate(3deg)), chunky borders, offset shadows."

## Suggested fix

1. Add `transform: rotate(-3deg)` to tier label elements (negative for left-side labels looks natural)
2. Add `border: 2px solid var(--ink)` for the chunky sticker border
3. Add `box-shadow: 3px 3px 0 var(--ink)` for the offset shadow
4. Add `border-radius: var(--radius-sm)` for sticker-shaped rounding
5. Consider overlapping the label slightly over the tier content edge for the "slapped on" effect

## Why this matters

The tiers page is a flagship dynasty tool and highly shareable (PNG export). Flat rectangles look like a Bootstrap template. Rotated stickers look like Razzle. This is one of the most screenshot-worthy pages — it should ooze the brand.
