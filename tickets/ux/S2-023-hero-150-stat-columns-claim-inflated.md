---
id: S2-023
severity: S2
category: ux
title: Hero section "150+ stat columns" claim may be inflated — clarify or verify
source: deep-audit
status: open
---

## Problem

The landing page hero claims "150+ stat columns." The Lab screener has ~100 columns for NFL mode. Adding college and prospect columns may reach 150, but the claim counts across all modes combined rather than columns available simultaneously.

Dynasty power users who count columns and find 85 may feel misled.

## Root Cause

`frontend/index.html` — hero section (grep for "150+"). The claim is in marketing copy.

## Fix

Either:
1. Verify the actual total across all modes and update the number if it's different
2. Change to "100+ NFL stat columns" (verifiable) or "150+ across NFL, college, and prospects" (more specific)

## Accept When

- The stat column claim on the hero is accurate and verifiable
