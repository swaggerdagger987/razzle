# S2-016: --ink-light color contrast fails WCAG 1.4.3 for normal text

**Severity**: S2 (Medium)
**Category**: a11y
**Source**: 2026-03-14-a11y-audit.md #14
**WCAG**: 1.4.3 (Contrast Minimum)
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

Light mode `--ink-light: #8a7565` on `--bg: #ede0cf` produces approximately 2.9:1 contrast ratio. WCAG 1.4.3 Level AA requires 4.5:1 for normal text (under 18px bold or 24px regular).

`--ink-light` is used for labels, metadata, timestamps, subtitle text, placeholder text, and loading states across all 74 pages (30+ usages in styles.css alone). Many of these are at 11-13px where 4.5:1 is mandatory.

**Secondary issue**: Dark mode `--ink-light` is `#a89888` (styles.css:81) while DESIGN.md specifies `#8a7565` (shared between modes). The dark mode value may be intentionally lighter for contrast on dark backgrounds — this should be confirmed.

## Fix

**Option A** (recommended): Create a size-aware split:
- Keep `--ink-light: #8a7565` for large text (18px+ bold, 24px+) where 3:1 is sufficient
- Add `--ink-label: #5c4a3d` (current `--ink-medium`) for small text labels that need 4.5:1
- Migrate small-text usages from `var(--ink-light)` to `var(--ink-label)`

**Option B**: Darken `--ink-light` to `#6d5c4e` (~3.3:1) or `#5c4a3d` (~4.5:1) globally — but this changes the design language and needs designer approval.

**Dark mode**: Either update `#a89888` to match DESIGN.md `#8a7565`, or update DESIGN.md to document the intentional dark-mode-specific value. Verify dark mode contrast: `#a89888` on `#1a110a` (~5.4:1) — passes AA.

## Files to Change

- `frontend/styles.css:25` — light mode `--ink-light` value (if Option B)
- `frontend/styles.css:81` — dark mode `--ink-light` value (reconcile with DESIGN.md)
- `frontend/styles.css` — 30+ usages of `var(--ink-light)` (if Option A, migrate small-text usages)
- `docs/DESIGN.md` — update dark mode value if `#a89888` is intentional

## Accept When

1. All normal-text usages of `--ink-light` meet 4.5:1 contrast on their backgrounds
2. Large-text usages (18px+ bold) meet 3:1
3. Dark mode value is documented and consistent between styles.css and DESIGN.md
4. No visual regression — text should not appear too dark/heavy
