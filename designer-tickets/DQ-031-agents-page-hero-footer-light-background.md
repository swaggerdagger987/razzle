# DQ-031: Agents page hero + footer on light background

**Priority**: P0 — page identity violation
**Page**: agents.html
**Category**: Dark mode / brand identity

## Problem

DESIGN.md is explicit: "Situation Room uses `--bg-ink` (deepest espresso `#1a110a`) regardless of theme toggle. It's always dark."

Currently, the agents.html page has three zones:
1. **Hero section** (mascot, title, agent chips, bio cards) — **LIGHT sand** `var(--bg)` = `#ede0cf`
2. **Warroom section** (pixel canvas, scenario panels) — **DARK** `var(--bg-ink)` via `.warroom-dark` class
3. **Footer** — **LIGHT sand** again

Only the `.warroom-dark` div (starting around line 1648) is dark. The hero and footer are on the default light sand.

## Evidence

- `.warroom-hero` CSS (lines 30-35): uses default `var(--bg)` — no dark override
- `.warroom-dark` starts at line 1648, after hero ends at line 1627
- No `data-theme="dark"` set on `<html>` anywhere in the page
- Screenshot confirms: light nav bar, light hero, light footer wrapping a dark middle section

## Fix

Set `data-theme="dark"` on `<html>` at page load via inline `<script>` in `<head>`:
```html
<script>document.documentElement.setAttribute('data-theme', 'dark')</script>
```
This flips the entire page dark using the Espresso Flip palette. The `.warroom-dark` overrides for `--bg-ink` still apply inside that section.
