# DQ-463: warroom.js Lightbulb Animation Uses Wrong Yellow (#ffcc00 vs #ffc857)

**Priority**: P3
**Category**: Design Token / Color Drift
**Affects**: frontend/warroom.js

## Problem

The lightbulb "thinking" animation in the Situation Room pixel engine uses `#ffcc00` and `#ddaa00` for the glow effect. DESIGN.md specifies `--yellow: #ffc857`. This is color drift — the yellows are visually different (more saturated, cooler).

## Violations

| Line | Current | Should Be |
|------|---------|-----------|
| ~1044 | `'#ffcc00'` | `'#ffc857'` |
| ~1044 | `'#ddaa00'` | `'#c9a040'` (darker shade of design yellow) |
| ~1053 | `'#ffcc00'` (sparkle) | `'#ffc857'` |

## Fix

Replace all `#ffcc00` with `#ffc857` and `#ddaa00` with a proper darker shade derived from the design yellow.

## Acceptance

Grep `ffcc00|ddaa00` in warroom.js returns 0 matches.
