<!-- PM: SUPERSEDED by Bureau Epic (000-P0). Absorbed into DES-006. -->
---
id: DES-339
priority: P2
status: superseded
area: league-intel.html
section: pre-connect state
type: visual / conversion
status: open
---

# Bureau pre-connect state is 80% whitespace with no visual preview of league value

## What's wrong

When a user first visits league-intel.html (the Bureau of Intelligence), they see:

- Razzle mascot
- "CONNECT YOUR SLEEPER" heading
- A text input + orange Connect button
- "Don't use Sleeper?" note
- "See a demo league" button (small, subtle)
- Then MASSIVE whitespace down to the footer

There is no screenshot, illustration, or preview of what connected league data looks like. No "here's what you unlock" visual. No social proof. The page tells you to connect but doesn't show you WHY.

## Where

`frontend/league-intel.html` — the pre-connect state renders the connect form centered in the page with no additional content below.

## Evidence

Screenshot: bureau-desktop.png — the connect form floats in the upper-center of the page. Below it is a vast empty sand field with only the footer at the bottom. ~70% of viewport is unused space.

## Suggested fix

1. Below the connect form, show a blurred/dimmed preview screenshot of connected league data (manager profiles, trade finder results, pressure map)
2. Add 3-4 benefit chips: "Manager behavioral profiles", "Trade partner matching", "Pressure map", "Activity feed"
3. Make "See a demo league" button more prominent — chunky btn-primary instead of subtle text link
4. Add a Caveat annotation: "your rivals won't know what hit them"

## Why this matters

The Bureau is the bridge between "cool free tool" and "I need this" (per DESIGN.md brand hierarchy). If the connect page is empty, users bounce before they ever see the value. Every second on this page without visual motivation is a lost conversion.
