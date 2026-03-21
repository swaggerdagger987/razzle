# Ticket 027 — Screenshot-Ready Preset Views

**ID**: 20260321-140009-027
**Page**: Lab
**Type**: structural
**Severity**: P1
**Created**: 2026-03-21

## Problem

The Lab's panels are powerful but require configuration to look screenshot-worthy. A first-time visitor opening "Dynasty Rankings" sees raw data. A screenshot-worthy view requires selecting the right columns, applying heat colors, sorting correctly, and framing the data.

The north star says "every screenshot is a billboard." But the current screenshots require expert configuration.

## BEFORE

Panels load with default views that show raw data. Users must configure columns, filters, sorting, and visualizations manually. Screenshot-worthy views are accidental, not designed.

## AFTER

Each panel has 1-2 "preset views" — pre-configured states designed to look great on first load:

**Examples**:
- **Dynasty Rankings**: Top 50 players, value column, tier badges, heat colors ON, position badges — screenshot-ready out of the box
- **Breakout Candidates**: Top 15 breakout scores, opportunity metrics, efficiency grades — ready to post
- **Trade Values**: Top 30 by trade value, position-colored bars, tier labels — instantly shareable
- **Weekly Heatmap**: Current week, all positions, 5-tier colors — ready for group chat
- **Aging Curves**: All positions, peak markers, player dots — visually compelling on first render

Each preset view:
- Loads as the default on first visit
- Includes optimized column selection (not all 100+ columns — the 6-8 that tell a story)
- Has heat colors/visualizations enabled where appropriate
- Looks great at both desktop and mobile widths
- Can be modified freely (presets are starting points, not prisons)

## Why This Matters

The viral loop depends on screenshots. Screenshots depend on good-looking data views. Good-looking views currently require expert configuration. Presets eliminate that gap — every panel looks screenshot-ready on first load.

## Accept When

5+ panels have curated preset views that load by default. Each preset looks publication-quality without any user configuration. Users can modify presets freely.
