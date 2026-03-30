---
id: DQ-073
priority: P2
category: typography
status: open
---

# DQ-073: font-size 22px (49x) and 26px (41x) — off-spec display sizes

## Problem
The type scale jumps 20px -> 24px -> 32px. Two off-spec sizes fill the gaps:
- `font-size: 22px` — **49 instances** across 20+ files + lab-panels.css (9)
- `font-size: 26px` — **41 instances** across 20+ files

These are used for section headers and card titles that should use 20px or 24px.

## Evidence
22px hotspots: lab.html (8), agents.html (3), lab-panels.css (9), career.html (3)
26px hotspots: career.html (2), every standalone panel page (1 each, ~35 pages)

## Fix
- `22px` -> `20px` (section headers, card headers — per type scale)
- `26px` -> `24px` (sub-page titles — per type scale)

Review each instance: if the element is a page title that needs to be bigger than 24px, use `32px`. The gap between 24px and 32px is intentional.

## Scope
90 replacements across 40+ files. Audit context of each before blanket replace.
