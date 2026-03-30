---
id: DES-275
title: Pricing page plan cards have no landmark or group role for screen reader navigation
priority: P2
page: pricing.html
category: accessibility
cycle: 26
---

## Problem

The two upgrade plan cards on pricing.html (Pro and Elite) are inside a `<div class="plans-grid">` with no semantic grouping. Screen reader users have no way to:
1. Know they're in a comparison group
2. Jump between plans
3. Understand the relationship between the cards

The cards lack `role="group"` or `role="region"` on the container, and have no `aria-labelledby` connecting them to the "Two ways to upgrade" heading.

The feature matrix table (line 344) IS properly structured with `<thead>` and semantic table markup. The plan cards above it have no equivalent structure.

## Evidence

- pricing.html:271 — `<div class="plans-grid" style="grid-template-columns:1fr 1fr;">` (no role, no aria)
- pricing.html:274 — Pro card: `<div class="plan-card">` (no role, no aria-label)
- pricing.html:298 — Elite card: `<div class="plan-card elite">` (no role, no aria-label)
- pricing.html:269 — heading: "Want more? Two ways to upgrade." (not connected to the grid)

## Fix

1. Add `role="group"` and `aria-label="Upgrade plans"` to `.plans-grid`
2. Add `aria-label="Pro plan"` and `aria-label="Elite plan"` to each `.plan-card`
3. When DES-271 converts plan-name divs to h3, the cards will also be navigable by heading

## Why This Matters

The pricing comparison is the final conversion decision. Screen reader users need to efficiently compare plans. `role="group"` + `aria-label` costs 2 attributes and makes the comparison navigable.
