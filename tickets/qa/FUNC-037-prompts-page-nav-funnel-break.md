# FUNC-037: Prompts Page Missing Pricing Link and Is an Orphan

**Severity**: P2
**Flow**: 57 (Sidebar navigation)
**Status**: OPEN
**Session**: 35
**Date**: 2026-03-21

## Description

1. **Nav inconsistency**: prompts.html nav replaces "Pricing" with "Prompts" (line 105).
   Every other page has: Home, Screener, League Intel, AI Agents, Pricing.
   prompts.html has: Home, Screener, League Intel, AI Agents, Prompts.
   Users on the prompts page cannot navigate to pricing — funnel break.

2. **Orphan page**: No other page links to /prompts.html. The prompts page is undiscoverable.
   `grep -rl "prompts.html" frontend/` only returns prompts.html itself.

## Fix

1. Add "Pricing" back to the prompts.html nav (keep Prompts as 6th item or use app.js
   dynamic nav injection).
2. Add a link to /prompts.html from somewhere discoverable (footer, Situation Room, nav).

## Impact

Minor — page isn't deployed yet (FUNC-036). But when it does deploy, these issues should
be fixed first.
