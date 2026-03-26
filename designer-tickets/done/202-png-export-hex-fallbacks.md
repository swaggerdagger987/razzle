<!-- PM: ready -->
---
id: DQ-202
parent: RC-001 (Hardcoded Colors Bypass Design Tokens)
priority: P2
area: frontend/lab.js
section: design tokens
type: visual consistency
status: open
depends_on: DQ-469a (305-export-colors-shared-function)
---

# Replace hardcoded hex fallbacks in Lab PNG export

**File**: `frontend/lab.js`

## What's wrong

The Lab's PNG export code has 4 hardcoded hex color fallbacks for background and watermark that bypass the design token system. These should use the shared `getExportColors()` function.

## What to do

1. Find PNG/canvas export code in lab.js
2. Replace hardcoded hex values (`#ede0cf`, `#2d1f14`, etc.) with `getExportColors()` calls
3. Ensure `getExportColors()` from app.js is available (ticket 305 creates it)

## Accept when

- Lab PNG export uses `getExportColors()` for all color values
- No hardcoded `#ede0cf` or `#2d1f14` in export sections of lab.js
- Export works correctly in both light and dark mode

## Depends on

DQ-469a (305) — shared getExportColors() function must exist first
