---
id: DQ-074
priority: P2
category: typography
status: open
---

# DQ-074: font-size: 15px used 38 times — off-spec (between 14 and 16)

## Problem
`font-size: 15px` is not in the type scale (14px and 16px are). It appears **38 times** across 20 files. Used for body text, annotation copy, and handwritten elements.

Hotspots:
- `lab-panels.css`: 8 instances
- `league-intel.html`: 4 instances
- `lab.html`: 3 instances
- `lab.js`: 2 instances
- `pricing.html`: 2 instances
- 15 standalone HTML files: 1 each

## Fix
- If the element is body/nav text: `15px` -> `14px`
- If the element is a section header or emphasized text: `15px` -> `16px`
- If the element uses Caveat (handwritten): `15px` -> `18px` (Caveat renders smaller than mono/display at same px)

## Scope
38 replacements across 20 files. Each needs context check for font-family.
