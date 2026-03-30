# DQ-337: Hover box-shadow 3px 3px 0 should be 6px 6px 0 — 27 instances sitewide

**Priority**: P2
**Category**: Design System — Shadows
**Files**: styles.css (4), lab.html (4), lab-panels.css (3), league-intel.html (5), aging.html, cheatsheet.html, matchups.html, pricing.html, rosterbuilder.html, scoring.html, targets.html, tools.html (3), weekly.html

## Problem

DESIGN.md specifies hover lift as `6px 6px 0 + translate(-2px, -2px)`. The codebase uses `3px 3px 0` on hover — exactly half the specified value. 27 instances across 13 files.

Examples:
- `styles.css:766` — `.btn-chunky:hover { box-shadow: 3px 3px 0 var(--ink); }`
- `styles.css:794` — `.btn-primary:hover { box-shadow: 3px 3px 0 var(--ink); }`
- `styles.css:933` — `.input-chunky:focus { box-shadow: 3px 3px 0 var(--ink); }`
- `styles.css:1053` — `.theme-toggle:hover { box-shadow: 3px 3px 0 var(--ink); }`
- `lab.html:475`, `lab.html:2363`, `lab.html:2932`, `lab.html:3037`
- `league-intel.html:314`, `:519`, `:608`, `:636`, `:7384`
- Plus aging, cheatsheet, matchups, pricing, rosterbuilder, scoring, targets, tools, weekly

## Fix

Search-and-replace in hover/focus contexts: `box-shadow: 3px 3px 0` → `box-shadow: 6px 6px 0`

Grep command: `rg "box-shadow:\s*3px\s*3px" frontend/`

Pair with DQ-338 (translate fix) — these are the same hover pattern.
