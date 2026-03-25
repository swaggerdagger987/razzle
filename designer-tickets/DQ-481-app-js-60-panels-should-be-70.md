---
id: DQ-481
title: app.js Pro upsell modal says "60+ analytical panels" — should be "70+"
severity: P2
category: content-accuracy
file: frontend/app.js
lines: 774, 781
---

## Problem

The Pro upgrade modal in `app.js` says "All 60+ analytical panels" but every other source (NORTH_STAR.md, DESIGN.md, pricing.html, about.html) says "70+". The site has 74 HTML pages. The modal undersells the product.

## Expected

Change "60+" to "70+" in both instances (lines 774 and 781 of app.js).

## Acceptance Criteria

- `grep -n "60+" frontend/app.js` returns zero results
- Both upgrade modal variants say "70+ analytical panels"
