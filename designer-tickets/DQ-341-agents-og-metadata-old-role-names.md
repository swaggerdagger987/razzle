---
id: DQ-341
title: Agents page OG metadata uses old role names instead of current agent names
priority: P1
category: brand / SEO
page: agents.html
cycle: 45
---

## Problem

The agents.html OG description (line 9) advertises agents as "Scout, Quant, Medic, Diplomat, Historian" — the old abstract role names. The actual agent badges on the page show "Hawkeye, Octo, Dr. Dolphin, Bones, Atlas." Neither set matches DESIGN.md canonical names ("The Fox, The Octopus, Dr. Dolphin, The Elephant").

**Social sharing impact**: When anyone shares the Situation Room link on Twitter/Reddit/Discord, the preview text says "Scout, Quant, Medic, Diplomat, Historian" — names that don't appear anywhere on the actual page. Users who click through expecting "Scout" find "Hawkeye" instead.

## Evidence

```html
<!-- agents.html line 9 -->
<meta property="og:description" content="Six AI agents who know your league. Scout, Quant, Medic, Diplomat, Historian, and Razzle himself.">
```

Actual badge names (lines 1619-1624): Razzle, Hawkeye, Bones, Octo, Dr. Dolphin, Atlas.

## Not a duplicate of

- DQ-032: covers agent badge names in HTML (DESIGN.md vs Bones/Octo/Atlas mismatch)
- DQ-059: covers home page demo card using "Bones" instead of DESIGN.md name
- This ticket covers OG METADATA specifically — a completely different surface (social sharing previews)

## Fix

Update line 9 to use the current agent names (whichever set is canonical — coordinate with DQ-032 decision):
```html
<meta property="og:description" content="Six AI agents who know your league. Hawkeye, Bones, Octo, Dr. Dolphin, Atlas, and Razzle himself.">
```

## Files
- `frontend/agents.html` (line 9)
