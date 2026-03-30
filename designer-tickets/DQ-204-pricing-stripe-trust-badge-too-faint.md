---
id: DQ-204
priority: P2
category: conversion / trust
status: open
---

# Stripe trust badge too faint — 11px ink-light barely visible

## Problem

DES-136 added the "Secured by Stripe. Cancel anytime." trust signal (now shipped). However, the implementation uses `font-size:11px` and `color:var(--ink-light)` (#8a7565), making it nearly invisible — especially on the warm sand background. The lock icon is only 14px. This is on the CONVERSION PATH between CTA buttons and feature matrix.

Trust signals should be noticeable without being shouty. Currently this one is hidden in plain sight.

## Evidence

pricing.html line 321-324:
```html
<div style="text-align:center; margin-top:16px; font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">
  <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px;" ...></svg>
  Secured by Stripe. Cancel anytime.
</div>
```

- Font size 11px is the minimum in the design system (for section labels only)
- `--ink-light` is the FAINTEST text color — meant for "labels, metadata, timestamps"
- Lock icon at 14px is barely visible

## Fix

Upgrade to `--ink-medium` color and 12px font. Optionally wrap in a subtle dashed-border box:

```html
<div style="text-align:center; margin-top:16px; font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); border:2px dashed var(--ink-faint); border-radius:var(--radius-sm); padding:8px 16px; display:inline-block;">
  <svg style="width:18px; height:18px; ...">...</svg>
  Secured by Stripe. Cancel anytime.
</div>
```

## Files
- `frontend/pricing.html` lines 321-324
