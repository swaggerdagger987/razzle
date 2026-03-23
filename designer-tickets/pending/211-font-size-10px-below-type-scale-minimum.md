---
id: DES-211
title: font-size:10px appears 475 times across 75 files — below type scale minimum
priority: P3
category: design-system
page: sitewide
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

`font-size: 10px` appears 381 times in HTML/CSS and 94 times in JS files (475 total across 75 files). DESIGN.md type scale minimum is 11px (for uppercase display section labels). 10px is below the governed scale.

DES-197 covers `font-size: 9px` (141 instances). This ticket covers the more pervasive 10px pattern.

## Evidence

Heaviest files:
- lab-panels.css: 125 instances
- lab.html: 43 instances
- league-intel.html: 45 instances
- lab.js: 46 instances
- lab-panels.js: 33 instances
- styles.css: 11 instances (urgency badges, nav labels, plan badges, etc.)
- agents.html: 14 instances
- index.html: 3 instances (urgency badge, table headers, social card context)

Used on: urgency badges, table column headers, social card labels, nav signout text, panel metadata, chart axis labels.

DESIGN.md type scale: 11px/700/Display(uppercase) is the smallest defined size.

## Why it matters

Screenshots shared on Reddit/Twitter compress small text. 10px characters become illegible in shared PNG exports and screenshots — the primary growth channel. On mobile (62% of Twitter/Reddit traffic), 10px is at the edge of readability without zooming.

## Fix

This is a governance cleanup, not a visual emergency. Audit the 475 instances in batches:
1. Replace with 11px where used for uppercase labels/badges (matching type scale)
2. Evaluate if some can merge with existing 12px patterns
3. Leave canvas rendering contexts alone (they render at pixel level)

## Scope

75 files. Batch by file type: styles.css (11), lab-panels.css (125), HTML pages, then JS.
