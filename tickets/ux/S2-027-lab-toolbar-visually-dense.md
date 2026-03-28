---
id: S2-027
severity: S2
category: ux
title: Lab toolbar is visually complex — search, filters, tools, undo, settings, export all visible
source: deep-audit
status: open
---

## Problem

The Lab toolbar includes: search box, result count, add filter button, filter chips, tools dropdown, undo/redo, settings panel toggle, export buttons, and display mode chips. While each is useful, the combined density is overwhelming. Display toggles were moved to Settings panel (Phase ship loop T-3), but export actions remain ungrouped.

## Root Cause

`frontend/lab.html` — toolbar section. Multiple independently-useful controls compete for horizontal space.

## Fix

Consider grouping export actions (CSV, PNG, Share) into a single "Export" dropdown button to reduce toolbar clutter. The toolbar should prioritize search and filter controls.

## Accept When

- The toolbar has visually distinct groups (search | filters | actions)
- Export actions are consolidated into fewer visible buttons
