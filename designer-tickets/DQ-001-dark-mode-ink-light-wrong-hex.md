# DQ-001: Dark mode --ink-light uses wrong hex value

**Priority**: P1 — every dark mode page affected
**Category**: Color token
**Files**: `frontend/styles.css:80`

## Problem

DESIGN.md specifies `--ink-light` should be `#8a7565` in BOTH light and dark mode (shared value). But `styles.css` line 80 sets it to `#a89888` in the `[data-theme="dark"]` block.

This means every label, metadata text, timestamp, and watermark in dark mode is the wrong shade — too light and too cool compared to the design spec.

## Expected

```css
/* line 80 */
--ink-light: #8a7565;
```

## Actual

```css
/* line 80 */
--ink-light: #a89888;
```

## Fix

Change `#a89888` to `#8a7565` on line 80 of `frontend/styles.css`.

## Verification

Toggle dark mode. Labels and metadata text should match the warm brown tone from DESIGN.md, not appear washed-out gray.
