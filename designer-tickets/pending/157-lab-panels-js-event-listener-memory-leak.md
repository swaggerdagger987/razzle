# DES-157: lab-panels.js has 197 addEventListener calls with 0 removeEventListener

**Priority**: P1 (Performance — growth engine)
**Page**: lab.html (The Lab / Screener)
**Category**: Performance UX

## The Problem

`lab-panels.js` calls `addEventListener` 197 times but `removeEventListener` zero times. Every time a user paginates, filters, sorts, or switches panels, new event listeners accumulate without cleanup. Over an extended session (which is exactly how dynasty power users browse — 30+ minutes of filtering and exploring), the page slows down.

The Lab is the growth engine. If it feels sluggish after 10 minutes of use, that's a first impression problem for Reddit visitors exploring the Screener.

## Evidence

- `addEventListener` count in lab-panels.js: **197**
- `removeEventListener` count in lab-panels.js: **0**
- Contrast: `formulas.js` is balanced (1:1), `lab.js` has 36:8 (still imbalanced but better)

## The Fix

1. For listeners on elements that get replaced during re-renders (panel content, table rows, autocomplete dropdowns): use event delegation on a stable parent instead of per-element listeners
2. For listeners added during panel initialization: track them and remove before re-init
3. For `{ once: true }` listeners: these are self-cleaning, audit which of the 197 already use this pattern and exclude from count
4. Consider an `AbortController` pattern: create one per panel render, pass its signal to all addEventListener calls, then `controller.abort()` on re-render

## Why This Matters

A dynasty manager from r/DynastyFF opens the Screener, applies 5 filters, pages through results, opens 3 panels, compares players, adjusts columns — that's 50+ interactions. If each interaction leaks 10-20 listeners, they're at 500+ orphaned listeners by the time they decide whether to upgrade. Sluggish = "unfinished product" = no conversion.
