---
id: S2-032
severity: S2
category: mobile
title: Command palette (Ctrl+K) not discoverable on mobile — no search icon in mobile nav
source: deep-audit
status: open
---

## Problem

The `Ctrl+K Search` hint is hidden on mobile (`.nav-search-hint` has `display: none` at 768px breakpoint). Mobile devices don't have Ctrl+K. Mobile users have no way to discover the command palette without knowing the keyboard shortcut.

## Root Cause

**CSS hiding** — `frontend/styles.css` at 768px breakpoint:
```css
.nav-search-hint { display: none; }
```

**No mobile alternative** — The hamburger menu panel does not include a search icon or button that opens the command palette.

## Fix

Add a magnifying glass icon button in the mobile nav panel (or sticky header area) that opens the command palette overlay. The palette itself already works via JS — it just needs a mobile trigger.

## Accept When

- Mobile users can discover and open the command palette without a keyboard
- A search icon is visible in the mobile nav area
- The command palette overlay works correctly when triggered from the icon
