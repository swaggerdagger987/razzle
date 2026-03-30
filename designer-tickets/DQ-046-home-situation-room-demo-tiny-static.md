---
id: DQ-046
priority: P2
category: conversion
page: index.html
status: open
---

# Home page — Situation Room demo is a tiny static text card

## What's wrong
The "SIX AI AGENTS THAT ALREADY KNOW YOUR LEAGUE" section on the home page shows a small dark card with a single static text briefing. There's no pixel canvas preview, no agent avatar animation, no visual indication of what the $240/yr Situation Room product actually looks like.

The Situation Room is the premium conversion target. The home page demo should make visitors think "I need that" — not "what is that tiny dark box?"

## Evidence
- Screenshot: home page scrolled to agents section shows a small dark demo card (~300px tall) that blends into the section
- The agents.html page has a full pixel canvas with animated agents, briefing cards with urgency badges, agent bios — none of this is visible on the home page

## Fix
Replace the static text card with a more compelling preview:
1. A static screenshot/preview image of the full Situation Room (pixel canvas + briefing cards + agent avatars)
2. Or: embed a simplified version of the pixel canvas (even non-interactive, just the visual)
3. Add 2-3 sample briefing card previews showing urgency badges (URGENT/MONITOR/OPPORTUNITY) to demonstrate the output format
4. Ensure the dark section is at least 400-500px tall to give the preview visual weight

## Files
- `frontend/index.html` — Situation Room demo section (search for "agents" or "situation room" section)
