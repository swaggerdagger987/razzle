# DQ-030: Transition timing inconsistent (0.1s vs 0.12s standard)

**Priority**: P3 — Subtle but creates uneven animation feel
**Category**: Interactive States / Polish
**Severity**: LOW — 5 elements use 0.1s when standard buttons use 0.12s

## Problem

The `btn-chunky` class (the design standard button) uses `transition: all 0.12s`. Five other interactive elements use 0.1s, creating a slightly different animation rhythm:

| Element | File | Line | Current | Should Be |
|---------|------|------|---------|-----------|
| `.nav-dropdown-item` | styles.css | ~601 | `0.1s` | `0.12s` |
| `.cmd-palette-item` | styles.css | ~1153 | `0.1s` | `0.12s` |
| `.tag-picker-option` | styles.css | ~1440 | `0.1s` | `0.12s` |
| `.ask-ref-item` | agents.html | ~477 | `0.1s` | `0.12s` |
| `.lab-sidebar-item` | lab.html | ~315 | `0.1s` | `0.12s` |

## Fix

Replace `transition: .*0.1s` → `0.12s` in these 5 locations for consistency.
