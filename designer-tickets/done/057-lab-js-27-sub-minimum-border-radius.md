# DES-057: lab.js has 27 sub-minimum border-radius in JS-generated inline styles

**Priority**: P1
**Area**: frontend/lab.js (Screener — growth engine)
**Cycle**: 6

## Problem

lab.js generates HTML via template literals and `style.cssText` with 27 instances of `border-radius` below the design system minimum of 8px (`--radius-sm`). These inline styles bypass CSS classes entirely, so the DES-047 lab-panels.css fix didn't reach them.

The Screener is the growth engine — every screenshot is a billboard. Sub-minimum radius makes badges, bars, and buttons look inconsistent with the chunky sticker aesthetic.

## Instances Found

| Line | Element | Current | Should Be |
|------|---------|---------|-----------|
| 341 | Watchlist cloud badge | 3px | var(--radius-sm) |
| 4411 | Saved views sync badge | 4px | var(--radius-sm) |
| 4438 | Universe badge span | 4px | var(--radius-sm) |
| 4444 | Position badge span | 4px | var(--radius-sm) |
| 4457 | Delete saved view button | 6px | var(--radius-sm) |
| 4649 | Diff mode OFF button | 6px | var(--radius-sm) |
| 4979 | Formula input field | 4px | var(--radius-sm) |
| 6269 | COLLEGE profile badge | 4px | var(--radius-sm) |
| 6491 | Draft round badge | 4px | var(--radius-sm) |
| 8627 | Grade sticker | 6px | var(--radius-sm) |
| 8643 | Roster grade bar track | 4px | var(--radius-sm) |
| 9079 | Tier badge | 4px | var(--radius-sm) |
| 9092 | Position badge (trade) | 3px | var(--radius-sm) |
| 9098 | Trade bar track | 4px | var(--radius-sm) |
| 9099 | Trade bar fill | 4px | 6px (inner fill) |
| 9140 | Position badge (comp) | 3px | var(--radius-sm) |
| 9199 | Player card (trade) | 6px | var(--radius-sm) |
| 9200 | Position badge (trade) | 3px | var(--radius-sm) |
| 10102 | Watchlist group row | 6px | var(--radius-sm) |
| 10187 | Trade finder color strip | 6px 0 0 6px | 8px 0 0 8px |
| 10662 | Keyboard hint KBD | 4px | var(--radius-sm) |
| 10857 | Trade gives bar track | 6px | var(--radius-sm) |
| 10862 | Trade receives bar track | 6px | var(--radius-sm) |
| 11432 | Roster search row | 4px | var(--radius-sm) |
| 11515 | Roster panel row | 6px | var(--radius-sm) |
| 11606 | Roster position value bar | 4px | var(--radius-sm) |
| 13008 | Keyboard shortcuts KBDs (x4) | 2px | var(--radius-sm) |

## Fix

Find-and-replace `border-radius:[0-7]px` in inline style strings with `border-radius:var(--radius-sm)`.

**Exception**: Inner bar fills (line 9099) should use 6px to fit inside 8px tracks.

## Design Rule

DESIGN.md: `--radius-sm: 8px` is the minimum. No component should go below it.
