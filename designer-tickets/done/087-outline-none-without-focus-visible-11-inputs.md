# DES-087: outline:none without :focus-visible on 11 input selectors across 8 files

**Priority**: P1
**Area**: sitewide (8 files, 11 selectors)
**Cycle**: 9

## Problem

Eleven input/textarea selectors use `outline: none` on `:focus` (or on the element itself) without a corresponding `:focus-visible` rule. Keyboard users get zero visual focus indicator when tabbing to these fields. Dynasty power users are keyboard-heavy (J/K navigation, H for heat, T for tiers) — missing focus indicators on search inputs is inconsistent with this keyboard-first design.

### Affected selectors

| File | Selector | Line |
|------|----------|------|
| `styles.css` | `.note-editor-input:focus` | 1485 |
| `lab-panels.css` | `.pr-search:focus` | 4335 |
| `lab.html` | `.sidebar-search` | 133 |
| `agents.html` | `.scenario-textarea:focus` | 390 |
| `agents.html` | `.config-input:focus` | 1440 |
| `agents.html` | `.config-agent-key:focus` | 1515 |
| `breakdown.html` | `.bd-search:focus` | 68 |
| `strengths.html` | `.sw-search:focus` | 69 |
| `tradefinder.html` | `.tf-search-input:focus` | 76 |
| `rosterbuilder.html` | `.rb-search` | 65 |
| `tools.html` | `.tools-search` | 80 |

### Correctly paired examples (DO NOT CHANGE)

`styles.css` already has the correct pattern on `.auth-form input`, `.input-chunky`, `.select-chunky`, and `.cmd-palette-input`:

```css
.input-chunky { outline: none; }
.input-chunky:focus { box-shadow: 3px 3px 0 var(--ink); }
.input-chunky:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }
```

## Fix

Add `:focus-visible` rules matching the existing pattern. For each affected selector:

```css
.bd-search:focus-visible {
  outline: 3px solid var(--orange);
  outline-offset: 2px;
}
```

## Design Rule

WCAG 2.1 SC 2.4.7: Focus Visible. Every interactive element must have a visible keyboard focus indicator. The existing codebase pattern is `outline: 3px solid var(--orange); outline-offset: 2px;` on `:focus-visible`.
