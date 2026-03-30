# DQ-340: font-size: 15px off type scale — 50 instances across 29 files

**Priority**: P3
**Category**: Design System — Typography
**Files**: advantage.html, agents.html (2), awards.html, airyards.html, buysell.html (2), career.html, compare.html, dashboard.html (2), fptsbreakdown.html, handcuffs.html, lab-panels.css (8), lab-panels.js (1), lab.js (2), league-intel.html (4), percentiles.html, lab.html (3), playoffs.html, pricing.html (2), prospects.html (2), stacks.html, strengths.html, styles.css (2), streaks.html, targets.html, tradevalues.html (3), usage.html, yoy.html, weeklymvp.html, waivers.html

## Problem

DESIGN.md type scale: 11/12/13/14/16/20/24/32px. 15px is not on the scale. 50 instances across 29 files. DQ-193 only covers placeholder text — these are content text, labels, empty states, and secondary values.

15px sits awkwardly between 14px (body text / nav links) and 16px (section headers). Most uses look like "slightly larger than body" — should be 14px (same as body) or 16px (promoted to section header weight).

## Fix

Audit each instance and choose:
- 14px for body text, labels, secondary values, empty states
- 16px for section headers, player names, card headers

Grep command: `rg "font-size:\s*15px" frontend/`

Note: the 8 instances in lab-panels.css and 2 in styles.css affect the most elements since they're shared styles.
