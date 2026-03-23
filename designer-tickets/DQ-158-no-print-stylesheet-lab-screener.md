---
id: DQ-158
priority: P2
area: feature
section: print-styles
type: design-gap
status: open
---

# Only 1 of 75 pages has a print stylesheet — Lab screener missing

## What's wrong

Only cheatsheet.html has `@media print` styles. The Lab screener — the most shared, most screenshotted page — has no print stylesheet at all. When a user hits Ctrl+P to print their screener results, they'll get the nav bar, filter chips, toolbar buttons, and a mangled table.

## Where

- `frontend/cheatsheet.html:219` — only file with `@media print`
- `frontend/lab.html` — zero print rules
- `frontend/styles.css` — zero print rules
- All 73 other HTML files — zero print rules

## Fix

Add a `@media print` block to styles.css with global rules:
```css
@media print {
  .topnav, .mobile-nav-overlay, .footer, .scroll-top-btn,
  .bulk-bar, .toast, .cmd-palette-backdrop { display: none; }
  body { background: #fff; color: #000; }
  .screener-table { box-shadow: none; border: 1px solid #ccc; }
  a[href]:after { content: none; } /* don't print URLs */
}
```

Then add Lab-specific print rules to lab.html:
```css
@media print {
  .screener-toolbar, .filter-bar, .add-filter-btn { display: none; }
  .screener-table th, .screener-table td { padding: 4px 8px; font-size: 11px; }
}
```

## Why it matters

Fantasy football players print cheat sheets for draft day. A printable Lab screener with clean formatting is a direct conversion driver: "I printed my rankings from Razzle" is a word-of-mouth moment.
