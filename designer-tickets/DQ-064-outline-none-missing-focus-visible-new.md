# DQ-064: `outline: none` without `:focus-visible` — 4 new instances

**Priority**: P2 — Accessibility: keyboard users lose focus indicator
**Category**: Accessibility / Focus States
**Severity**: MEDIUM — WCAG 2.4.7 violation

## Problem

Done ticket 087 fixed 11 instances of `outline: none` without `:focus-visible`. Four NEW instances exist (added after that fix or missed):

### agents.html — 3 inputs

1. **Line ~392** — scenario input `:focus`
```css
outline: none;
border-color: var(--orange);
```

2. **Line ~1446** — config API key input `:focus`
```css
outline: none;
border-color: var(--orange);
```

3. **Line ~1525** — ask input `:focus`
```css
outline: none;
border-color: var(--orange);
```

### lab-panels.css — 1 input

4. **Line ~4342** — panel search input
```css
outline: none;
border-color: var(--orange);
```

## Fix

For each instance, change `:focus` to `:focus:not(:focus-visible)` and add a `:focus-visible` rule:

```css
.scenario-input:focus:not(:focus-visible) {
  outline: none;
  border-color: var(--orange);
}
.scenario-input:focus-visible {
  outline: 3px solid var(--orange);
  outline-offset: 2px;
}
```

Or the simpler pattern used in breakdown.html:
```css
.input:focus { outline: none; border-color: var(--orange); }
.input:focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }
```

## Verification

Tab through the agents page with keyboard only. Each input should show a visible orange focus ring when reached via keyboard, but no double-outline when clicked with mouse.
