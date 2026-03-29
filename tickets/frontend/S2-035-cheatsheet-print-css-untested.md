---
id: S2-035
severity: S2
category: frontend
title: Cheat sheet print CSS may not produce clean draft board — needs verification
source: deep-audit
status: open
---

## Problem

The cheat sheet has `@media print` CSS for printing draft boards. This is a high-value feature for draft day but may not have been tested recently. Broken print CSS on draft day would be frustrating.

## Root Cause

`frontend/cheatsheet.html` — has `@media print` section (around line 227). Needs manual print preview verification.

## Fix

1. Open cheatsheet.html in browser, select a draft format, and use Ctrl+P to verify print preview
2. Ensure the 4-column position grid renders correctly on paper
3. Ensure tier breaks are visible in print
4. Add a "Print Preview" button for user convenience

## Accept When

- Print CSS produces a clean, usable draft board on US Letter paper
- All 4 position columns are visible without cutoff
- Tier breaks and player names are legible
