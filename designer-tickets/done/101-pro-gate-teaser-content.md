<!-- PM: ready -->
---
id: DES-329
priority: P1
area: sitewide (Pro-gated pages)
section: upgrade gate / paywall
type: conversion
status: open
---

# Pro gate pages show identical sparse lock screen — zero teaser content

## What's wrong

Every Pro-gated panel page (Stocks, Awards, Efficiency, Trade Finder, and 10+ others) shows the exact same screen: a lock emoji, "X IS A PRO PANEL", one sentence of description, and an orange "Get Plans" button. Nothing else.

There is no preview of the data behind the wall. No blurred screenshot. No "here's what you'd see" teaser. No social proof ("12,000 users upgraded"). The page is 90% empty white space with a lock icon in the center.

## Where

Every Lab panel page that requires Pro — tested: stocks.html, awards.html, efficiency.html, tradefinder.html. All render identically via the shared `showUpgradeGate()` function in app.js.

## Evidence

Screenshots of stocks.html, awards.html, efficiency.html, tradefinder.html — all show identical layout: lock emoji, title, one-line description, orange CTA, massive whitespace.

## Suggested fix

1. Show a blurred/dimmed preview of the actual panel content behind the gate overlay
2. Or show a static screenshot of what the panel looks like with data
3. Add a specific value proposition per panel: "See which players are overvalued based on 8 composite metrics"
4. Add a "what you get" mini-list specific to each panel

The gate should make users think "I need to see what's behind this," not "there's nothing here."

## Why this matters

These pages are the #1 conversion surface — users land here from sidebar links, footer links, and the Lab. If the gate doesn't create desire, the upgrade funnel is broken. DES-289 covers the blur overlay obscuring the CTA; this ticket covers the fundamental emptiness of the gate content.
