---
id: DQ-234
priority: P3
category: infrastructure
pages: all except cheatsheet.html
status: open
cycle: 33
---

# No @media print stylesheet — pages print with dark backgrounds and nav chrome

## What's wrong

Only `cheatsheet.html` has `@media print` rules. Every other page (74 pages) will print with:
- Full navigation bar and footer
- Dark box-shadows rendering as black blocks
- Watermark overlapping content
- Background colors consuming ink

Fantasy football users print cheat sheets, rankings, and trade value charts for draft day. Without print styles, the output is unusable.

## Fix

Add a minimal print reset to `styles.css`:

```css
@media print {
  .topnav, .site-footer, .watermark, .skip-link { display: none !important; }
  * { box-shadow: none !important; }
  body { background: white !important; color: black !important; }
  .page-container { max-width: 100% !important; }
}
```

This covers 90% of print issues with 5 lines. Pages with special needs (cheatsheet already handled) can add page-specific overrides.

## Verification

Open dashboard.html → Ctrl+P → print preview should show clean content without nav, footer, or shadows.
