# FUNC-036: Major Deployment Gap — Ship Loop Changes Not on Production

**Severity**: P1
**Flow**: Multiple
**Status**: OPEN
**Session**: 35
**Date**: 2026-03-21

## Description

The Ship Loop has built many features and fixes that exist in the codebase but are NOT
deployed to production (razzle.lol). This is a blanket deployment ticket.

## Evidence

1. **Nav labels**: Prod says "Bureau" / "Situation Room". Code says "League Intel" / "AI Agents".
2. **Brand copy**: Prod says "FOREVER FREE" and "forever free". Code says "FREE" and "free".
3. **Prompts page**: `/prompts.html` returns 404 on prod (page exists in codebase).
4. **Agent SVGs**: `/assets/agents/razzle.svg` etc. all return 404 on prod.
5. **Agent Presence Layer**: Peek feature, watermark characters, nudge system — all dead on prod
   because SVGs don't exist.
6. **agent-config.js**: New script with agent territory config — not on prod.
7. **FAAB Strategy panel**: New Lab panel — not on prod.
8. **Weekly Briefing**: New Situation Room feature — not on prod.
9. **Smart filter snap_share fix**: Fixed in code (50/65/40 thresholds), fix IS on prod
   (verified working).
10. **Efficiency QB fix (FUNC-035)**: Fixed in code, NOT on prod.

## Fix

Run a full deploy to Render. The build pipeline (scripts/build_dist.py) will automatically
pick up all new JS, CSS, HTML, and assets.

## Impact

Users on razzle.lol are seeing an old version of the site. Most of the Ship Loop's Phase A-H
work is invisible to them.
