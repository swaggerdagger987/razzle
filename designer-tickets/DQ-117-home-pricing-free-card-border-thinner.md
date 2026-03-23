# DQ-117: Home pricing section — FREE card border appears thinner than PRO/ELITE

**Priority**: P3 (visual consistency)
**Category**: Component Consistency
**Severity**: Low — subtle visual inconsistency in a high-traffic section

## Problem

In the home page pricing section at the bottom, the three plan cards (FREE, PRO, ELITE) have visually different border treatments:

- **FREE card**: Light/thin border, less visual weight — looks like a lesser card
- **PRO card**: Bold terracotta/orange border with prominent shadow — strong visual anchor
- **ELITE card**: Bold purple border with shadow and "EARLY BIRD" rotated badge — strongest visual pull

Per DESIGN.md, all cards should use "3px solid var(--ink)" as primary border. The FREE card appears to use a lighter or thinner border, making it look like a placeholder rather than a real plan.

The visual hierarchy accidentally makes the free tier look unfinished, which undermines the brand message: "The Screener is forever free." If the free card looks like an afterthought, users won't trust the "forever" claim.

## Screenshot evidence

Home page pricing zoom shows clear visual weight difference between the FREE card and the PRO/ELITE cards.

## Fix

1. Give the FREE card the same 3px solid `var(--ink)` border as other cards
2. Give it the same `4px 4px 0 var(--ink)` box-shadow
3. Keep the accent border-top in a neutral color (green/teal for "free = good") to differentiate from Pro (orange) and Elite (purple)

## Not a duplicate of

- DQ-090 (pricing comparison table thin dividers) — about the table below, not the plan cards
- DQ-011 (sitewide box-shadow undersized) — generic. This is specific to the pricing card hierarchy.
