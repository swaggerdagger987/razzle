# DQ-018: Cold black rgba(0,0,0,...) shadows in agents.html

**Priority**: P2 — violates "no cold colors" rule
**Category**: Color warmth

## Problem

DESIGN.md explicitly states: "NO cold grays anywhere — even dark mode stays warm (brown, not gray)." `frontend/agents.html` uses `rgba(0,0,0,...)` (pure cold black) for shadows and drop-shadows in 3 locations:

| Line | Property | Current |
|------|----------|---------|
| 39 | `filter: drop-shadow(...)` | `rgba(0,0,0,0.15)` |
| 259 | `box-shadow` | `rgba(0,0,0,0.4)` |
| 285 | `filter: drop-shadow(...)` | `rgba(0,0,0,0.3)` |

Pure black creates a cool-toned shadow that clashes with the warm sand/espresso palette.

## Fix

Replace `rgba(0,0,0,...)` with `rgba(45,31,20,...)` (espresso brown) at the same opacity levels:
- Line 39: `rgba(0,0,0,0.15)` → `rgba(45,31,20,0.15)`
- Line 259: `rgba(0,0,0,0.4)` → `rgba(45,31,20,0.4)`
- Line 285: `rgba(0,0,0,0.3)` → `rgba(45,31,20,0.3)`

## Verification

View the Situation Room page. Shadows should feel warm-toned, consistent with the rest of the site.
