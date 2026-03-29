---
id: S2-024
severity: S2
category: design
title: Loading text overuses "pulling film..." — 40+ pages share the same phrase
source: deep-audit
status: open
---

## Problem

DESIGN.md says loading states should have personality, but most pages use the same "pulling film..." text. Having 40+ pages all say the same thing defeats the personality purpose. Some pages use contextual messages ("running the numbers...", "checking the tape...") but they are the minority.

## Root Cause

**Hardcoded in HTML**: Each standalone page has "pulling film..." as the initial loading text in its HTML body. Examples:
- `frontend/advantage.html:107`
- `frontend/archetypes.html:292`
- `frontend/auction.html:355`
- `frontend/cheatsheet.html:267`
- `frontend/compare.html:347`
- `frontend/drops.html:111`
- `frontend/dashboard.html:358`
- `frontend/draftclass.html:307`
- `frontend/dualthreat.html:108`
- `frontend/fptsbreakdown.html:280`
(40+ more files follow the same pattern)

**Randomizer exists but fires late**: `frontend/app.js:499-525` defines a `RAZZLE_LOADING` array with 15 loading text variants and a DOMContentLoaded handler that replaces all "pulling film..." text with a random entry. However, users see "pulling film..." in the initial paint before JS replaces it.

## Fix

Create a page-specific loading message for each category of page:
- Dynasty tools: "scouting the dynasty board..."
- Weekly analytics: "breaking down the tape..."
- Trade tools: "evaluating the deal..."
- Matchup tools: "studying the defense..."
- Draft tools: "clocking 40 times..."
- Records/Awards: "checking the record books..."
- Player profiles: "pulling the scouting report..."

## Accept When

- At least 10 different contextual loading messages exist across the site
- No single loading message is used on more than 10 pages
