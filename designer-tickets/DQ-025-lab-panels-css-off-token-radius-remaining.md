# DQ-025: 6 remaining off-token border-radius values in lab-panels.css

**Priority**: P2 — Inconsistent radius breaks visual cohesion
**Category**: Layout / Tokens
**Severity**: MEDIUM

## Problem

Design tokens allow: 2px, 4px, 8px, 12px, 50%. Six values in `lab-panels.css` don't match:

| Line | Class | Current | Should Be |
|------|-------|---------|-----------|
| ~618 | `.tv-bar-track` | `6px` | `8px` |
| ~765 | `.pa-bar` | `5px` | `4px` |
| ~1997 | `.dt-split-bar` | `3px` | `4px` |
| ~3031 | `.sw2-stat-pct-bar` | `3px` | `4px` |
| ~3039 | `.sw2-bar-track` | `7px` | `8px` |
| ~411 | `.rankings-card` | `14px` | `12px` |

## Fix

6 single-property edits. Round each off-token value to its nearest design token.
