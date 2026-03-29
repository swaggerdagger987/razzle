# S3-005: Situation Room dark mode uses mix of hardcoded and CSS vars

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-TICKETS.md #8
**Found**: 2026-03-25
**Status**: OPEN

## Root Cause

`frontend/agents.html` — The Situation Room is always dark, but inconsistently. Uses a mix of CSS variables and hardcoded dark values. Doesn't set `data-theme="dark"` or use `.warroom-dark` scoping on its container.

- `agents.html:314` — `rgba(26, 17, 10, 0.85)` hardcoded instead of CSS variable
- Several elements use `var(--ink)` correctly but the page relies on inline dark styling rather than the design system's dark mode mechanism

## Fix

Apply `.warroom-dark` class from styles.css to the Situation Room container so all children inherit dark palette via CSS variables. Replace remaining hardcoded rgba values with variable references.

## Files to Change

- `frontend/agents.html:314` and surrounding dark-mode inline styles

## Accept When

Situation Room uses CSS variables for all colors, inheriting from `.warroom-dark` or `[data-theme="dark"]` scope.
