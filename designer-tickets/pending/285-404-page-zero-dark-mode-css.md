# DES-285: 404.html has zero dark mode page CSS

**Priority**: P2
**Page**: 404.html
**Affects**: Dark mode users who hit broken links or typos

## Problem

404.html has ZERO `[data-theme="dark"]` CSS rules. The page uses CSS variables that auto-flip, but the large `text-shadow: 4px 4px 0 var(--ink)` on the 404 code (line 45) will flip from espresso shadow on sand to sand shadow on espresso — visually reversed from the intended pop-out effect.

The 404 page is low-traffic, but dark mode users encountering a broken link see an unstyled page. This is the ONLY error page — it should match the polish of the rest of the site.

DES-187 covers about.html. This is a separate instance on the 404 page.

## Evidence

```bash
grep -c "\[data-theme" frontend/404.html
# Result: 0
```

## Fix

Add minimal `[data-theme="dark"]` overrides:
- `.four-oh-four-code` text-shadow should use a warm dark shadow (`rgba(237,224,207,0.3)` or similar) instead of flipped `var(--ink)`
- Verify card background and border colors flip correctly (they likely do via CSS vars)

## Why This Matters

Low priority relative to conversion pages, but the 404 page IS a brand touchpoint. Users who hit 404 are already frustrated — a broken-looking dark mode page compounds that. Quick fix.
