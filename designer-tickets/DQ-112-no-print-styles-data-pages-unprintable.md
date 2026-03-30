# DQ-112: No `@media print` styles — data pages unprintable

**Priority**: P2 (user-facing UX gap)
**Category**: Print UX
**Severity**: Medium — affects any user who tries to print research

## Problem

Only **1 of 75 pages** (cheatsheet.html) has `@media print` CSS. Major data pages have zero print support:

- Lab screener — nav bar, sidebar, fixed watermarks, background colors all print
- Rankings — prints with chunky borders and colored backgrounds
- Trade values — horizontal bars won't fit paper width
- Dashboard — stat cards, colored sections all print with screen styles
- Weekly heatmap — dense grid with colored cells prints as screen layout
- Tier list — position-colored chips and background tints print

A fantasy football research lab WILL get printed. Users print tier lists for draft day, trade value charts for negotiation, weekly projections for lineups.

## Evidence

```
grep -r "@media print" frontend/ → only cheatsheet.html
```

## Fix

Add a shared `@media print` block in `styles.css`:

```css
@media print {
  nav, .topnav, .sidebar-panel, .watermark, .skip-link,
  .theme-toggle, .footer, .bulk-bar, .toast { display: none; }
  body, .page { background: white; color: black; }
  * { box-shadow: none; }
  table { border: 1px solid #ccc; page-break-inside: avoid; }
  a { color: inherit; text-decoration: underline; }
}
```

This single block fixes all 75 pages at once. Individual pages can add page-specific print rules on top.

## Not a duplicate of

- No existing DQ ticket covers print styles
