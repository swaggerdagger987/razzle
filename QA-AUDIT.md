# QA + UX Audit — Phases 116-119

**Date**: 2026-03-11
**Scope**: QA audit fixes, CSV export, export UX polish, column stat tooltips
**Files**: frontend/lab.html, frontend/lab.js

---

## QA FINDINGS

### CRITICAL

**C1: Dead code — duplicate saved views implementation**
- File: `frontend/lab.js`, lines 2964-3097
- Old saved views functions are completely overridden by new implementation at lines 3455-3578. Dead code adds confusion and maintenance risk.
- Fix: Delete lines 2964-3097.

**C2: XSS in saved view name display**
- File: `frontend/lab.js`, line 3572
- `v.name` interpolated into HTML without escaping.
- Fix: Use `escapeHtml(v.name)`.

**C3: XSS in saved view onclick handlers**
- File: `frontend/lab.js`, lines 3571, 3575
- `v.id` interpolated into onclick attributes without escaping.
- Fix: Use `escapeAttr(v.id)`.

### HIGH

**H1: New saveCurrentView missing visual state fields**
- File: `frontend/lab.js`, lines 3465-3481
- Missing: columnWidths, heatColors, percentileMode, dataBars, density. Phase 116 fixed this in old code but new code doesn't have it.
- Fix: Add fields to save and restore.

**H2: Invalid CSS variables**
- File: `frontend/lab.html`, line 3215
- `var(--bg-sand)` and `var(--font-data)` don't exist. Should be `var(--bg)` and `var(--font-mono)`.

**H3: 1px borders on DVS legend badges**
- File: `frontend/lab.html`, lines 3148-3151
- Violates DESIGN.md chunky border rule.
- Fix: Change to `border:2px solid`.

**H4: No max view limit in new saved views**
- File: `frontend/lab.js`, line 3483
- Old code capped at 20 views, new code has no limit.
- Fix: Add limit check.

### MEDIUM

**M1: Missing toast feedback in new saved views**
- No toast for save/load/delete operations in new implementation.
- Fix: Add `_showToast()` calls.

**M2: Missing confirm on delete**
- New `deleteSavedView` deletes immediately without confirmation.
- Fix: Add `confirm()` check.

**M3: Gradient in heatmap legend**
- File: `frontend/lab.html`, line 3696
- `linear-gradient` violates DESIGN.md no-gradient rule.
- Fix: Replace with stepped color blocks.

### LOW

**L1: Missing aria-label on CSV button** (lab.html:3078)
**L2: Date format missing year in saved views** (lab.js:3567)

---

## UX FINDINGS

### First 30 Seconds Test
- PASS: Position tabs and search provide clear entry points. Onboarding toast guides to shortcuts.

### Readability Pass
- PASS: Column tooltips explain abbreviations. Power-user audience handles stat jargon well.
- LOW: "Views..." dropdown placeholder could be "Saved Views..."

### Flow Tests
- All 3 core flows pass end-to-end.

### Visual Noise Check
- Default view is clean. Heat coloring lacks legend but tooltip on H button explains it.
