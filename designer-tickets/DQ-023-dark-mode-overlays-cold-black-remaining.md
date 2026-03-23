# DQ-023: Dark mode overlays still use cold black rgba(0,0,0) — lab.html + player.js

**Priority**: P1 — Visible on every modal/overlay interaction in dark mode
**Category**: Dark Mode
**Severity**: MEDIUM — Cold black breaks warm Espresso Flip palette

## Problem

Ticket 140 fixed some dark mode cold black overlays, but 3 instances remain:

### 1. lab.html — filter modal overlay (line ~905)
```css
[data-theme="dark"] .filter-modal-overlay { background: rgba(0,0,0,0.5); }
```
Should be: `rgba(45,31,20,0.5)` (warm espresso)

### 2. lab.html — column picker overlay (line ~954)
Same pattern as above.

### 3. player.js — player compare overlay (line ~726)
```javascript
var overlayBg = document.documentElement.getAttribute("data-theme") === "dark"
  ? "rgba(0,0,0,0.5)"   // WRONG: cold black
  : "rgba(45,31,20,0.5)";
```
Should be: `"rgba(45,31,20,0.5)"` in both branches (consistent warm espresso).

## Fix

Replace `rgba(0,0,0,0.5)` → `rgba(45,31,20,0.5)` in these 3 locations.
