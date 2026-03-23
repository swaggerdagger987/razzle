# DES-058: 66 standalone HTML pages have ~300 sub-minimum border-radius in page-specific styles

**Priority**: P1
**Area**: frontend/*.html (all standalone panel pages)
**Cycle**: 6

## Problem

66 standalone HTML panel pages have ~300 combined instances of `border-radius` below the 8px design minimum in their `<style>` blocks. Common offenders: position badges (3-4px), score cells (4px), bar tracks (3-6px), status badges (4-6px).

DES-047 fixed lab-panels.css (171 instances). DES-057 covers lab.js (27 instances). This ticket covers the remaining ~300 in per-page `<style>` blocks across 66 HTML files.

## Scale

Top offenders by count:
- lab.html: 32
- agents.html: 12
- pace.html: 10
- advantage.html: 7
- gamescript.html: 7
- workload.html: 7
- successrate.html: 7
- strengths.html: 7
- tdregression.html: 7
- garbagetime.html: 6
- drops.html: 6
- fptsbreakdown.html: 6
- handcuffs.html: 4
- league-intel.html: 6
- (52 more pages with 1-6 instances each)

## Fix

Bulk find-and-replace across all HTML files:
- `border-radius: 3px` → `border-radius: var(--radius-sm)` (or `8px`)
- `border-radius: 4px` → `border-radius: var(--radius-sm)`
- `border-radius: 5px` → `border-radius: var(--radius-sm)`
- `border-radius: 6px` → `border-radius: var(--radius-sm)`
- `border-radius: 7px` → `border-radius: var(--radius-sm)`

**Exceptions**: Inner bar fills (`.xxx-fill` classes inside `.xxx-track` containers) should use 6px to nest inside 8px tracks cleanly.

## Design Rule

DESIGN.md: `--radius-sm: 8px` minimum. `--radius: 12px` for cards. `--radius-lg: 20px` for pills.
