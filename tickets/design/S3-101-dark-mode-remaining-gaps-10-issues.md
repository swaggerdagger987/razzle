---
id: S3-101
severity: S3
confidence: MEDIUM
category: design
source: DQ-056+149+165+180+246+348+386+454+471+500
status: OPEN
---

# Dark mode remaining gaps — 10 issues not covered by existing tickets

## Problems

1. **`<meta name="theme-color">` hardcoded to light mode** (DQ-056) — All 75 pages set theme-color to sand (#ede0cf). In dark mode, mobile browser chrome still shows light color.
2. **No `color-scheme: dark` declaration** (DQ-149) — Browser chrome (scrollbars, form controls) ignores dark mode because `color-scheme` isn't set on `<html>`.
3. **fptsbreakdown + percentiles `text-shadow` no dark override** (DQ-165) — Espresso text-shadow invisible on dark espresso background.
4. **Lab "Reset All" filter tag styled via inline JS** (DQ-180) — Inline styles don't respond to dark mode toggle.
5. **pricing.html uses `!important` in dark overrides** (DQ-246) — Specificity war instead of proper cascade.
6. **Canvas placeholder icon uses cold black drop-shadow** (DQ-348) — Should use espresso.
7. **Server-offline fallback uses hardcoded `#6b5a4e`/`#a89585`** (DQ-386) — Invisible in dark mode. Should use CSS vars.
8. **Dark mode `--ink-light` still wrong hex (`#a89888` not `#8a7565`)** (DQ-454) — Previous fix (DES-003) used wrong replacement value.
9. **Warroom HUD state dots use 7 off-palette bright colors** (DQ-471) — Pixel art exemption debatable for HUD overlay elements.
10. **drops.html hover uses hardcoded rgba while siblings use `var(--bg-warm)`** (DQ-500) — Inconsistency within the standalone page family.

## Fix

Each is independent. Prioritize DQ-454 (wrong ink-light in dark mode) and DQ-056 (theme-color meta).

## Files

- All 75 HTML files — theme-color meta
- `frontend/styles.css` — color-scheme declaration
- `frontend/fptsbreakdown.html`, `frontend/percentiles.html` — text-shadow dark override
- `frontend/lab.js` — Reset All inline styles
- `frontend/drops.html` — hover rgba

## Acceptance Criteria

1. `<meta name="theme-color">` updates when dark mode toggled (via JS or `media` attribute)
2. `color-scheme: dark` set on `<html>` when dark mode active
3. Server-offline fallback readable in dark mode
4. `--ink-light` is `#8a7565` in dark mode (verify against DESIGN.md)
