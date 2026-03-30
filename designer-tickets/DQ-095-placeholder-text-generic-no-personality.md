---
id: DQ-095
title: Placeholder text generic — 32/35 inputs use "Search..." not personality language
priority: P3
category: brand-voice
status: open
cycle: 13
---

## Problem

DESIGN.md establishes that the site should have personality in its copy — "pulling film..." not "Loading...", "checking the tape..." not "Processing...". But 32 of 35 placeholder attributes use generic text:

- "search players..." (multiple pages)
- "Search for a player..." (8+ standalone pages)
- "Enter username" (league-intel.html)
- "paste your API key here" (agents.html)
- "Search tools..." (tools.html)

Only 3 inputs have personality text (agents.html scenario textarea has a good example).

## Evidence

Code: `grep -rn 'placeholder=' frontend/*.html frontend/*.js` returns 35 results. 32 use functional/generic language. The contrast with loading states (which DO have personality: "pulling film...", "scouting classes...") makes placeholders feel like an oversight.

## Fix

Rewrite placeholders to match Razzle's voice:
- "search players..." → "find your guy..."
- "Search for a player..." → "who are you looking for?"
- "Enter username" → "your Sleeper handle"
- "paste your API key here" → "drop your API key"
- "Search tools..." → "what are you looking for?"
- "Enter promo code" → "got a code?"

Keep placeholder text short and lowercase per the casual, confident brand voice.

## Files
- `frontend/lab.html` (main search)
- `frontend/league-intel.html` (username input)
- `frontend/agents.html` (API key, promo code)
- `frontend/tools.html` (search)
- 8+ standalone pages (player search inputs)
