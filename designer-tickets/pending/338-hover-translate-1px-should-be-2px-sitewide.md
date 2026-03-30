# DQ-338: Hover translate(-1px,-1px) should be translate(-2px,-2px) — 35 instances sitewide

**Priority**: P2
**Category**: Design System — Hover Lift
**Files**: styles.css (5), index.html, agents.html (8), lab.html (4), lab-panels.css (2), league-intel.html (5), aging.html, cheatsheet.html, matchups.html (2), prompts.html, scoring.html, targets.html, tools.html (2), weekly.html

## Problem

DESIGN.md specifies hover lift as `translate(-2px, -2px)`. The codebase uses `translate(-1px, -1px)` — exactly half. 35 instances across 14+ files. This is paired with the 3px shadow issue (DQ-337); together they form a hover pattern at half the design spec magnitude.

Examples:
- `styles.css:224` — global card hover
- `styles.css:767` — `.btn-chunky:hover`
- `styles.css:795` — `.btn-primary:hover`
- `styles.css:836` — `.chip:hover`
- `styles.css:1054` — `.theme-toggle:hover`
- `agents.html:86`, `:529`, `:560`, `:596`, `:1227`, `:1274`, `:1382`, `:1472`
- Plus all files listed above

## Fix

Search-and-replace: `translate(-1px, -1px)` → `translate(-2px, -2px)` in hover contexts.

Also update `:active` states proportionally (currently `translate(1px, 1px)` → `translate(2px, 2px)` with `box-shadow: 1px 1px 0` → `box-shadow: 2px 2px 0`).

Grep command: `rg "translate\(-1px,\s*-1px\)" frontend/`

Do together with DQ-337.
