<!-- PM: ready -->
---
id: DQ-365
priority: P2
area: frontend/lab-panels.css
section: dark mode
type: visual / dark mode gap
status: open
depends_on: DQ-358
---

# Lab panel table hovers invisible in dark mode — no opacity adjustment

## What's wrong

All 30+ table hover rules in lab-panels.css use `rgba(217,119,87,0.08)`. In light mode (sand background `#ede0cf`), this 8% orange tint is visible. In dark mode (espresso background `#4a3728`), the same 8% orange tint is nearly invisible against the already-warm dark background.

There is no `[data-theme="dark"]` override to increase the opacity for dark mode.

This is related to but distinct from DQ-358 (token violation). DQ-358 is about using a CSS var. This ticket is about the dark mode VISIBILITY problem — even if you convert to a var, you still need a dark mode override with higher opacity.

## Where

lab-panels.css — every `.XX-table tbody tr:hover` rule (30+ instances). In dark mode, hover feedback is invisible.

## Evidence

In dark mode, `rgba(217,119,87,0.08)` on a `#4a3728` background produces an imperceptible color shift. The user clicks a row and can't tell it's highlighted.

## Suggested fix

When implementing the `--orange-hover` var from DQ-358, set dark mode opacity higher:

```css
:root { --orange-hover: rgba(217,119,87,0.08); }
[data-theme="dark"] { --orange-hover: rgba(217,119,87,0.15); }
```

0.15 on dark espresso gives visible feedback without being garish. Test and adjust.

## Why this matters

Hover feedback is a fundamental interaction signal. In dark mode, every Lab panel table looks unresponsive — rows don't react when you hover them. This makes the site feel broken for every dark mode user.
