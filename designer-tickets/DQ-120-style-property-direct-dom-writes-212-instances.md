# DQ-120: Direct `.style.property = value` DOM writes — 212 instances across 8 JS files

**Priority**: P2 (design system governance / dark mode)
**Category**: CSS Architecture
**Severity**: Medium — individual property assignments bypass CSS class system

## Problem

JavaScript files use direct `.style.property = value` assignments 212 times across 8 files to set visual CSS properties on DOM elements. These bypass the CSS class system, making elements:

- Invisible to dark mode overrides (inline styles beat CSS specificity)
- Invisible to CSS audits
- Fragile when design tokens change

### Breakdown by file

| File | Count | Examples |
|------|-------|---------|
| `lab.js` | 87 | `.style.background`, `.style.color`, `.style.border`, `.style.padding` |
| `lab-panels.js` | 70 | `.style.background`, `.style.width`, `.style.height`, `.style.color` |
| `app.js` | 16 | `.style.background`, `.style.display`, `.style.color` |
| `warroom.js` | 26 | `.style.background`, `.style.border` (many pixel-art related — may be exempt) |
| `charts.js` | 4 | `.style.width`, `.style.height` |
| `formulas.js` | 4 | `.style.background`, `.style.color` |
| `player.js` | 3 | `.style.background`, `.style.color` |
| `formula-store.js` | 2 | `.style.background` |

### Why this matters

`.style.display = 'none'` toggles are legitimate (11 instances, fine). But `.style.background = '#...'` and `.style.color = '#...'` are design system violations. They hardcode visual appearance in JavaScript where no CSS tool can find or override them.

This is the ROOT CAUSE of why dark mode issues keep appearing in tickets — even after all CSS files are fixed, JavaScript keeps injecting light-mode colors into the DOM.

## Fix

**Phase 1 (high impact)**: Audit `.style.background` and `.style.color` assignments in lab.js and lab-panels.js. Replace with CSS class toggling: `el.classList.add('highlighted')` instead of `el.style.background = '#f7e4d8'`.

**Phase 2**: Audit remaining files. Exempt `warroom.js` pixel-art canvas operations and legitimate `.style.display` toggles.

**Phase 3**: Add a linting rule (or code comment convention) that flags new `.style.` assignments in PR review.

## Not a duplicate of

- DQ-114 (.style.cssText mega-strings) — covers the `.style.cssText = "..."` pattern (full CSS strings). This covers individual `.style.property = value` assignments.
- done/051 (lab-panels.js hardcoded hex DOM inline) — covered hardcoded hex VALUES specifically. This covers ALL `.style.property` writes as a systemic pattern.
