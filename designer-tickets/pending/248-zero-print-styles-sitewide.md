# DES-248: Zero @media print styles in styles.css

**Priority**: P2
**Area**: styles.css (sitewide)
**Cycle**: 24

## Problem

`styles.css` has zero `@media print` rules. Only `cheatsheet.html` has print CSS (noted in cycle 9 audit but never ticketed).

When users print any page (Lab panels, trade analysis, pricing comparison, player profiles), they get:
- The full sticky nav bar at the top
- The floating watermark
- Dark mode colors on white paper (if dark mode active)
- The mobile hamburger button
- The site footer with all 40+ links
- Background colors that consume ink

## Evidence

- `grep -r "@media.*print" frontend/styles.css` = 0 matches
- `grep -r "@media.*print" frontend/` = only `cheatsheet.html`
- Cycle 9 finding: "@media print audit — only cheatsheet.html has print CSS"

## Fix

Add a `@media print` block to `styles.css`:

```css
@media print {
  .topnav, .hamburger-toggle, .mobile-nav-panel, .mobile-nav-overlay,
  .theme-toggle, .site-footer, .watermark, .skip-link { display: none !important; }
  body { background: white !important; color: #2d1f14 !important; }
  .lab-sidebar { display: none !important; }
  a[href]::after { content: none; }
}
```

## Why This Matters

Dynasty power users share analysis in league group chats and meetings. Printable output is a minor but real use case. Getting nav bars and footers in a printed page screams "unfinished product."
