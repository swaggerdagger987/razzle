---
id: S1-020
severity: S1
category: frontend
title: Standalone analytical pages missing PPR/Half/Standard scoring format selector
source: deep-audit
status: open
---

## Problem

Many standalone pages display fantasy point values defaulting to PPR without offering a scoring format toggle. Half-PPR is the most common dynasty format — users see rankings that may not match their league. The Lab screener has this selector, but standalone pages do not.

## Root Cause

Pages confirmed missing scoring format selector:
- `frontend/scoring.html:292` — has season selector only, no format toggle
- `frontend/breakdown.html:370` — season selector only
- `frontend/consistency.html:302-308` — position tabs only
- `frontend/efficiency.html` — position tabs only
- `frontend/reportcard.html` — position tabs only
- `frontend/vorp.html` — position tabs only
- `frontend/buysell.html` — position tabs only
- `frontend/stocks.html` — position tabs only

All these pages use PPR fantasy points in calculations but don't let users switch formats.

## Fix

Add a PPR / Half-PPR / Standard toggle to all standalone pages that display fantasy point values. Pattern:
1. Add a 3-button toggle group (similar to position tabs styling)
2. Default to PPR (most common in dynasty)
3. Re-fetch data with `?scoring=half_ppr` or `?scoring=std` parameter
4. Backend endpoints must accept the `scoring` parameter

## Accept When

- At least the top 10 most-visited analytical pages have a scoring format selector
- Switching format re-renders the page with correct values
- Default remains PPR for backwards compatibility
