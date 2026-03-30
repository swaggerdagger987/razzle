# DES-328: Situation Room nav bar stays light on forced-dark page

**Priority**: P1
**Category**: Design System Violation — Page Context
**Affects**: frontend/agents.html — top navigation bar
**Cycle**: 4 (visual QA)

## Problem

On agents.html, the top navigation bar remains on the sand/warm background even though the entire Situation Room page should be dark per DESIGN.md. The nav creates a bright band at the top of what should be an immersive dark environment.

## Evidence

Screenshot shows: sand-colored nav bar with espresso text and orange "AI Agents" active pill, sitting above what should be a fully dark page. The nav doesn't inherit the page's forced dark context.

## Fix

On agents.html, either:
1. Set `data-theme="dark"` on `<html>` via inline script at page load (nav inherits dark mode)
2. Or add a page-specific `.topnav` override scoped to agents.html

Option 1 is cleaner — it also fixes all other elements on the page automatically.

## Why it matters

The nav is the first thing you see. A light nav on a dark page breaks immersion immediately. When DES-327 (hero section dark) is fixed, the nav will be the only remaining light element and will look even more out of place.
