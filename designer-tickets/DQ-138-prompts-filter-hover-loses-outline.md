---
id: DQ-138
priority: P3
area: design-consistency
section: prompts-page
type: visual-inconsistency
status: open
---

# Prompts filter pills lose chunky outline on hover — fill solid orange

## What's wrong

On prompts.html, the filter buttons (.prompt-filter) at line 40-42 change their hover/active state to:
```css
.prompt-filter:hover, .prompt-filter.active {
  background: var(--orange); color: var(--bg); border-color: var(--orange);
}
```

This fills the pill solid orange AND changes the border to orange, completely losing the chunky ink outline. DESIGN.md says chips should maintain "2px borders" with ink color. The hover should add shadow + lift, not erase the border.

## Where

- `frontend/prompts.html` lines 40-42

## Fix

```css
.prompt-filter:hover {
  background: var(--orange-light);
  box-shadow: 2px 2px 0 var(--ink);
  transform: translate(-1px, -1px);
}
.prompt-filter.active {
  background: var(--orange);
  color: var(--text-on-accent);
  /* keep border-color: var(--ink) — don't change to orange */
}
```

## Why this matters

When a filter pill goes full orange (including border), it loses the chunky ink outline that defines the Razzle aesthetic. Active state can fill orange, but the ink border should remain visible.
