# DES-195: Site footer uses div groups instead of semantic nav/ul/li — 73 pages

**Priority**: P2
**Category**: Accessibility / SEO
**Affects**: All 73 pages with `.site-footer-grid`
**Cycle**: 18

## Problem

The site footer uses a flat structure of `<div>` groups with `<div class="site-footer-heading">` and loose `<a>` tags:

```html
<div class="site-footer-grid">
  <div>
    <div class="site-footer-heading">Razzle</div>
    <a href="/" class="footer-link">Home</a>
    <a href="/lab.html" class="footer-link">Screener</a>
    ...
  </div>
</div>
```

This has three problems:
1. **No `<nav>` landmark** — screen readers can't identify footer navigation (WCAG 2.1)
2. **No list structure** — `<ul><li>` tells assistive tech "these are related links in a group"
3. **Heading divs** — `<div class="site-footer-heading">` should be `<h3>` for document outline

The main navigation at the top correctly uses `<nav aria-label="Main navigation">`. The footer should match.

## Evidence

Grep for `site-footer` across HTML files returns **73 files** — every page with a footer is affected.

`index.html:850-853`:
```html
<div class="site-footer-grid">

  <div>
    <div class="site-footer-heading">Razzle</div>
```

Compare with the `<nav>` in the header which has proper landmark semantics.

## Fix

```html
<footer class="site-footer">
  <div class="site-footer-grid">
    <nav aria-label="Razzle links">
      <h3 class="site-footer-heading">Razzle</h3>
      <ul class="footer-links">
        <li><a href="/">Home</a></li>
        <li><a href="/lab.html">Screener</a></li>
        ...
      </ul>
    </nav>
  </div>
</footer>
```

Since the footer is templated across 73 pages, the fix applies everywhere.

## Why it matters

Search engines use `<nav>` landmarks to identify site structure and internal linking. Screen reader users rely on landmark navigation to skip to footer links. 73 pages missing this is a structural SEO and accessibility gap.
