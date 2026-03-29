# S3-004: Hardcoded drop-shadow rgba in index.html and about.html

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-409
**Found**: 2026-03-25
**Status**: OPEN

## Root Cause

- `frontend/index.html:77` — `filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));`
- `frontend/about.html:47` — `filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));`

Correct espresso RGB but hardcoded. Won't adapt when dark mode flips ink to sand.

## Fix

Define `--shadow-drop` CSS variable:
```css
:root { --shadow-drop: rgba(45,31,20,0.15); }
[data-theme="dark"] { --shadow-drop: rgba(237,224,207,0.15); }
```

Then use:
```css
filter: drop-shadow(3px 3px 0 var(--shadow-drop));
```

## Files to Change

- `frontend/styles.css` — add `--shadow-drop` variable
- `frontend/index.html:77`
- `frontend/about.html:47`

## Accept When

Drop shadows adapt correctly in both light and dark mode.
