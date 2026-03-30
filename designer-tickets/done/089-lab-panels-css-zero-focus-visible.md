# DES-089: lab-panels.css has ZERO :focus-visible rules in 4300+ lines

**Priority**: P1
**Area**: frontend/lab-panels.css (entire file)
**Cycle**: 9

## Problem

`lab-panels.css` is 4300+ lines of CSS governing all Lab panel styling — buttons, tabs, selects, search inputs, position filters, toggle switches, and interactive elements across 60+ panels. It contains exactly **zero** `:focus-visible` rules.

Every interactive element in Lab panels relies solely on browser-default focus outlines. Since `.pr-search:focus` at line 4335 actively removes the outline with `outline: none`, that input has NO focus indicator at all.

Lab panels are the Pro upgrade pathway — dynasty power users browse these panels to decide whether to upgrade. Keyboard accessibility on panel controls is important.

### Scope

This is a systemic gap. A full audit would cover every interactive selector in the file. The minimum viable fix should target the most-used interactive patterns:

1. `.lp-pos-tab` — position filter tabs (appear on 20+ panels)
2. `.lp-select` — season/filter selects (appear on 30+ panels)
3. `.pr-search` — prospect search (has outline:none with no replacement)
4. `.lp-btn` / button selectors — action buttons across panels
5. Any tab/toggle patterns

## Fix

Add `:focus-visible` rules to all interactive selectors in lab-panels.css. Follow the existing codebase pattern:

```css
.lp-pos-tab:focus-visible,
.lp-select:focus-visible,
.pr-search:focus-visible {
  outline: 3px solid var(--orange);
  outline-offset: 2px;
}
```

## Design Rule

WCAG 2.1 SC 2.4.7: Focus Visible. The rest of the codebase (styles.css) has proper :focus-visible pairing. lab-panels.css is the remaining systemic gap.
