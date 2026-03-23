---
id: DES-311
title: Agents.html JS-generated briefing UI uses Caveat at 14px — below 18px minimum
priority: P2
page: agents.html
category: Typography
cycle: 28
---

## Problem

DESIGN.MD specifies Caveat font minimum sizes: 24px for annotations, 18px for smaller notes. Four JS-generated elements in warroom.js use Caveat at 14px — below the minimum and near-illegible as handwriting at that size.

These appear in the briefing UI that paying users interact with — the premium product experience.

## Where

All in `frontend/agents.html` page-specific `<style>` or JS-generated inline styles:

1. Line 1724: `<span style="font-family:var(--font-hand); font-size:14px; ..." id="briefingWeekLabel">` — week label in briefing header
2. Line 2149 (JS): `font-family:var(--font-hand); font-size:14px;` — upgrade prompt text
3. Line 2164 (JS): `font-family:var(--font-hand); font-size:14px;` — keep access text
4. Line 2275 (JS): `font-family:var(--font-hand); font-size:14px;` — cross-agent finding text

DES-237 is the broad Caveat audit (97 instances / 44 files). These 4 are specific instances the shipper needs to fix on the agents page.

## Fix

Change all four from `font-size:14px` to `font-size:18px` (the DESIGN.MD minimum for Caveat smaller notes).

## Evidence

- DESIGN.MD type scale: Caveat 24px for annotations, 18px for smaller notes
- All 4 instances use 14px — 4px below minimum
