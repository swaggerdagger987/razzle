---
id: DQ-291
title: agents.html meta tags use role names (Scout/Quant/Medic) not actual agent names
priority: P1
category: brand / SEO
page: agents.html
status: open
cycle: 39
---

## What's wrong

The og:description, twitter:description, and meta description on agents.html all reference agents by their ROLE NAMES (Scout, Quant, Medic, Diplomat, Historian) — but the actual agents displayed on the page use PERSONAL NAMES (Hawkeye, Octo, Dr. Dolphin, Bones, Atlas).

This means every Google result and social media share for the Situation Room page shows names that don't match what users see when they click through.

## Evidence

- Line 9: `og:description` says "Scout, Quant, Medic, Diplomat, Historian, and Razzle himself"
- Line 18: `twitter:description` says "Scout, Quant, Medic, Diplomat, Historian, and Razzle himself"
- Line 21: `meta description` says "Scout, Quant, Medic, Diplomat, Historian, and Razzle"
- Lines 1619-1624 (hero chips): Show RAZZLE, HAWKEYE, BONES, OCTO, DR. DOLPHIN, ATLAS

## Fix

Update all three meta tags to use actual agent names:
```html
<meta property="og:description" content="Six AI agents who know your league. Hawkeye, Octo, Dr. Dolphin, Bones, Atlas, and Razzle himself. Drop a scenario, get a Situation Room briefing in seconds.">
```

Apply the same name swap to lines 18 and 21.

## Not a dupe of

- DQ-032 covers the hero CHIP TEXT mismatch with DESIGN.md — this ticket is about META TAGS (different elements, SEO impact)
- DQ-059 covers the home page demo card name — different page

## Files
- `frontend/agents.html` lines 9, 18, 21
