# DES-179: 78 dead `-webkit-overflow-scrolling: touch` across 40 files

**Priority**: P3 — Dead code cleanup
**Scope**: 40 files (HTML + CSS + JS)
**Category**: Code hygiene

## Problem

78 instances of `-webkit-overflow-scrolling: touch` across 40 files. This non-standard CSS property was required for iOS momentum scrolling before iOS 13 (September 2019). Since iOS 13, all `overflow: auto/scroll` elements have momentum scrolling by default. The property was officially deprecated.

In 2026, this is dead CSS. It has zero effect on any current browser. It signals "stale codebase" to anyone who inspects the source — and Reddit dynasty power users DO inspect source (the target audience is tech-comfortable age 22-40).

## Evidence

- 78 instances across 40 files
- Heaviest concentration: lab-panels.js (31), lab.html (4), lab-panels.css (4)
- All inline HTML `style="overflow-x:auto;-webkit-overflow-scrolling:touch"` patterns
- iOS 13+ (2019) made this the default behavior — 7 years ago

## Fix

Remove all 78 instances. Global find-and-replace:
- `;-webkit-overflow-scrolling:touch` → (empty)
- `-webkit-overflow-scrolling: touch;` → (empty)
- `-webkit-overflow-scrolling:touch` → (empty)

## Why this matters

Pure cleanup — no visual or behavioral change. Reduces noise in the codebase and removes a signal of technical debt from view-source inspection.
