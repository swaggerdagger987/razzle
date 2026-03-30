---
id: DQ-454
priority: P2
category: incomplete-fix-verification
status: open
cycle: 58
---

# DQ-454: Done ticket DES-003 incomplete — dark mode --ink-light uses wrong hex (#a89888 instead of #8a7565)

## Problem

Ticket DES-003 fixed `--ink-light` from `#6d5a4d` to `#8a7565` per DESIGN.md. Light mode was fixed correctly. **Dark mode still uses the wrong value.**

DESIGN.md line 71: `--ink-light` should be `#8a7565` in BOTH light and dark modes (it's the shared midpoint).

## Evidence

In `frontend/styles.css`:
- Light mode (line ~25): `--ink-light: #8a7565;` — CORRECT
- Dark mode `[data-theme="dark"]` (line ~80): `--ink-light: #a89888;` — WRONG

The dark mode value `#a89888` is lighter/cooler than the spec value `#8a7565`. This makes labels, metadata, and timestamps appear washed out in dark mode.

## Fix

In `frontend/styles.css`, inside `[data-theme="dark"]`:
```css
--ink-light: #8a7565;  /* was #a89888 — shared value per DESIGN.md */
```

## Why It Matters

Every label, timestamp, and metadata string on the entire site uses `--ink-light`. The wrong value affects dark mode readability and warmth across all 75 pages.

## Verification

Toggle dark mode. Labels should be a warm mid-brown, not a cool gray-brown. Compare hex value in DevTools against DESIGN.md spec (#8a7565).
