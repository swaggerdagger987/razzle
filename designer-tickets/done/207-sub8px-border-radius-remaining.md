<!-- PM: ready -->
# DQ-461: DES-058 Incomplete Fix — 13 Sub-8px Border-Radius Remain in HTML Files

**Priority**: P2
**Category**: Done Ticket Verification / Design Token
**Affects**: 11 HTML files

## Problem

DES-058 was marked done (claimed to fix ~300 instances of border-radius below 8px minimum). Verification reveals **13 instances remain** in per-page `<style>` blocks across 11 standalone HTML files.

## Remaining Violations

| File | Count | Value |
|------|-------|-------|
| lab.html | 2 | `border-radius: 4px`, `border-radius: 6px` |
| auction.html | 1 | `border-radius: 4px` |
| buysell.html | 1 | `border-radius: 4px` |
| breakouts.html | 1 | `border-radius: 4px` |
| pace.html | 1 | `border-radius: 4px` |
| percentiles.html | 1 | `border-radius: 4px` |
| prospects.html | 1 | `border-radius: 4px` |
| rosterbuilder.html | 1 | `border-radius: 4px` |
| scarcity.html | 1 | `border-radius: 4px` |
| tradefinder.html | 1 | `border-radius: 4px` |
| tradevalues.html | 1 | `border-radius: 4px` |

## Fix

Grep `border-radius:\s*[34567]px` across all HTML files. Replace with `8px` or `var(--radius-sm)`.

## Acceptance

`grep -rn 'border-radius:\s*[34567]px' frontend/*.html` returns 0 matches.
