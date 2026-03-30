---
id: DQ-078
priority: P2
category: typography
status: open
---

# DQ-078: font-size: 28px used 26 times — off-spec (between 24 and 32)

## Problem
`font-size: 28px` is not in the type scale. It appears **26 times** across 12 files. Used mainly in hero sections and page headers.

Hotspots:
- `pricing.html`: 5 instances (plan titles, feature headers)
- `index.html`: 3 instances (hero/section headers)
- `agents.html`: 3 instances (hero section)
- `lab-panels.css`: 5 instances (panel hero text)
- `lab.html`: 2 instances
- `404.html`, `breakdown.html`, `league-intel.html`, `player.html`, `prompts.html`, `recap.html`: 1 each

## Fix
- Hero/page titles that need emphasis: `28px` -> `32px` (approved display size)
- Sub-headers or card titles: `28px` -> `24px` (approved display size)

The 28px size creates a "looks like it should be bigger" feeling — either commit to 32px for impact or step down to 24px for hierarchy.

## Scope
26 replacements across 12 files. Each needs context review (hero vs sub-header).
