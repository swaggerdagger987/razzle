---
id: DES-308
title: Cold rgba(0,0,0) used instead of warm espresso — 8 instances across 4 files
priority: P2
page: agents.html, lab.html, player.js, lab-panels.js
category: Design System
cycle: 28
---

## Problem

DESIGN.MD bans cold grays/blacks. Eight instances of `rgba(0,0,0,...)` remain where warm espresso `rgba(45,31,20,...)` or `rgba(26,17,10,...)` should be used. DES-140 fixed this in styles.css — these are the survivors in page-specific CSS and JS.

## Where

**agents.html (3 instances):**
1. Line 39: `.warroom-hero-mascot { filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15)); }`
   - Compare: index.html:77 and about.html:42 correctly use `rgba(45,31,20,0.15)`
2. Line 259: `.canvas-container { box-shadow: 4px 4px 0 rgba(0,0,0,0.4); }`
3. Line 285: `.canvas-placeholder-icon { filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3)); }`

**lab.html (3 instances — all in dark mode rules):**
4. Line 905: `[data-theme="dark"] .filter-modal-overlay { background: rgba(0,0,0,0.5); }`
5. Line 954: `[data-theme="dark"] .column-picker-overlay { background: rgba(0,0,0,0.5); }`
6. Line 1040: `[data-theme="dark"] .screener-table thead.thead-shadow th { box-shadow: 0 4px 8px rgba(0,0,0,0.25); }`
   - Compare: light mode at line 1037 correctly uses `rgba(45,31,20,0.08)`

**player.js (1 instance):**
7. Line 726: Dark mode overlay uses `rgba(0,0,0,0.5)` while light mode uses `rgba(45,31,20,0.5)` — asymmetric

**lab-panels.js (1 instance):**
8. Line 10118: Canvas segment border uses `rgba(0,0,0,0.3)` / `rgba(255,255,255,0.3)`

## Fix

Replace each cold rgba with warm espresso-based equivalent:
- `rgba(0,0,0,0.15)` → `rgba(45,31,20,0.15)` (shadows on light bg)
- `rgba(0,0,0,0.3-0.5)` → `rgba(26,17,10,0.3-0.5)` (dark mode overlays/shadows)
- `rgba(255,255,255,0.3)` → `rgba(237,224,207,0.3)` (sand-based light tint)

## Evidence

- index.html:77 uses warm `rgba(45,31,20,0.15)` ✅
- about.html:42 uses warm `rgba(45,31,20,0.15)` ✅
- agents.html:39 uses cold `rgba(0,0,0,0.15)` ❌ (same element type)
