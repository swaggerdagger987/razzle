# S2-033: No PNG favicon fallback for older browsers

**Severity**: S2 (Minor)
**Category**: design
**Source**: Deep Audit 2026-03-28, finding S2-018

## Problem

All 77+ HTML files use an SVG-only favicon. Some older browsers, bookmark managers,
and mobile home screen icons don't support SVG favicons, resulting in a blank or
generic icon.

## Root Cause

- `frontend/index.html:23` — Only favicon declaration:
  ```html
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  ```
- No PNG fallback (`favicon.png`) exists in the `frontend/` directory
- All other HTML files follow the same SVG-only pattern

## Fix

1. Generate a PNG favicon (32x32 and 180x180 for Apple touch) from the SVG
2. Add fallback link tags in all HTML files:
   ```html
   <link rel="icon" href="favicon.svg" type="image/svg+xml">
   <link rel="icon" href="favicon.png" type="image/png" sizes="32x32">
   <link rel="apple-touch-icon" href="apple-touch-icon.png">
   ```

## Scope

- 1 new asset: `frontend/favicon.png` (and optional apple-touch-icon.png)
- 77 HTML files: add 1-2 link tags each
