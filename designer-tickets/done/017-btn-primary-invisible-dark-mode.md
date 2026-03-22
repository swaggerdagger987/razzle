# DES-017: Primary buttons have invisible text in dark mode

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: Every CTA on the site — "Open the Lab", "Start Free Trial", "Upgrade to Pro" — has white text on orange background. In dark mode, `color: white` has no override. White on orange is technically readable but white is NOT the dark mode ink color (`#ede0cf` sand). More critically, this breaks the espresso flip design pattern and looks inconsistent with all other text on the page.

## The Problem

`frontend/styles.css` line 732:
```css
.btn-primary {
  background: var(--orange);
  color: white;  /* hardcoded — not var(--bg) or theme-aware */
}
```

No `[data-theme="dark"]` override exists for `.btn-primary`.

DESIGN.md says dark mode flips sand and espresso. Button text should use a CSS variable that responds to theme, not hardcoded `white`.

## The Fix

Add dark mode override in styles.css:
```css
[data-theme="dark"] .btn-primary {
  color: var(--bg);  /* flips to espresso in dark mode */
}
```

Or better: change line 732 from `color: white` to `color: #fff` with a dark mode rule, or use a CSS variable.

## Why This Matters

Every conversion CTA uses `.btn-primary`. If dark mode looks off on the most important buttons, it signals "unfinished product" to the exact power users who toggle dark mode.
