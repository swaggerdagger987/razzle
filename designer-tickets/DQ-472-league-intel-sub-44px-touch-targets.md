---
id: DQ-472
title: league-intel.html has 6+ interactive elements below 44px minimum touch target
priority: P2
category: mobile-ux
status: open
cycle: 60
---

## Problem

DQ-039 covers cramped touch targets in the Lab toolbar. This ticket covers the Bureau of Intelligence page (league-intel.html) which has its own set of tiny interactive elements — different page, different elements.

On mobile (375-480px), several buttons, badges, and selects have padding so small (1-3px) that they're nearly impossible to tap accurately. Apple HIG requires 44px minimum; Material Design requires 48px.

## Evidence

`frontend/league-intel.html`:

| Line | Element | Padding | Approx Height |
|------|---------|---------|---------------|
| 1988-1989 | ESPN/Yahoo platform badges | `2px 8px` | ~22px |
| 2236 | League Odds button | `3px 10px; font-size:10px` | ~22px |
| 3322 | Inline status badge | `1px 4px` | ~18px |
| 6408, 6411 | Injury/trade removal spans | `2px 8px` | ~22px |
| 6420, 6446, 6453 | Mock commissioner selects | `3px 6px` | ~24px |
| 6440, 6459 | Mock commissioner buttons | `2px 10px` | ~20px |

## Fix

Add `min-height: 44px; min-width: 44px;` to all interactive elements, or increase padding to at least `8px 14px` on badges and `10px 16px` on buttons. For selects, use `padding: 8px 12px;`.

## Files
- `frontend/league-intel.html` — lines 1988, 2236, 3322, 6408-6459
