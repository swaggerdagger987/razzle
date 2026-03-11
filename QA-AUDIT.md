# QA + UX Audit — Phases 51-54

**Date**: 2026-03-10
**Scope**: Phase 51 (Tags), Phase 52 (Notes), Phase 53 (Pins), Phase 54 (Tier Breaks)

---

## QA FINDINGS

### CRITICAL

**1. Pinned rows separator colspan missing pin column**
- **File**: `frontend/lab.js:2493`
- **Issue**: `cols.length + 3` didn't account for pin column in NFL mode.
- **Status**: FIXED in this audit.

### HIGH

**2. Tag picker border 1.5px violates design system**
- **File**: `frontend/styles.css:913`
- **Issue**: `.tag-picker-option.active` used `border: 1.5px solid`. DESIGN.md requires 2px. No border reserved in default state causing layout shift.
- **Status**: FIXED in this audit. Changed to `2px solid transparent` default + `2px solid var(--tag-color)` active.

### MEDIUM

**3. Tag picker buttons lack focus indicator**
- **File**: `frontend/styles.css:892`
- **Issue**: No `:focus` style for keyboard accessibility.

**4. Tier break Tier 1 has no visible label**
- **File**: `frontend/lab.js:2928`
- **Issue**: Top rows (Tier 1) have no label divider; only Tier 2+ breaks shown. Implicitly correct but may confuse in screenshots.

### LOW

**5. `tierLabels[0]` declared but unused**
**6. Tier break `pointer-events:none` prevents text selection**
**7. Toolbar density approaching 15+ buttons (future: consider grouping)**
**8. P key clears pins without toast confirmation**

---

## UX FINDINGS

- First 30 seconds: Clean. New features are opt-in, progressive disclosure works well.
- Readability: All labels use fantasy-standard terminology (BUY/SELL/WATCH/TARGET/AVOID, Elite/Starters/Flex/Bench/Deep).
- Flow tests: All 3 core flows work end-to-end with new features. No dead ends.
- Visual noise: Default view is clean. Tags/Notes/Pins/Tiers all require intentional activation.
- No CRITICAL or HIGH UX issues found.
