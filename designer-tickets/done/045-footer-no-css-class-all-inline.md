# DES-045: site-footer has no CSS class — all layout via inline styles

**Priority**: P2
**Area**: sitewide (72 pages)
**Impact**: The `.site-footer` class is used on 72+ pages but has NO CSS definition in styles.css. All footer layout (grid, padding, gap, font) is done via inline `style=` attributes duplicated in every HTML file. This makes the footer unthemeable and unmaintainable.

## The Problem

Grep for `.site-footer` in styles.css: **0 matches.**

Every page has this pattern:
```html
<div class="site-footer">
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));
    gap:24px 16px; max-width:900px; margin:0 auto 24px; padding:0 24px;
    font-family:var(--font-mono); font-size:11px; text-align:left;">
    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase;
        letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Razzle</div>
      ...
```

The footer section headers and links use CSS variables for colors (`var(--orange)`, `var(--ink-light)`), so dark mode colors DO work. But the layout properties (grid, padding, margins) are all inline and:
1. Cannot be overridden by media queries (only by `!important`)
2. Must be edited in 72 files for any layout change (see DES-037: minmax 140px fix required 72 edits)
3. Cannot be targeted by CSS for responsive adjustments

`.footer-link` IS defined in styles.css (line 1275) — but it's the only footer-related class that has a definition.

## The Fix

Add a CSS class for the footer grid layout:
```css
.site-footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 24px 16px;
  max-width: 900px;
  margin: 0 auto 24px;
  padding: 0 24px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: left;
}
.site-footer-heading {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--orange);
  margin-bottom: 8px;
}
```

Then replace inline styles in all 72 files with `class="site-footer-grid"` and `class="site-footer-heading"`.

## Why This Matters

DES-037 (footer minmax(140px) on 71 pages) exists BECAUSE of this architectural gap. If the footer grid had a CSS class, the 140px → 110px fix would have been one line, not 71 file edits. This ticket prevents the next DES-037.
