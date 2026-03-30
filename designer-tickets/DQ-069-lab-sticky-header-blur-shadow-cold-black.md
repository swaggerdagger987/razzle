# DQ-069: lab.html sticky header dark mode uses cold black blur shadow

**Priority**: P2 — Visible every time user scrolls the screener in dark mode
**Category**: Color Token / Dark Mode
**Severity**: MEDIUM — cold black shadow on warm espresso palette

## Problem

lab.html sticky table header (line ~1040) uses cold black in dark mode:

```css
.screener-table thead.thead-shadow th {
  box-shadow: 0 4px 8px rgba(45,31,20,0.08);  /* Light mode — correct warm color */
}
[data-theme="dark"] .screener-table thead.thead-shadow th {
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);  /* Dark mode — WRONG: cold black */
}
```

The light mode version correctly uses warm espresso `rgba(45,31,20,...)`. The dark mode version uses cold black `rgba(0,0,0,...)`, breaking the warm palette.

Note: This is NOT in DQ-023 (which covers modal overlays, not the sticky header shadow).

## Fix

```css
[data-theme="dark"] .screener-table thead.thead-shadow th {
  box-shadow: 0 4px 8px rgba(45,31,20,0.25);
}
```

## Verification

Open the Lab screener in dark mode. Scroll down so the header becomes sticky. The shadow beneath the header should feel warm brown, not cold gray/black.
