# DQ-101: Text selection uses browser-default blue — not branded

**Priority**: P3
**Category**: Brand polish
**Severity**: Low — cosmetic but missed branding opportunity
**Evidence**: Code search — zero `::selection` rules in any CSS file

## What's wrong

When a user selects text anywhere on the site (player names, stats, descriptions), the highlight color is browser-default blue. Razzle's brand colors are orange (#d97757) and espresso (#2d1f14). Every selection should feel on-brand.

## Where

- `frontend/styles.css` — zero `::selection` rules
- Affects every page sitewide

## Expected (per DESIGN.md)

Selection highlight should use brand accent (orange on sand, or orange-light on espresso in dark mode). Text on selection should remain readable.

## Fix

Add to `frontend/styles.css`:

```css
::selection {
  background: var(--orange);
  color: var(--bg-card);
}

[data-theme="dark"] ::selection {
  background: var(--orange-light);
  color: var(--ink);
}
```

4 lines of CSS. Zero risk.

## Verification

Select any text on the home page. Highlight should be orange, not blue.
