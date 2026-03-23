# DQ-003: Hover lift missing translate(-2px, -2px) on buttons and theme toggle

**Priority**: P1 — core interaction feel
**Category**: Hover interaction
**Files**: `frontend/styles.css:766,794,1053`

## Problem

DESIGN.md says hover should use `6px 6px 0` + `translate(-2px, -2px)` to create the physical "lift" feel. Currently:
- `.btn-chunky:hover` (line 766) — has shadow bump but NO translate
- `.btn-primary:hover` (line 794) — same
- `.theme-toggle:hover` (line 1053) — same

Without the translate, the shadow grows but the element doesn't move. It looks like the shadow is inflating, not like the button is lifting off the surface.

## Fix

Add `transform: translate(-2px, -2px);` to each hover rule alongside the shadow bump.

## Verification

Hover any button. It should physically shift up-left while the shadow grows, creating a 3D pop-up feel.
