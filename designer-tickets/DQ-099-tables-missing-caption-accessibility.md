---
id: DQ-099
title: All 47 <table> elements missing <caption> — screen readers cannot identify tables
priority: P2
category: accessibility
status: open
cycle: 13
---

## Problem

Zero of 47 `<table>` elements in the codebase have a `<caption>` tag. Screen reader users hear "table with X rows and Y columns" but have no context for what data the table contains. This is a WCAG 2.1 Level A violation (Success Criterion 1.3.1 — Info and Relationships).

Key tables affected:
- Lab screener results table (the core product)
- Pricing comparison table
- All standalone page data tables (rankings, trade values, weekly stats, etc.)
- Records page (4 tables)
- Agents page pricing comparison

## Evidence

Code:
- `grep -c "<table" frontend/*.html` → 47 total across all files
- `grep -c "<caption" frontend/*.html` → 0 results
- `grep -c "<caption" frontend/*.js` → 0 results

## Fix

Add visually-hidden `<caption>` to each table:

```html
<table>
  <caption class="sr-only">Dynasty Rankings by Tier</caption>
  ...
</table>
```

The `sr-only` class (already exists in styles.css) hides the caption visually while keeping it accessible to screen readers. Each caption should describe the table's purpose in plain language.

Example captions:
- Lab: "Player statistics filtered by current screener settings"
- Rankings: "Dynasty player rankings organized by tier"
- Pricing: "Feature comparison between Free, Pro, and Elite plans"
- Weekly: "Weekly fantasy scoring heatmap by player and week"

## Files
- All 47 HTML files containing `<table>` elements
- Highest priority: `frontend/lab.html`, `frontend/pricing.html`, `frontend/rankings.html`
