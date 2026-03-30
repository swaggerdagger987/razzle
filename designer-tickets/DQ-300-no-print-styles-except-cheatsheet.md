---
id: DQ-300
title: No @media print styles anywhere except cheatsheet.html
priority: P3
category: UX / print
status: open
cycle: 39
---

## What's wrong

Only `cheatsheet.html` (line 219) has `@media print` CSS. Every other page — including the Lab screener, rankings, tier lists, trade values, and all 70+ analytical panels — will print with full navigation, footer, toolbars, and dark mode artifacts.

Fantasy football users commonly print cheat sheets, rankings, and screener results for draft day. The current state means printing any page except the cheat sheet produces a cluttered, unusable printout.

## Evidence

```bash
# Only 1 file in all of frontend/ has @media print
grep -r "@media.*print" frontend/
# Result: frontend/cheatsheet.html:219
```

## Fix

Add a minimal global `@media print` block to styles.css:

```css
@media print {
  .topnav, .site-footer, .theme-toggle, .skip-link,
  .cmd-palette-backdrop, .auth-modal-overlay,
  .mobile-nav-overlay, .mobile-nav-panel,
  .watermark { display: none !important; }

  body { background: white !important; color: black !important; }

  .screener-table, .about-section, .prompt-card {
    box-shadow: none !important;
    border-color: #ccc !important;
  }
}
```

This hides chrome and ensures readable printing on any page.

## Scope

styles.css — 1 new `@media print` block (~15 lines). Non-breaking addition.

## Files
- `frontend/styles.css` (add new section)
- Reference: `frontend/cheatsheet.html` line 219 (existing print CSS pattern)
